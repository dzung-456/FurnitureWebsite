from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

class Wishlist(BaseModel):
    __tablename__ = "wishlist"
    __allow_unmapped__ = True

    # wishlist_id: int = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.now)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))

    user = relationship("User", back_populates="wishlist")
    product = relationship("Product", back_populates="wishlist")
