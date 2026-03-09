from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.models.wishlist_model import Wishlist
from app.models.user_model import User
from app.schemas.wishlist_schema import WishlistCreate, WishlistResponse
from app.schemas.base_schema import DataResponse
from app.middleware.authenticate import authenticate
from typing import List

router = APIRouter(
    prefix="/wishlist",
    tags=["wishlist"]
)

@router.post("/", description="Add product to wishlist", response_model=DataResponse[WishlistResponse])
async def add_to_wishlist(
    data: WishlistCreate,
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db)
):
    # Check if already exists
    existing_item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == data.product_id
    ).first()
    
    if existing_item:
        return DataResponse.custom_response(code="400", message="Product already in wishlist", data=existing_item)

    wishlist_item = Wishlist(
        user_id=current_user.id,
        product_id=data.product_id
    )
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)
    return DataResponse.custom_response(code="201", message="Added to wishlist", data=wishlist_item)

from sqlalchemy.orm import Session, joinedload

# ... imports ...

@router.get("/", description="Get user wishlist", response_model=DataResponse[List[WishlistResponse]])
async def get_wishlist(
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db)
):
    items = db.query(Wishlist).options(joinedload(Wishlist.product)).filter(Wishlist.user_id == current_user.id).all()
    return DataResponse.custom_response(code="200", message="Get wishlist successfully", data=items)

@router.delete("/{id}", description="Remove from wishlist", response_model=DataResponse[None])
async def remove_from_wishlist(
    id: int,
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db)
):
    item = db.query(Wishlist).filter(
        Wishlist.id == id,
        Wishlist.user_id == current_user.id
    ).first()
    if not item:
        return DataResponse.custom_response(code="404", message="Item not found", data=None)
        
    db.delete(item)
    db.commit()
    return DataResponse.custom_response(code="200", message="Removed from wishlist", data=None)

@router.delete("/product/{product_id}", description="Remove product from wishlist", response_model=DataResponse[None])
async def remove_product_from_wishlist(
    product_id: int,
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db)
):
    item = db.query(Wishlist).filter(
        Wishlist.product_id == product_id, 
        Wishlist.user_id == current_user.id
    ).first()
    
    if not item:
        return DataResponse.custom_response(code="404", message="Item not found", data=None)
        
    db.delete(item)
    db.commit()
    return DataResponse.custom_response(code="200", message="Removed from wishlist", data=None)
