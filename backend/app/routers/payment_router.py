from __future__ import annotations

import hmac
import hashlib
import urllib.parse
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import get_db
from app.middleware.authenticate import authenticate
from app.models.order_model import Order
from app.schemas.base_schema import DataResponse
from app.utils.email_helper import send_order_confirmation_email


router = APIRouter(prefix="/payments", tags=["Payments"])


def _vnpay_hmac_sha512(secret: str, data: str) -> str:
    return hmac.new(secret.encode("utf-8"), data.encode("utf-8"), hashlib.sha512).hexdigest()


def _vnpay_build_query(params: Dict[str, Any]) -> str:
    # VNPay signature requires parameters sorted by key and URL-encoded values.
    items = [(k, str(v)) for k, v in params.items() if v is not None and str(v) != ""]
    items.sort(key=lambda x: x[0])
    return "&".join(
        [f"{k}={urllib.parse.quote_plus(v, safe='')}" for k, v in items]
    )


def _get_client_ip(request: Request) -> str:
    # If behind proxy, you may want to trust X-Forwarded-For. Keep simple for now.
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


class VNPayCreateRequest(BaseModel):
    order_id: int = Field(..., ge=1)


class VNPayConfirmRequest(BaseModel):
    params: Dict[str, Any]


class PayPalCreateRequest(BaseModel):
    order_id: int = Field(..., ge=1)


class PayPalCaptureRequest(BaseModel):
    order_id: int = Field(..., ge=1)
    paypal_order_id: str = Field(..., min_length=5)


