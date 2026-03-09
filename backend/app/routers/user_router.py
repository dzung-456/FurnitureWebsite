from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.schemas.user_schemas import RegisterUserSchema, UserSchema, LoginUserSchema, LoginUserResponseSchema
from app.models.user_model import User
from app.db.base import get_db
from sqlalchemy.orm import Session
from app.schemas.base_schema import DataResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.middleware.authenticate import authenticate, require_admin
from datetime import datetime
import pytz
from sqlalchemy.exc import IntegrityError
import shutil
import os
from typing import Optional
from pathlib import Path

router = APIRouter()


def require_authenticated_user(current_user: User = Depends(authenticate)) -> User:
    return current_user

# Lưu avatar vào thư mục static của frontend
PROJECT_ROOT = Path(__file__).resolve().parents[3]
UPLOAD_DIR = PROJECT_ROOT / "frontend" / "public" / "uploads" / "avatars"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Admin CRUD operations
@router.get("/users", tags=["users"], description="Get all users", response_model=DataResponse[list[UserSchema]])
async def get_users(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    users = db.query(User).filter(User.deleted_at == None).all()
    return DataResponse.custom_response(code="200", message="get all users", data=users)

@router.post("/users", tags=["users"], description="Create a new user", response_model=DataResponse[UserSchema])
async def create_user(
    username: str = Form(...),
    password: str = Form(...),
    email: str = Form(...),
    full_name: str = Form(""),
    phone: str = Form(""),
    role: str = Form("customer"),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    try:
        # Check if user exists
        existing_user = db.query(User).filter((User.email == email) | (User.username == username)).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email hoặc username đã tồn tại")
        
        # Validate
        if len(username) < 3:
            raise HTTPException(status_code=400, detail="Username phải có ít nhất 3 ký tự")
        if len(password) < 6:
            raise HTTPException(status_code=400, detail="Mật khẩu phải có ít nhất 6 ký tự")
        if len(password) > 72:
            raise HTTPException(status_code=400, detail="Mật khẩu không được quá 72 ký tự")
        
        # Handle avatar upload
        avatar_path = None
        if file and file.filename:
            filename = f"{datetime.now().timestamp()}_{file.filename}"
            filepath = UPLOAD_DIR / filename
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            avatar_path = filename
        
        password_hash = hash_password(password)
        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        now = datetime.now(vn_tz)
        
        user = User(
            username=username,
            password_hash=password_hash,
            email=email,
            full_name=full_name if full_name else None,
            phone=phone if phone else None,
            role=role,
            avatar=avatar_path,
            created_at=now,
            updated_at=now,
            status="active"
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return DataResponse.custom_response(code="201", message="create user", data=user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}", tags=["users"], description="Get user by id", response_model=DataResponse[UserSchema])
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_authenticated_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return DataResponse.custom_response(code="404", message="User not found", data=None)
    return DataResponse.custom_response(code="200", message="Get user by id", data=user)

@router.put("/users/{user_id}", tags=["users"], description="Update user by id", response_model=DataResponse[UserSchema])
async def update_user(
    user_id: int,
    username: str = Form(None),
    email: str = Form(None),
    full_name: str = Form(None),
    phone: str = Form(None),
    role: str = Form(None),
    status: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_authenticated_user),
):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return DataResponse.custom_response(code="404", message="User not found", data=None)
        
        # Update fields if provided
        if username is not None:
            if len(username) < 3:
                raise HTTPException(status_code=400, detail="Username phải có ít nhất 3 ký tự")
            user.username = username
        if email is not None:
            user.email = email
        if full_name is not None:
            user.full_name = full_name if full_name else None
        if phone is not None:
            user.phone = phone if phone else None
        if role is not None:
            user.role = role
        if status is not None:
            user.status = status
        
        # Handle avatar upload
        if file and file.filename:
            filename = f"{datetime.now().timestamp()}_{file.filename}"
            filepath = UPLOAD_DIR / filename
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            user.avatar = filename
        
        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        user.updated_at = datetime.now(vn_tz)
        db.commit()
        db.refresh(user)
        return DataResponse.custom_response(code="200", message="Update user by id", data=user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}", tags=["users"], description="Delete user by id", response_model=DataResponse[UserSchema])
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return DataResponse.custom_response(code="404", message="User not found", data=None)
    
    user.deleted_at = datetime.now(pytz.timezone('Asia/Ho_Chi_Minh'))
    db.commit()
    return DataResponse.custom_response(code="200", message="Delete user by id", data=None)

# Existing auth endpoints
@router.post("/register", tags=["users"], description="Register a new user", response_model=DataResponse[UserSchema])
async def register_user(data: RegisterUserSchema, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter((User.email == data.email) | (User.username == data.username)).first()
    if existing_user:
        return DataResponse.custom_response(code="409", message="Email hoặc username đã tồn tại", data=None)

    password_hash = hash_password(data.password)
    vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
    now = datetime.now(vn_tz)
    user = User(
        username=data.username,
        password_hash=password_hash,
        email=data.email,
        full_name=getattr(data, "full_name", None),
        phone=getattr(data, "phone", None),
        role=getattr(data, "role", "customer"),
        avatar=getattr(data, "avatar", None),
        created_at=now,
        updated_at=now,
        status="active"
    )
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return DataResponse.custom_response(code="201", message="Đăng ký người dùng thành công", data=user)
    except IntegrityError:
        db.rollback()
        return DataResponse.custom_response(code="409", message="Email hoặc tên đăng nhập đã tồn tại", data=None)
    except Exception as e:
        db.rollback()
        return DataResponse.custom_response(code="500", message="Đăng ký người dùng thất bại", data=None)

@router.post("/login", tags=["users"], description="Đăng nhập người dùng", response_model=DataResponse[LoginUserResponseSchema])
async def login_user(data: LoginUserSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user:
        return DataResponse.custom_response(code="401", message="Tên đăng nhập hoặc mật khẩu không đúng", data=None)
    
    # Check if user has been soft deleted
    if user.deleted_at is not None:
        return DataResponse.custom_response(code="403", message="Tài khoản này đã bị xóa hoặc vô hiệu hóa", data=None)
    
    # Check if user is banned
    if user.status == "banned":
        return DataResponse.custom_response(code="403", message="Tài khoản đã bị cấm", data=None)
    
    if not verify_password(data.password, user.password_hash):
        return DataResponse.custom_response(code="401", message="Tên đăng nhập hoặc mật khẩu không đúng", data=None)
    token = create_access_token(user.id)
    return DataResponse.custom_response(code="200", message="Đăng nhập thành công", data=LoginUserResponseSchema(access_token=token, token_type="Bearer"))

@router.get("/me", tags=["users"], description="Lấy thông tin người dùng hiện tại", response_model=DataResponse[UserSchema], dependencies=[Depends(authenticate)])
async def get_current_user(current_user: User = Depends(authenticate)):
    return DataResponse.custom_response(code="200", message="Lấy thông tin người dùng thành công", data=current_user)

@router.put("/me", tags=["users"], description="Cập nhật thông tin người dùng", response_model=DataResponse[UserSchema])
async def update_user_profile(
    phone: str = Form(None),
    avatar: UploadFile = File(None),
    current_user: User = Depends(authenticate),
    db: Session = Depends(get_db)
):
    if phone:
        current_user.phone = phone
    
    if avatar:
        filename = f"{current_user.id}_{avatar.filename}"
        file_path = UPLOAD_DIR / filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
            
        current_user.avatar = filename
        
    vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
    current_user.updated_at = datetime.now(vn_tz)
    db.commit()
    db.refresh(current_user)
    
    return DataResponse.custom_response(code="200", message="Cập nhật thông tin thành công", data=current_user)