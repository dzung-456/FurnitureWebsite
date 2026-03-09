from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date, datetime


DiscountType = Literal["percent", "fixed"]


class CouponBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    discount_type: DiscountType = "percent"
    discount_value: float = Field(..., ge=0)
    min_order_value: float = Field(default=0, ge=0)
    expiry_date: Optional[date] = None


class CouponCreate(CouponBase):
    pass


class CouponUpdate(BaseModel):
    code: Optional[str] = Field(default=None, min_length=1, max_length=50)
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[float] = Field(default=None, ge=0)
    min_order_value: Optional[float] = Field(default=None, ge=0)
    expiry_date: Optional[date] = None


class CouponResponse(BaseModel):
    id: int
    code: str
    discount_type: DiscountType
    discount_value: float
    min_order_value: float
    expiry_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApplyCouponRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    order_amount: float = Field(..., ge=0)


class ApplyCouponResponse(BaseModel):
    code: str
    discount_type: DiscountType
    discount_value: float
    min_order_value: float
    expiry_date: Optional[date] = None

    order_amount: float
    discount_amount: float
    final_amount: float