@router.post("/vnpay/create", response_model=DataResponse)
def vnpay_create_payment(
    payload: VNPayCreateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(authenticate),
):
    if not settings.VNPAY_TMN_CODE or not settings.VNPAY_HASH_SECRET:
        raise HTTPException(status_code=500, detail="VNPay chưa được cấu hình (TMN_CODE/HASH_SECRET)")

    order = (
        db.query(Order)
        .filter(Order.id == payload.order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    # VNPay expects amount in VND * 100
    amount_vnd = int(round(float(order.total_amount or 0.0) * 100))
    if amount_vnd <= 0:
        raise HTTPException(status_code=400, detail="Số tiền thanh toán không hợp lệ")

    now = datetime.now()
    expire = now + timedelta(minutes=15)

    # In local/dev, returning to the frontend avoids ngrok browser interstitials.
    # Frontend will call /api/payments/vnpay/confirm to verify & persist payment.
    base_frontend = settings.FRONTEND_BASE_URL.rstrip("/")
    return_url = f"{base_frontend}/checkout?vnpay=1"

    vnp_params: Dict[str, Any] = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": settings.VNPAY_TMN_CODE,
        "vnp_Amount": amount_vnd,
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": str(order.id),
        "vnp_OrderInfo": f"Thanh toan don hang {order.id}",
        "vnp_OrderType": "other",
        "vnp_Locale": "vn",
        "vnp_ReturnUrl": return_url,
        "vnp_IpAddr": _get_client_ip(request),
        "vnp_CreateDate": now.strftime("%Y%m%d%H%M%S"),
        "vnp_ExpireDate": expire.strftime("%Y%m%d%H%M%S"),
    }

    query = _vnpay_build_query(vnp_params)
    secure_hash = _vnpay_hmac_sha512(settings.VNPAY_HASH_SECRET, query)

    payment_url = f"{settings.VNPAY_PAYMENT_URL}?{query}&vnp_SecureHash={secure_hash}"
    return DataResponse(code="200", message="OK", data={"payment_url": payment_url})


@router.post("/vnpay/confirm", response_model=DataResponse)
def vnpay_confirm_payment(
    payload: VNPayConfirmRequest,
    db: Session = Depends(get_db),
    current_user=Depends(authenticate),
):
    if not settings.VNPAY_HASH_SECRET:
        raise HTTPException(status_code=500, detail="VNPay chưa được cấu hình (HASH_SECRET)")

    raw_params = dict(payload.params or {})
    # Only verify on VNPay params; ignore app params (e.g. vnpay=1)
    params = {k: v for k, v in raw_params.items() if str(k).startswith("vnp_")}

    received_hash = str(params.get("vnp_SecureHash") or "")

    params.pop("vnp_SecureHash", None)
    params.pop("vnp_SecureHashType", None)

    order_id = params.get("vnp_TxnRef")
    response_code = params.get("vnp_ResponseCode")
    vnp_transaction_no = params.get("vnp_TransactionNo")
    vnp_bank_tran_no = params.get("vnp_BankTranNo")

    query = _vnpay_build_query(params)
    expected_hash = _vnpay_hmac_sha512((settings.VNPAY_HASH_SECRET or "").strip(), query)
    is_valid = received_hash and expected_hash and received_hash.lower() == expected_hash.lower()
    is_success = response_code == "00"

    if not order_id:
        raise HTTPException(status_code=400, detail="Thiếu vnp_TxnRef")

    order = (
        db.query(Order)
        .filter(Order.id == int(order_id), Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    if not is_valid:
        # Do not persist transaction fields if signature invalid
        raise HTTPException(status_code=400, detail="Chữ ký VNPay không hợp lệ")

    order.vnpay_response_code = response_code
    order.vnpay_transaction_no = vnp_transaction_no
    order.vnpay_bank_tran_no = vnp_bank_tran_no

    if is_success:
        order.payment_status = "paid"
        order.paid_at = datetime.now()
        order.status = "processing"
        if not getattr(order, "processing_at", None):
            order.processing_at = datetime.now()
    else:
        order.payment_status = "failed"

    db.commit()
    db.refresh(order)

    # Send order confirmation email for successful VNPay payment
    if is_success:
        try:
            send_order_confirmation_email(order, db)
        except Exception as email_error:
            print(f"Failed to send VNPay order confirmation email: {email_error}")
            # Don't fail the payment confirmation if email fails

    return DataResponse(
        code="200",
        message="OK",
        data={
            "valid": True,
            "success": bool(is_success),
            "order_id": int(order_id),
            "response_code": response_code or "",
        },
    )


@router.get("/vnpay/return", name="vnpay_return")
def vnpay_return(request: Request, db: Session = Depends(get_db)):
    # VNPay redirects the browser back here with query params.
    params = dict(request.query_params)

    received_hash = params.get("vnp_SecureHash", "")
    params.pop("vnp_SecureHash", None)
    params.pop("vnp_SecureHashType", None)

    query = _vnpay_build_query(params)
    expected_hash = _vnpay_hmac_sha512(settings.VNPAY_HASH_SECRET or "", query)

    order_id = params.get("vnp_TxnRef")
    response_code = params.get("vnp_ResponseCode")
    vnp_transaction_no = params.get("vnp_TransactionNo")
    vnp_bank_tran_no = params.get("vnp_BankTranNo")

    is_valid = received_hash and expected_hash and received_hash.lower() == expected_hash.lower()
    is_success = response_code == "00"

    if order_id and is_valid:
        order = db.query(Order).filter(Order.id == int(order_id)).first()
        if order:
            order.vnpay_response_code = response_code
            order.vnpay_transaction_no = vnp_transaction_no
            order.vnpay_bank_tran_no = vnp_bank_tran_no

            if is_success:
                # Payment successful
                order.payment_status = "paid"
                order.paid_at = datetime.now()
                # Keep existing behavior: move into processing
                order.status = "processing"
                if not getattr(order, "processing_at", None):
                    order.processing_at = datetime.now()
            else:
                # Payment failed (but signature valid)
                order.payment_status = "failed"
            db.commit()
            db.refresh(order)
            
            # Send order confirmation email for successful VNPay payment
            if is_success:
                try:
                    send_order_confirmation_email(order, db)
                except Exception as email_error:
                    print(f"Failed to send VNPay order confirmation email: {email_error}")
                    # Don't fail the payment confirmation if email fails

    # Redirect user back to frontend checkout page with status.
    base = settings.FRONTEND_BASE_URL.rstrip("/")
    status = "1" if (is_valid and is_success) else "0"
    code = response_code or ""
    oid = order_id or ""
    redirect_url = f"{base}/checkout?vnpay=1&success={status}&order_id={oid}&code={code}"

    from fastapi.responses import RedirectResponse

    return RedirectResponse(url=redirect_url, status_code=302)


async def _paypal_get_access_token() -> str:
    if not settings.PAYPAL_CLIENT_ID or not settings.PAYPAL_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="PayPal chưa được cấu hình (CLIENT_ID/CLIENT_SECRET)")

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{settings.PAYPAL_BASE_URL}/v1/oauth2/token",
            auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
            headers={"Accept": "application/json"},
            data={"grant_type": "client_credentials"},
        )
        if resp.status_code >= 400:
            raise HTTPException(status_code=502, detail="Không lấy được PayPal access token")
        data = resp.json()
        token = data.get("access_token")
        if not token:
            raise HTTPException(status_code=502, detail="PayPal access token không hợp lệ")
        return token


def _vnd_to_usd_str(amount_vnd: float) -> str:
    rate = float(settings.PAYPAL_VND_TO_USD or 25000)
    if rate <= 0:
        rate = 25000
    usd = (Decimal(str(amount_vnd or 0.0)) / Decimal(str(rate))).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    if usd <= 0:
        usd = Decimal("0.01")
    return format(usd, "f")


@router.post("/paypal/create", response_model=DataResponse)
async def paypal_create_order(
    payload: PayPalCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(authenticate),
):
    order = (
        db.query(Order)
        .filter(Order.id == payload.order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    access_token = await _paypal_get_access_token()

    base = settings.FRONTEND_BASE_URL.rstrip("/")
    return_url = f"{base}/checkout?paypal=1&order_id={order.id}"
    cancel_url = f"{base}/checkout?paypal=1&order_id={order.id}&cancel=1"

    body = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "custom_id": str(order.id),
                "amount": {
                    "currency_code": "USD",
                    "value": _vnd_to_usd_str(float(order.total_amount or 0.0)),
                },
                "description": f"Order {order.id}",
            }
        ],
        "application_context": {
            "return_url": return_url,
            "cancel_url": cancel_url,
            "brand_name": "Furniture",
            "landing_page": "LOGIN",
            "user_action": "PAY_NOW",
        },
    }

    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.post(
            f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json=body,
        )

    if resp.status_code >= 400:
        raise HTTPException(status_code=502, detail="Không tạo được PayPal order")

    data = resp.json()
    paypal_order_id = data.get("id")
    approve_url: Optional[str] = None
    for link in data.get("links", []) or []:
        if link.get("rel") == "approve":
            approve_url = link.get("href")
            break

    if not paypal_order_id or not approve_url:
        raise HTTPException(status_code=502, detail="PayPal response thiếu thông tin approve")

    # Persist PayPal order id on our Order for tracing
    order.paypal_order_id = str(paypal_order_id)
    db.commit()

    return DataResponse(
        code="200",
        message="OK",
        data={"paypal_order_id": paypal_order_id, "approve_url": approve_url},
    )


