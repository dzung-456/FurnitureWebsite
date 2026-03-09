from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.db.base import get_db
from app.middleware.authenticate import authenticate, require_admin
from app.models.user_model import User
from app.models.coupon_model import Coupon
from app.schemas.base_schema import DataResponse
from app.schemas.coupon_schema import (
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    ApplyCouponRequest,
    ApplyCouponResponse,
)


router = APIRouter(prefix="/coupons", tags=["coupons"])


def normalize_code(code: str) -> str:
    return (code or "").strip().upper()


def is_expired(coupon: Coupon) -> bool:
    if not coupon.expiry_date:
        return False
    return coupon.expiry_date < date.today()


@router.post("/", response_model=DataResponse[CouponResponse], description="Create coupon (admin)")
async def create_coupon(
    data: CouponCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):

    code = normalize_code(data.code)
    existing = db.query(Coupon).filter(Coupon.code == code).first()
    if existing:
        return DataResponse.custom_response(code="400", message="Coupon code already exists", data=existing)

    coupon = Coupon(
        code=code,
        discount_type=data.discount_type,
        discount_value=float(data.discount_value),
        min_order_value=float(data.min_order_value or 0),
        expiry_date=data.expiry_date,
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return DataResponse.custom_response(code="201", message="Created coupon", data=coupon)


@router.get("/", response_model=DataResponse[List[CouponResponse]], description="List coupons (admin)")
async def list_coupons(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    items = db.query(Coupon).order_by(Coupon.id.desc()).all()
    return DataResponse.custom_response(code="200", message="Get coupons successfully", data=items)


@router.get("/{coupon_id}", response_model=DataResponse[CouponResponse], description="Get coupon by id (admin)")
async def get_coupon(
    coupon_id: int,
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        return DataResponse.custom_response(code="404", message="Coupon not found", data=None)
    return DataResponse.custom_response(code="200", message="Get coupon successfully", data=coupon)


@router.put("/{coupon_id}", response_model=DataResponse[CouponResponse], description="Update coupon (admin)")
async def update_coupon(
    coupon_id: int,
    data: CouponUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):

    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        return DataResponse.custom_response(code="404", message="Coupon not found", data=None)

    if data.code is not None:
        new_code = normalize_code(data.code)
        existing = db.query(Coupon).filter(Coupon.code == new_code, Coupon.id != coupon_id).first()
        if existing:
            return DataResponse.custom_response(code="400", message="Coupon code already exists", data=coupon)
        coupon.code = new_code

    if data.discount_type is not None:
        coupon.discount_type = data.discount_type
    if data.discount_value is not None:
        coupon.discount_value = float(data.discount_value)
    if data.min_order_value is not None:
        coupon.min_order_value = float(data.min_order_value)
    if "expiry_date" in data.__fields_set__:
        coupon.expiry_date = data.expiry_date

    db.commit()
    db.refresh(coupon)
    return DataResponse.custom_response(code="200", message="Updated coupon", data=coupon)


@router.delete("/{coupon_id}", response_model=DataResponse[None], description="Delete coupon (admin)")
async def delete_coupon(
    coupon_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):

    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        return DataResponse.custom_response(code="404", message="Coupon not found", data=None)

    db.delete(coupon)
    db.commit()
    return DataResponse.custom_response(code="200", message="Deleted coupon", data=None)


@router.post("/apply", response_model=DataResponse[ApplyCouponResponse], description="Apply coupon to an order amount")
async def apply_coupon(
    payload: ApplyCouponRequest,
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db),
):
    # User must be logged in to apply coupon in this app
    _ = current_user

    code = normalize_code(payload.code)
    coupon = db.query(Coupon).filter(Coupon.code == code).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Không tìm thấy mã giảm giá")

    if is_expired(coupon):
        raise HTTPException(status_code=400, detail="Mã giảm giá đã hết hạn")

    order_amount = float(payload.order_amount or 0)
    if order_amount < float(coupon.min_order_value or 0):
        raise HTTPException(status_code=400, detail="Giá trị đơn hàng không đủ điều kiện")
    discount_amount = 0.0
    if coupon.discount_type == "percent":
        discount_amount = order_amount * (float(coupon.discount_value or 0) / 100.0)
    elif coupon.discount_type == "fixed":
        discount_amount = float(coupon.discount_value or 0)

    discount_amount = max(0.0, min(discount_amount, order_amount))
    final_amount = max(0.0, order_amount - discount_amount)

    data = ApplyCouponResponse(
        code=coupon.code,
        discount_type=coupon.discount_type,
        discount_value=float(coupon.discount_value or 0),
        min_order_value=float(coupon.min_order_value or 0),
        expiry_date=coupon.expiry_date,
        order_amount=order_amount,
        discount_amount=discount_amount,
        final_amount=final_amount,
    )

    return DataResponse.custom_response(code="200", message="Applied coupon", data=data)
