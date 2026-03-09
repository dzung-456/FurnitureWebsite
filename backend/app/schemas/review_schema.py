from pydantic import BaseModel, conint
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    rating: conint(ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    product_id: int

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None

class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    username: Optional[str] = None
    product_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
