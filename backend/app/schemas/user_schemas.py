from pydantic import BaseModel, ConfigDict
from pydantic import field_validator
import re
from typing import Optional
from datetime import datetime

class UserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    # password_hash: str
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = "customer"
    avatar: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    status: str

class RegisterUserSchema(BaseModel):
    username: str
    password: str
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = "customer"
    avatar: Optional[str] = None

    @field_validator('email')
    @classmethod
    def validate_email(cls, email: str):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError('Email không đúng định dạng')
        return email

    @field_validator('username')
    @classmethod
    def validate_username(cls, username: str):
        # Chỉ cho phép chữ cái, số, dấu gạch dưới, không cho phép ký tự đặc biệt khác
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            raise ValueError('Username không được chứa ký tự đặc biệt, chỉ cho phép chữ cái, số và dấu gạch dưới')
        return username

    @field_validator('password')
    @classmethod
    def validate_password(cls, password: str):
        if len(password) < 8:
            raise ValueError('Mật khẩu phải có ít nhất 8 ký tự')
        return password

class LoginUserSchema(BaseModel):
    username: str
    password: str
    
class LoginUserResponseSchema(BaseModel):
    access_token: str
    token_type: str = "Bearer"

class TokenPayload(BaseModel):
    user_id: int
    exp: int

class UserUpdateSchema(BaseModel):
    phone: Optional[str] = None
    avatar: Optional[str] = None
