from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime


class OrderItem(BaseModel):
    __tablename__ = "order_items"
    __allow_unmapped__ = True

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), index=True, nullable=False)

    quantity = Column(Integer, default=1, nullable=False)
    price = Column(Float, default=0.0, nullable=False)

    created_at = Column(DateTime, default=datetime.now, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
