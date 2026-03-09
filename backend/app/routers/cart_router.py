from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload
from app.db.base import get_db
from app.middleware.authenticate import authenticate
from app.models.user_model import User
from app.models.product_model import Product
from app.models.cart_model import Cart
from app.models.cart_item_model import CartItem
from app.schemas.base_schema import DataResponse
from app.schemas.cart_schema import (
    CartResponse,
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,
)

router = APIRouter(
    prefix="/cart",
    tags=["cart"],
)


def _get_or_create_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if cart:
        return cart
    cart = Cart(user_id=user_id)
    db.add(cart)
    db.commit()
    db.refresh(cart)
    return cart


@router.get("/", description="Get current user's cart", response_model=DataResponse[CartResponse])
async def get_cart(
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db),
):
    cart = _get_or_create_cart(db, current_user.id)

    cart = (
        db.query(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .filter(Cart.id == cart.id)
        .first()
    )

    return DataResponse.custom_response(code="200", message="Get cart successfully", data=cart)


@router.post(
    "/items",
    description="Add product to cart (merge quantities)",
    response_model=DataResponse[CartItemResponse],
)
async def add_to_cart(
    data: CartItemCreate,
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db),
):
    cart = _get_or_create_cart(db, current_user.id)

    product = (
        db.query(Product)
        .filter(Product.id == data.product_id)
        .filter(Product.deleted_at == None)
        .first()
    )
    if not product:
        return DataResponse.custom_response(code="404", message="Product not found", data=None)

    existing_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == data.product_id)
        .first()
    )

    if existing_item:
        existing_item.quantity = int(existing_item.quantity or 0) + int(data.quantity or 1)
        db.commit()
        db.refresh(existing_item)
        existing_item = (
            db.query(CartItem)
            .options(selectinload(CartItem.product))
            .filter(CartItem.id == existing_item.id)
            .first()
        )
        return DataResponse.custom_response(code="200", message="Updated cart item", data=existing_item)

    item = CartItem(cart_id=cart.id, product_id=data.product_id, quantity=data.quantity)
    db.add(item)
    db.commit()
    db.refresh(item)

    item = (
        db.query(CartItem)
        .options(selectinload(CartItem.product))
        .filter(CartItem.id == item.id)
        .first()
    )

    return DataResponse.custom_response(code="201", message="Added to cart", data=item)


@router.put(
    "/items/{item_id}",
    description="Update cart item quantity (0 = remove)",
    response_model=DataResponse[CartItemResponse],
)
async def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        return DataResponse.custom_response(code="404", message="Cart not found", data=None)

    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        return DataResponse.custom_response(code="404", message="Item not found", data=None)

    if data.quantity <= 0:
        db.delete(item)
        db.commit()
        return DataResponse.custom_response(code="200", message="Item removed", data=None)

    item.quantity = data.quantity
    db.commit()
    db.refresh(item)

    item = (
        db.query(CartItem)
        .options(selectinload(CartItem.product))
        .filter(CartItem.id == item.id)
        .first()
    )

    return DataResponse.custom_response(code="200", message="Item updated", data=item)


@router.delete(
    "/items/{item_id}",
    description="Remove an item from cart",
    response_model=DataResponse[None],
)
async def remove_cart_item(
    item_id: int,
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        return DataResponse.custom_response(code="404", message="Cart not found", data=None)

    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        return DataResponse.custom_response(code="404", message="Item not found", data=None)

    db.delete(item)
    db.commit()
    return DataResponse.custom_response(code="200", message="Item removed", data=None)


@router.delete(
    "/clear",
    description="Clear current user's cart",
    response_model=DataResponse[None],
)
async def clear_cart(
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        return DataResponse.custom_response(code="200", message="Cart cleared", data=None)

    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    return DataResponse.custom_response(code="200", message="Cart cleared", data=None)
