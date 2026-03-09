from app.models.base_model import BaseModel
from sqlalchemy import Column, String, Float, DateTime, Integer
from datetime import datetime
import pytz

from sqlalchemy import Enum
from sqlalchemy.orm import relationship

vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
now_vn = datetime.now(vn_tz)
class User(BaseModel):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    role = Column(Enum('customer', 'admin', name='user_roles'), default='customer', nullable=False)
    avatar = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=now_vn, nullable=False)
    updated_at = Column(DateTime, default=now_vn, onupdate=now_vn, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    status = Column(Enum('active', 'banned', name='user_status'), default='active', nullable=False)
    
    reviews = relationship("Review", back_populates="user")
    wishlist = relationship("Wishlist", back_populates="user")
    cart = relationship("Cart", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")
