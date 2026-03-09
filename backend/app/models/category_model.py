from app.models.base_model import BaseModel
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship

class Category(BaseModel):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    description = Column(String(500), index=False)
    products = relationship("Product", back_populates="category")