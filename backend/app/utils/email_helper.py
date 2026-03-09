"""Helper functions for email formatting and template loading"""
import os
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.order_model import Order


def get_template_path(template_name: str) -> Path:
    """Get absolute path to email template"""
    base_dir = Path(__file__).parent.parent
    return base_dir / "templates" / template_name


def format_order_confirmation_email(order: Order) -> tuple:
    """
    Format order confirmation email content
    Returns: (subject, html_content)
    """
    try:
        # Get customer email
        customer_email = order.shipping_email or (order.user.email if order.user else None)
        if not customer_email:
            print("No email address found for order confirmation")
            return None, None

        # Build order items rows
        items_rows = ""
        for item in order.items:
            if not item.product:
                continue
            product_name = item.product.name
            quantity = item.quantity
            price = item.price
            subtotal = price * quantity
            
            items_rows += f"""
                <tr>
                    <td>{product_name}</td>
                    <td>{quantity}</td>
                    <td>{price:,.0f}₫</td>
                    <td>{subtotal:,.0f}₫</td>
                </tr>
            """

        # Format values
        order_date_str = order.order_date.strftime("%d/%m/%Y %H:%M") if order.order_date else datetime.now().strftime("%d/%m/%Y %H:%M")
        
        payment_method_map = {
            "cod": "Thanh toán khi nhận hàng (COD)",
            "vnpay": "VNPay",
            "bank_transfer": "Chuyển khoản ngân hàng (VNPay)",
            "paypal": "PayPal"
        }
        payment_method_name = payment_method_map.get(order.payment_method, order.payment_method)

        payment_status_class = "status-paid" if order.payment_status == "paid" else "status-pending"
        payment_status_text = "Đã thanh toán" if order.payment_status == "paid" else "Chưa thanh toán"

        # Discount section
        discount_row = ""
        if order.discount_amount and order.discount_amount > 0:
            discount_row = f"""
                <tr>
                    <td colspan="3" style="text-align: right; padding-right: 20px; color: #4caf50;"><strong>Giảm giá ({order.coupon_code or 'Mã giảm giá'}):</strong></td>
                    <td style="color: #4caf50;"><strong>-{order.discount_amount:,.0f}₫</strong></td>
                </tr>
            """

        # Note section
        note_section = ""
        if order.note:
            note_section = f"""
            <div class="order-info">
                <h3>📝 Ghi chú</h3>
                <p>{order.note}</p>
            </div>
            """

        # Load template
        template_path = get_template_path("email_order_confirmation.html")
        with open(template_path, "r", encoding="utf-8") as f:
            html_template = f.read()

        # Replace placeholders
        html_content = html_template.replace("{{customer_name}}", order.shipping_fullname)
        html_content = html_content.replace("{{order_id}}", str(order.id))
        html_content = html_content.replace("{{order_date}}", order_date_str)
        html_content = html_content.replace("{{payment_status_class}}", payment_status_class)
        html_content = html_content.replace("{{payment_status}}", payment_status_text)
        html_content = html_content.replace("{{payment_method}}", payment_method_name)
        html_content = html_content.replace("{{shipping_fullname}}", order.shipping_fullname)
        html_content = html_content.replace("{{shipping_phone}}", order.shipping_phone)
        html_content = html_content.replace("{{shipping_address}}", f"{order.shipping_address}, {order.shipping_city or ''}")
        html_content = html_content.replace("{{order_items}}", items_rows)
        html_content = html_content.replace("{{subtotal}}", f"{order.subtotal_amount:,.0f}₫")
        html_content = html_content.replace("{{discount_row}}", discount_row)
        html_content = html_content.replace("{{shipping_fee}}", f"{order.shipping_fee:,.0f}₫")
        html_content = html_content.replace("{{total_amount}}", f"{order.total_amount:,.0f}₫")
        html_content = html_content.replace("{{note_section}}", note_section)

        subject = f"Xác nhận đơn hàng #{order.id} - FurnitureWebsite"
        
        return customer_email, subject, html_content

    except Exception as e:
        print(f"Error formatting order confirmation email: {e}")
        import traceback
        traceback.print_exc()
        return None, None, None


def send_order_confirmation_email(order: Order, db: Session):
    """Send order confirmation email to customer"""
    from app.utils.email import send_email
    
    try:
        customer_email, subject, html_content = format_order_confirmation_email(order)
        
        if not customer_email or not html_content:
            print("Cannot send email: missing email or content")
            return False

        # Send email
        success = send_email(customer_email, subject, html_content)
        if success:
            print(f"Order confirmation email sent successfully to {customer_email}")
        else:
            print(f"Failed to send order confirmation email to {customer_email}")
        
        return success

    except Exception as e:
        print(f"Error sending order confirmation email: {e}")
        import traceback
        traceback.print_exc()
        return False
