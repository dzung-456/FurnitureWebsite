from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime


class Cart(BaseModel):
    __tablename__ = "carts"
    __allow_unmapped__ = True

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # One cart per user
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True, nullable=False)

    user = relationship("User", back_populates="cart")
    items = relationship(
        "CartItem",
        back_populates="cart",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
