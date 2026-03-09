from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.models.user_model import User
from app.utils.email import send_email
from app.core.security import hash_password
from app.schemas.base_schema import DataResponse
from pydantic import BaseModel, EmailStr
import random
import string
from datetime import datetime, timedelta

router = APIRouter()

# In-memory store for OTPs: { "email": { "code": "123456", "expires": datetime } }
otp_store = {}

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str
    confirm_password: str

@router.post("/forgot-password", tags=["auth"], description="Request password reset OTP")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Avoid revealing user existence
        return DataResponse.custom_response(code="200", message="Mã xác nhận đã được gửi đến email hợp lệ.", data=None)

    # Generate OTP
    otp_code = ''.join(random.choices(string.digits, k=6))
    expires = datetime.now() + timedelta(minutes=10)
    
    otp_store[request.email] = {
        "code": otp_code,
        "expires": expires
    }

    # Send Email
    subject = "Mã xác nhận đặt lại mật khẩu - FurnitureWebsite"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
        <p>Xin chào,</p>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Mã xác nhận của bạn là:</p>
        <h1 style="color: #007bff; letter-spacing: 5px;">{otp_code}</h1>
        <p>Mã này sẽ hết hạn trong 10 phút. Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
    </div>
    """
    
    email_sent = send_email(request.email, subject, html_content)
    if not email_sent:
        return DataResponse.custom_response(code="500", message="Lỗi gửi email. Vui lòng thử lại sau.", data=None)

    return DataResponse.custom_response(code="200", message="Mã xác nhận đã được gửi đến email của bạn.", data=None)

@router.post("/reset-password", tags=["auth"], description="Reset password with OTP")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    if request.new_password != request.confirm_password:
        return DataResponse.custom_response(code="400", message="Mật khẩu xác nhận không khớp.", data=None)

    otp_data = otp_store.get(request.email)
    if not otp_data:
        return DataResponse.custom_response(code="400", message="Yêu cầu hết hạn hoặc không tồn tại.", data=None)

    if datetime.now() > otp_data["expires"]:
        del otp_store[request.email]
        return DataResponse.custom_response(code="400", message="Mã xác nhận đã hết hạn.", data=None)

    if otp_data["code"] != request.code:
        return DataResponse.custom_response(code="400", message="Mã xác nhận không đúng.", data=None)

    # Update Password
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return DataResponse.custom_response(code="404", message="Người dùng không tồn tại.", data=None)

    user.password_hash = hash_password(request.new_password)
    db.commit()

    # Clear OTP
    del otp_store[request.email]

    return DataResponse.custom_response(code="200", message="Đặt lại mật khẩu thành công.", data=None)
