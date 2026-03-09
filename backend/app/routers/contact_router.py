from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.utils.email import send_email
from app.schemas.base_schema import DataResponse
from app.core.config import settings

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    phone: str
    email: EmailStr
    message: str

@router.post("/contact", tags=["contact"], description="Send contact form to admin")
async def send_contact_form(form: ContactForm):
    # Subject for the admin email
    subject = f"Liên hệ mới từ {form.name} - FurnitureWebsite"
    
    # HTML Content for the admin email
    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Thông tin liên hệ mới</h2>
        <p><strong>Họ và tên:</strong> {form.name}</p>
        <p><strong>Số điện thoại:</strong> {form.phone}</p>
        <p><strong>Email:</strong> {form.email}</p>
        <hr>
        <p><strong>Nội dung:</strong></p>
        <p style="white-space: pre-wrap;">{form.message}</p>
    </div>
    """
    
    # Send email to the Admin (configured in settings.MAIL_FROM or a specific admin email)
    # Using settings.MAIL_FROM as the admin recipient for simplicity, or we could add ADMIN_EMAIL to config.
    # Assuming config.MAIL_FROM is verified sender, we send TO it as well so the admin sees it.
    # Or typically, you send to support@yourdomain.com. For this setup, I'll send to settings.MAIL_FROM.
    admin_email = settings.MAIL_FROM 
    
    # Send email with Reply-To set to the user's email
    email_sent = send_email(admin_email, subject, html_content, reply_to=form.email)
    
    if not email_sent:
        return DataResponse.custom_response(code="500", message="Lỗi gửi email. Vui lòng thử lại sau.", data=None)

    # Gửi email xác nhận cho người dùng
    user_subject = "Cảm ơn bạn đã liên hệ FurnitureWebsite"
    user_html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Xin chào {form.name},</h2>
        <p>Cảm ơn bạn đã liên hệ FurnitureWebsite. Chúng tôi đã nhận được thông tin của bạn và sẽ phản hồi sớm nhất có thể.</p>
        <hr>
        <b>Nội dung bạn đã gửi:</b>
        <p>{form.message}</p>
        <br>
        <p>Trân trọng,<br>FurnitureWebsite Team</p>
    </div>
    """
    send_email(form.email, user_subject, user_html)

    return DataResponse.custom_response(code="200", message="Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất!", data=None)
