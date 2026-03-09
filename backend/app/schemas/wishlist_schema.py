from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.products_schema import ProductSchema

class WishlistBase(BaseModel):
    product_id: int

class WishlistCreate(WishlistBase):
    pass

class WishlistResponse(WishlistBase):
    id: int
    user_id: int
    created_at: datetime
    product: Optional[ProductSchema] = None
    
    class Config:
        from_attributes = True
