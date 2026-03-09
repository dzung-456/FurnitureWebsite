from app.models.base_model import BaseModel
from sqlalchemy import Column, String, Float, DateTime, Date
from sqlalchemy import Enum
from datetime import datetime


class Coupon(BaseModel):
    __tablename__ = "coupons"
    __allow_unmapped__ = True

    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_type = Column(
        Enum("percent", "fixed", name="coupon_discount_type"),
        nullable=False,
        default="percent",
    )
    discount_value = Column(Float, nullable=False, default=0.0)
    min_order_value = Column(Float, nullable=False, default=0.0)
    expiry_date = Column(Date, nullable=True)

    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