@router.post("/paypal/capture", response_model=DataResponse)
async def paypal_capture_order(
    payload: PayPalCaptureRequest,
    db: Session = Depends(get_db),
    current_user=Depends(authenticate),
):
    order = (
        db.query(Order)
        .filter(Order.id == payload.order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    access_token = await _paypal_get_access_token()

    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.post(
            f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders/{payload.paypal_order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
        )

    if resp.status_code >= 400:
        raise HTTPException(status_code=502, detail="Không capture được PayPal order")

    data = resp.json()
    status = data.get("status")

    # Best-effort extract capture id
    capture_id = None
    try:
        pu0 = (data.get("purchase_units") or [])[0] or {}
        payments = pu0.get("payments") or {}
        captures = payments.get("captures") or []
        if captures and isinstance(captures, list):
            capture_id = (captures[0] or {}).get("id")
    except Exception:
        capture_id = None

    # Best-effort: validate it belongs to this order via custom_id.
    purchase_units = data.get("purchase_units") or []
    custom_id = None
    if purchase_units and isinstance(purchase_units, list):
        custom_id = (purchase_units[0] or {}).get("custom_id")

    if custom_id and str(custom_id) != str(order.id):
        raise HTTPException(status_code=400, detail="PayPal order không khớp đơn hàng")

    if status == "COMPLETED":
        order.status = "processing"
        order.payment_status = "paid"
        order.paid_at = datetime.now()
        order.paypal_order_id = str(payload.paypal_order_id)
        if capture_id:
            order.paypal_capture_id = str(capture_id)
        db.commit()
        return DataResponse(code="200", message="OK", data={"status": "COMPLETED"})

    # Not completed => mark as failed (best-effort)
    order.paypal_order_id = str(payload.paypal_order_id)
    order.payment_status = "failed"
    db.commit()

    return DataResponse(code="200", message="OK", data={"status": status or "UNKNOWN"})
