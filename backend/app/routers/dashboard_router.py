from fastapi import APIRouter, Depends, HTTPException
from app.models.order_model import Order
from app.models.order_item_model import OrderItem
from app.models.user_model import User
from app.models.product_model import Product
from app.db.base import get_db
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.base_schema import DataResponse

router = APIRouter()

@router.get("/dashboard/stats", tags=["dashboard"], description="Get dashboard statistics")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    try:
        # Count totals
        total_products = db.query(Product).filter(Product.deleted_at == None).count()
        total_users = db.query(User).filter(User.deleted_at == None).count()
        total_orders = db.query(Order).count()
        
        # Calculate total revenue (from paid/delivered orders)
        total_revenue = db.query(func.sum(Order.total_amount))\
            .filter(Order.payment_status == 'paid')\
            .scalar() or 0
        
        # Top 5 best selling products (from all paid orders)
        top_products = db.query(
            Product.id,
            Product.name,
            Product.image,
            Product.price,
            Product.sale_price,
            func.sum(OrderItem.quantity).label('total_sold')
        ).join(OrderItem, Product.id == OrderItem.product_id)\
         .join(Order, OrderItem.order_id == Order.id)\
         .filter(Order.payment_status == 'paid')\
         .group_by(Product.id)\
         .order_by(func.sum(OrderItem.quantity).desc())\
         .limit(5).all()
        
        # Format top products
        top_products_data = []
        for product in top_products:
            top_products_data.append({
                "id": product.id,
                "name": product.name,
                "image": product.image,
                "price": product.price,
                "sale_price": product.sale_price,
                "total_sold": product.total_sold
            })
        
        stats = {
            "total_products": total_products,
            "total_users": total_users,
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "top_products": top_products_data
        }
        
        return DataResponse.custom_response(code="200", message="Get dashboard stats", data=stats)
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))