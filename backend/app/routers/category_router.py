from fastapi import APIRouter, Depends
from app.db.base import get_db
from sqlalchemy.orm import Session
from app.models.category_model import Category
from app.schemas.base_schema import DataResponse
from pydantic import BaseModel

class CategorySchema(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

router = APIRouter(
    prefix="/categories",
    tags=["categories"]
)

@router.get("/", description="Get all categories", response_model=DataResponse[list[CategorySchema]])
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return DataResponse.custom_response(code="200", message="get all categories", data=categories)

@router.get("/{category_id}", description="Get category by ID", response_model=DataResponse[CategorySchema])
async def get_category_by_id(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    return DataResponse.custom_response(code="200", message="get category by id", data=category)