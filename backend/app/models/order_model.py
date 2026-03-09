from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Float, String, Text
from sqlalchemy import Enum
from sqlalchemy.orm import relationship
from datetime import datetime


class Order(BaseModel):
    __tablename__ = "orders"
    __allow_unmapped__ = True

    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    order_date = Column(DateTime, default=datetime.now, nullable=False)
    status = Column(
        Enum(
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            name="order_status",
        ),
        default="pending",
        nullable=False,
    )

    processing_at = Column(DateTime, nullable=True)
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)

    subtotal_amount = Column(Float, default=0.0, nullable=False)
    discount_amount = Column(Float, default=0.0, nullable=False)
    shipping_fee = Column(Float, default=0.0, nullable=False)
    total_amount = Column(Float, default=0.0, nullable=False)

    payment_method = Column(
        Enum("cod", "bank_transfer", "paypal", name="payment_method"),
        default="cod",
        nullable=False,
    )

    payment_status = Column(
        Enum("unpaid", "paid", "failed", name="payment_status"),
        default="unpaid",
        nullable=False,
    )
    paid_at = Column(DateTime, nullable=True)

    # Payment provider metadata (best-effort)
    vnpay_response_code = Column(String(10), nullable=True)
    vnpay_transaction_no = Column(String(50), nullable=True)
    vnpay_bank_tran_no = Column(String(50), nullable=True)

    paypal_order_id = Column(String(50), nullable=True)
    paypal_capture_id = Column(String(50), nullable=True)

    note = Column(Text, nullable=True)
    coupon_code = Column(String(50), nullable=True)

    shipping_fullname = Column(String(100), nullable=True)
    shipping_phone = Column(String(20), nullable=True)
    shipping_address = Column(String(255), nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_email = Column(String(100), nullable=True)

    user = relationship("User", back_populates="orders")
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
