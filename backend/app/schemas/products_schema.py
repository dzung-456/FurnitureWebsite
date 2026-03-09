from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

class CategorySchema(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

class ProductSchema(BaseModel):
    id: int
    name: str
    description: str
    short_description: str
    price: float
    sale_price: float
    quantity: int
    average_rating: float
    tags: str
    image: Optional[str] = None
    created_at: datetime
    deleted_at: Optional[datetime]
    category_id: Optional[int]
    category: Optional[CategorySchema] = None

    class Config:
        from_attributes = True

class CreateProductSchema(BaseModel):
    name: str
    description: str
    short_description: str
    price: float
    sale_price: Optional[float] = 0.0
    quantity: Optional[int] = 0
    tags: str
    image: Optional[str] = None
    category_id: Optional[int] = None

    @field_validator('sale_price')
    def validate_sale_price(cls, v, info):
        if 'price' in info.data and v > 0 and v >= info.data['price']:
            raise ValueError('Giá sale phải nhỏ hơn giá gốc')
        return v

class UpdateProductSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = None
    sale_price: Optional[float] = None
    quantity: Optional[int] = None
    tags: Optional[str] = None
    image: Optional[str] = None

    @field_validator('sale_price')
    def validate_sale_price(cls, v, info):
        if v is not None and 'price' in info.data and info.data['price'] is not None:
            if v > 0 and v >= info.data['price']:
                raise ValueError('Giá sale phải nhỏ hơn giá gốc')
        return v
