from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime

from app.db.base import get_db
from app.middleware.authenticate import authenticate
from app.models.cart_model import Cart
from app.models.order_model import Order
from app.models.order_item_model import OrderItem
from app.models.coupon_model import Coupon
from app.schemas.order_schema import CreateOrderRequest, OrderResponse
from app.schemas.base_schema import DataResponse
from app.utils.email_helper import send_order_confirmation_email


router = APIRouter(prefix="/checkout", tags=["Checkout"])


def _normalize_code(code: str) -> str:
    return str(code or "").strip().upper()


def _is_expired(coupon: Coupon) -> bool:
    if not coupon.expiry_date:
        return False
    return coupon.expiry_date < date.today()


def _get_unit_price(product) -> float:
    sale = float(getattr(product, "sale_price", 0) or 0)
    price = float(getattr(product, "price", 0) or 0)
    return sale if sale > 0 else price


@router.post("/", response_model=DataResponse)
def create_order(payload: CreateOrderRequest, db: Session = Depends(get_db), current_user=Depends(authenticate)):
    try:
        cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
        if not cart or not cart.items or len(cart.items) == 0:
            raise HTTPException(status_code=400, detail="Cart is empty")

        subtotal = 0.0
        for item in cart.items:
            if not item.product:
                continue
            unit = _get_unit_price(item.product)
            subtotal += float(unit) * int(item.quantity)

        discount_amount = 0.0
        normalized_coupon = _normalize_code(payload.coupon_code) if payload.coupon_code else ""
        if normalized_coupon:
            coupon = db.query(Coupon).filter(Coupon.code == normalized_coupon).first()
            if not coupon:
                raise HTTPException(status_code=404, detail="Không tìm thấy mã giảm giá")
            if _is_expired(coupon):
                raise HTTPException(status_code=400, detail="Mã giảm giá đã hết hạn")
            if subtotal < float(coupon.min_order_value or 0):
                raise HTTPException(status_code=400, detail="Giá trị đơn hàng không đủ điều kiện")

            if coupon.discount_type == "percent":
                discount_amount = subtotal * (float(coupon.discount_value or 0) / 100.0)
            elif coupon.discount_type == "fixed":
                discount_amount = float(coupon.discount_value or 0)

            discount_amount = max(0.0, min(discount_amount, subtotal))

        shipping_fee = float(payload.shipping_fee or 0.0)
        total_amount = max(0.0, subtotal - discount_amount) + shipping_fee

        order = Order(
            user_id=current_user.id,
            status="pending",
            subtotal_amount=subtotal,
            discount_amount=discount_amount,
            shipping_fee=shipping_fee,
            total_amount=total_amount,
            payment_method=payload.payment_method,
            payment_status="unpaid",
            note=payload.note,
            coupon_code=(normalized_coupon if normalized_coupon else None),
            shipping_fullname=payload.shipping_fullname,
            shipping_phone=payload.shipping_phone,
            shipping_address=payload.shipping_address,
            shipping_city=payload.shipping_city,
            shipping_email=payload.shipping_email,
        )

        db.add(order)
        db.flush()  # ensures order.id

        for item in cart.items:
            if not item.product:
                continue
            db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    price=float(_get_unit_price(item.product)),
                )
            )

        # Clear cart
        for item in list(cart.items):
            db.delete(item)

        db.commit()
        db.refresh(order)

        # Send order confirmation email for COD only
        # For VNPay, email will be sent after payment confirmation
        if order.payment_method == "cod":
            try:
                send_order_confirmation_email(order, db)
            except Exception as email_error:
                print(f"Failed to send order confirmation email: {email_error}")
                # Don't fail the order creation if email fails

        return DataResponse(code="200", message="Order created", data=OrderResponse.model_validate(order))

    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        print(f"Error creating order: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")


@router.get("/orders", response_model=DataResponse[list[OrderResponse]])
def get_user_orders(
    status: str = None,
    db: Session = Depends(get_db),
    current_user=Depends(authenticate),
):
    query = db.query(Order).filter(Order.user_id == current_user.id)
    
    if status:
        if status == "history":
            # Only show completed purchases in history
            query = query.filter(Order.status == "delivered", Order.payment_status == "paid")
        elif status == "status":
            # Everything else stays in the status tab (including shipped/cancelled)
            query = query.filter(~((Order.status == "delivered") & (Order.payment_status == "paid")))
        # else: ignore or exact match? adhering to current logic
        
    orders = query.order_by(Order.order_date.desc()).all()
    return DataResponse(
        code="200", 
        message="Orders fetched successfully", 
        data=[OrderResponse.model_validate(o) for o in orders]
    )


@router.get("/orders/{order_id}", response_model=DataResponse[OrderResponse])
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(authenticate),
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Đơn hàng không tồn tại")
        
    return DataResponse(
        code="200", 
        message="Order detail fetched successfully", 
        data=OrderResponse.model_validate(order)
    )


@router.put("/orders/{order_id}/cancel", response_model=DataResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(authenticate),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Đơn hàng không tồn tại")

    if order.status not in ["pending", "processing"]:
        raise HTTPException(status_code=400, detail="Đơn hàng không thể hủy ở trạng thái hiện tại")

    order.status = "cancelled"
    order.cancelled_at = datetime.now()

    db.commit()
    db.refresh(order)

    return DataResponse(
        code="200",
        message="Order cancelled successfully",
        data=OrderResponse.model_validate(order),
    )
