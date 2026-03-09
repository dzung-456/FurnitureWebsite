from fastapi import APIRouter, Depends, HTTPException
from app.models.order_model import Order
from app.models.order_item_model import OrderItem
from app.models.user_model import User
from app.models.product_model import Product
from app.db.base import get_db
from sqlalchemy.orm import Session, joinedload
from app.schemas.base_schema import DataResponse
from app.schemas.order_schema import OrderResponse
from datetime import datetime
import pytz
from app.middleware.authenticate import authenticate

router = APIRouter()

@router.get("/orders", tags=["orders"], description="Get all orders")
async def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(authenticate),
):
    try:
        query = db.query(Order)
        if getattr(current_user, "role", None) != "admin":
            query = query.filter(Order.user_id == current_user.id)
        orders = query.order_by(Order.id.desc()).all()
        
        # Manually load relationships
        result = []
        for order in orders:
            order_dict = {
                "id": order.id,
                "user_id": order.user_id,
                "order_date": order.order_date,
                "status": order.status,
                "subtotal_amount": order.subtotal_amount,
                "discount_amount": order.discount_amount,
                "shipping_fee": order.shipping_fee,
                "total_amount": order.total_amount,
                "payment_method": order.payment_method,
                "payment_status": order.payment_status,
                "paid_at": order.paid_at,
                "note": order.note,
                "shipping_fullname": order.shipping_fullname,
                "shipping_phone": order.shipping_phone,
                "shipping_email": order.shipping_email,
                "shipping_address": order.shipping_address,
                "shipping_city": order.shipping_city,
                "items": []
            }
            
            # Load order items
            items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
            for item in items:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                item_dict = {
                    "id": item.id,
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "price": item.price,
                    "product": {
                        "id": product.id,
                        "name": product.name,
                        "image": product.image
                    } if product else None
                }
                order_dict["items"].append(item_dict)
            
            result.append(order_dict)
        
        return DataResponse.custom_response(code="200", message="get all orders", data=result)
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders/{order_id}", tags=["orders"], description="Get order by id")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(authenticate),
):
    try:
        query = db.query(Order).filter(Order.id == order_id)
        if getattr(current_user, "role", None) != "admin":
            query = query.filter(Order.user_id == current_user.id)
        order = query.first()
        if not order:
            return DataResponse.custom_response(code="404", message="Order not found", data=None)
        
        order_dict = {
            "id": order.id,
            "user_id": order.user_id,
            "order_date": order.order_date,
            "status": order.status,
            "subtotal_amount": order.subtotal_amount,
            "discount_amount": order.discount_amount,
            "shipping_fee": order.shipping_fee,
            "total_amount": order.total_amount,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "paid_at": order.paid_at,
            "note": order.note,
            "shipping_fullname": order.shipping_fullname,
            "shipping_phone": order.shipping_phone,
            "shipping_email": order.shipping_email,
            "shipping_address": order.shipping_address,
            "shipping_city": order.shipping_city,
            "items": []
        }
        
        # Load order items
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for item in items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            item_dict = {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": item.price,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "image": product.image,
                    "price": product.price,
                    "sale_price": product.sale_price
                } if product else None
            }
            order_dict["items"].append(item_dict)
        
        return DataResponse.custom_response(code="200", message="Get order by id", data=order_dict)
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/orders/{order_id}/status", tags=["orders"], description="Update order status")
async def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(authenticate),
):
    try:
        if getattr(current_user, "role", None) != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return DataResponse.custom_response(code="404", message="Order not found", data=None)
        
        print(f"Updating order {order_id} status from {order.status} to {status}")

        now = datetime.now()
        order.status = status

        # Record timestamps per status (overwrite with latest transition time)
        if status == "processing":
            order.processing_at = now
        elif status == "shipped":
            order.shipped_at = now
        elif status == "delivered":
            order.delivered_at = now
            order.payment_status = "paid"
        elif status == "cancelled":
            order.cancelled_at = now
        
        db.commit()
        db.refresh(order)
        
        return DataResponse.custom_response(code="200", message="Update order status", data={
            "id": order.id,
            "status": order.status,
            "payment_status": order.payment_status
        })
    except Exception as e:
        print(f"Error updating order status: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.put(
    "/orders/{order_id}/payment-status",
    tags=["orders"],
    description="Update payment status",
)
async def update_payment_status(
    order_id: int,
    payment_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(authenticate),
):
    try:
        if getattr(current_user, "role", None) != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return DataResponse.custom_response(code="404", message="Order not found", data=None)

        now = datetime.now()
        order.payment_status = payment_status
        if payment_status == "paid":
            order.paid_at = now
        else:
            order.paid_at = None

        db.commit()
        db.refresh(order)

        return DataResponse.custom_response(
            code="200",
            message="Update payment status",
            data={
                "id": order.id,
                "payment_status": order.payment_status,
                "paid_at": order.paid_at,
            },
        )
    except Exception as e:
        print(f"Error updating payment status: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))