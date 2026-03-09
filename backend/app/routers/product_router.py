from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from app.db.base import get_db
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.product_model import Product
from app.models.order_item_model import OrderItem
from app.models.order_model import Order
from app.schemas.products_schema import CreateProductSchema, ProductSchema, UpdateProductSchema
from app.schemas.base_schema import DataResponse
from datetime import datetime, timedelta
from app.middleware.authenticate import require_admin
from app.models.user_model import User
import os
import shutil
from typing import Optional
from pathlib import Path


router = APIRouter(
    prefix="/products",
    tags=["products"]
)

# Lưu ảnh vào thư mục static của frontend để có thể serve trực tiếp
PROJECT_ROOT = Path(__file__).resolve().parents[3]
UPLOAD_DIR = PROJECT_ROOT / "frontend" / "public" / "uploads" / "products"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/", description="Get all products", response_model=DataResponse[list[ProductSchema]])
async def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.deleted_at == None).all()
    return DataResponse.custom_response(code="200", message="get all products", data=products)


@router.get(
    "/best-sellers",
    description="Get best-selling products (weekly or all-time)",
    response_model=DataResponse[list[ProductSchema]],
)
async def get_best_sellers(period: str = "week", limit: int = 4, db: Session = Depends(get_db)):
    if limit <= 0:
        raise HTTPException(status_code=400, detail="limit must be > 0")

    period_normalized = (period or "").strip().lower()
    if period_normalized not in {"week", "all"}:
        raise HTTPException(status_code=400, detail="period must be 'week' or 'all'")

    query = (
        db.query(Product)
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Product.deleted_at == None)
        # Count real orders: exclude cancelled and failed payments
        .filter(Order.payment_status == "paid")
    )

    if period_normalized == "week":
        now = datetime.now()
        start_of_week = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        query = query.filter(Order.order_date >= start_of_week)

    products = (
        query.group_by(Product.id)
        .order_by(desc(func.sum(OrderItem.quantity)))
        .limit(limit)
        .all()
    )

    return DataResponse.custom_response(
        code="200",
        message=f"get best sellers period={period_normalized}",
        data=products,
    )

@router.post("/", description="Create a new product", response_model=DataResponse[ProductSchema])
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    short_description: str = Form(...),
    price: float = Form(...),
    sale_price: float = Form(0.0),
    quantity: int = Form(0),
    tags: str = Form(...),
    category_id: Optional[int] = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    try:
        # Validate sale_price
        if sale_price > 0 and sale_price >= price:
            raise HTTPException(status_code=400, detail="Giá sale phải nhỏ hơn giá gốc")
        
        image_path = None
        if file and file.filename:
            filename = f"{datetime.now().timestamp()}_{file.filename}"
            filepath = UPLOAD_DIR / filename
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            image_path = filename
        
        db_product = Product(
            name=name,
            description=description,
            short_description=short_description,
            price=price,
            sale_price=sale_price,
            quantity=quantity,
            tags=tags,
            image=image_path,
            category_id=category_id
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return DataResponse.custom_response(code="201", message="create product", data=db_product)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}", description="Get a product by id", response_model=DataResponse[ProductSchema])
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return DataResponse.custom_response(code="404", message="Product not found", data=None)
    return DataResponse.custom_response(code="200", message="Get product by id", data=product)

@router.delete("/{product_id}", description="Delete a product by id", response_model=DataResponse[ProductSchema])
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return DataResponse.custom_response(code="404", message="Product not found", data=None)
    
    product.deleted_at = datetime.now()
    db.commit()
    return DataResponse.custom_response(code="200", message="Delete product by id", data=None)

@router.put("/{product_id}", description="Update a product by id", response_model=DataResponse[ProductSchema])
async def update_product(
    product_id: int,
    name: str = Form(None),
    description: str = Form(None),
    short_description: str = Form(None),
    price: float = Form(None),
    sale_price: float = Form(None),
    quantity: int = Form(None),
    tags: str = Form(None),
    category_id: Optional[int] = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return DataResponse.custom_response(code="404", message="Product not found", data=None)
        
        # Update fields if provided
        if name is not None:
            product.name = name
        if description is not None:
            product.description = description
        if short_description is not None:
            product.short_description = short_description
        if price is not None:
            product.price = price
        if sale_price is not None:
            if sale_price > 0 and price and sale_price >= price:
                raise HTTPException(status_code=400, detail="Giá sale phải nhỏ hơn giá gốc")
            product.sale_price = sale_price
        if quantity is not None:
            product.quantity = quantity
        if tags is not None:
            product.tags = tags
        if category_id is not None:
            product.category_id = category_id
        
        # Handle image upload
        if file and file.filename:
            filename = f"{datetime.now().timestamp()}_{file.filename}"
            filepath = UPLOAD_DIR / filename
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            product.image = filename
        
        db.commit()
        db.refresh(product)
        return DataResponse.custom_response(code="200", message="Update product by id", data=product)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))