from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.products_schema import ProductSchema

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductSchema] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    user_id: int
    order_date: datetime
    status: str

    processing_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None

    subtotal_amount: float
    discount_amount: float
    shipping_fee: float
    total_amount: float

    payment_method: str
    payment_status: str
    paid_at: Optional[datetime] = None

    vnpay_response_code: Optional[str] = None
    vnpay_transaction_no: Optional[str] = None
    vnpay_bank_tran_no: Optional[str] = None

    paypal_order_id: Optional[str] = None
    paypal_capture_id: Optional[str] = None

    note: Optional[str] = None
    coupon_code: Optional[str] = None

    shipping_fullname: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_email: Optional[str] = None

    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class CreateOrderRequest(BaseModel):
    shipping_fullname: str = Field(..., min_length=1)
    shipping_phone: str = Field(..., min_length=1)
    shipping_address: str = Field(..., min_length=1)
    shipping_city: Optional[str] = None
    shipping_email: Optional[str] = None

    payment_method: str = Field("cod")
    note: Optional[str] = None

    coupon_code: Optional[str] = None
    shipping_fee: float = Field(50000.0, ge=0)
