from app.models.base_model import BaseModel
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, Float, DateTime, Integer, ForeignKey
from datetime import datetime

class Product(BaseModel):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    description = Column(String(1000), index=False)
    short_description = Column(String(500), index=False)
    price = Column(Float, index=True)
    sale_price = Column(Float, index=True, default=0.0)
    quantity = Column(Integer, index=True, default=0)
    average_rating = Column(Float, index=True, default=0.0)
    tags = Column(String(500), index=False)
    image = Column(String(500), index=False, nullable=True)
    created_at = Column(DateTime, index=True, default=datetime.now)
    deleted_at = Column(DateTime, index=True, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="products")

    reviews = relationship("Review", back_populates="product")
    wishlist = relationship("Wishlist", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
