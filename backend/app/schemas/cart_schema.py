from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from app.schemas.products_schema import ProductSchema


class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=0)


class CartItemResponse(BaseModel):
    id: int
    cart_id: int
    product_id: int
    quantity: int
    created_at: datetime
    updated_at: datetime

    product: Optional[ProductSchema] = None

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    items: List[CartItemResponse] = []

    class Config:
        from_attributes = True
