from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
from app.db.base import get_db
from app.models.review_model import Review
from app.models.product_model import Product
from app.models.user_model import User
from app.schemas.review_schema import ReviewCreate, ReviewResponse, ReviewUpdate
from app.schemas.base_schema import DataResponse
from app.middleware.authenticate import authenticate
from typing import List

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"]
)


def _recalculate_product_average_rating(db: Session, product_id: int) -> None:
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.product_id == product_id).scalar()
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return
    product.average_rating = float(avg_rating) if avg_rating is not None else 0.0

@router.post("/", description="Create a new review", response_model=DataResponse[ReviewResponse])
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db)
):
    # Check if user already reviewed this product? (Optional, maybe allow multiple)
    # For now allow multiple.
    
    product = db.query(Product).filter(Product.id == review_data.product_id).first()
    if not product:
        return DataResponse.custom_response(code="404", message="Product not found", data=None)

    review = Review(
        user_id=current_user.id,
        product_id=review_data.product_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(review)
    db.flush()
    _recalculate_product_average_rating(db, review_data.product_id)
    db.commit()
    review_with_user = (
        db.query(Review)
        .options(selectinload(Review.user))
        .filter(Review.id == review.id)
        .first()
    )
    return DataResponse.custom_response(
        code="201",
        message="Review created successfully",
        data=review_with_user or review,
    )

@router.get("/product/{product_id}", description="Get reviews for a product", response_model=DataResponse[List[ReviewResponse]])
async def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .options(selectinload(Review.user))
        .filter(Review.product_id == product_id)
        .all()
    )
    return DataResponse.custom_response(code="200", message="Get reviews successfully", data=reviews)


@router.put("/{review_id}", description="Update a review", response_model=DataResponse[ReviewResponse])
async def update_review(
    review_id: int,
    data: ReviewUpdate,
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        return DataResponse.custom_response(code="404", message="Review not found", data=None)

    if review.user_id != current_user.id and current_user.role != 'admin':
        return DataResponse.custom_response(code="403", message="Not authorized to update this review", data=None)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(review, key, value)

    db.flush()
    _recalculate_product_average_rating(db, review.product_id)
    db.commit()
    review_with_user = (
        db.query(Review)
        .options(selectinload(Review.user))
        .filter(Review.id == review.id)
        .first()
    )
    return DataResponse.custom_response(
        code="200",
        message="Review updated successfully",
        data=review_with_user or review,
    )

@router.delete("/{review_id}", description="Delete a review", response_model=DataResponse[None])
async def delete_review(
    review_id: int, 
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        return DataResponse.custom_response(code="404", message="Review not found", data=None)
    
    # Allow admin or owner to delete
    if review.user_id != current_user.id and current_user.role != 'admin':
        return DataResponse.custom_response(code="403", message="Not authorized to delete this review", data=None)
        
    product_id = review.product_id
    db.delete(review)
    db.flush()
    _recalculate_product_average_rating(db, product_id)
    db.commit()
    return DataResponse.custom_response(code="200", message="Review deleted successfully", data=None)
