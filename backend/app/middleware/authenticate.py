from fastapi.security import HTTPBearer
import jwt
from app.core.config import settings
from fastapi import Depends, HTTPException, status
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.user_schemas import TokenPayload
from app.models.user_model import User

reusable_oauth = HTTPBearer(
    scheme_name='Authorization'
)

def authenticate(http_authorization_credentials=Depends(reusable_oauth), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(
            http_authorization_credentials.credentials, settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)

    except (jwt.PyJWTError, ValidationError) as e:
        print(f"AUTHENTICATION ERROR: {str(e)}")
        raise HTTPException(
            status_code=403,
            detail="credentials"
        )
    user = db.query(User).filter(User.id == token_data.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user has been soft deleted
    if user.deleted_at is not None:
        raise HTTPException(status_code=403, detail="Tài khoản đã bị xóa hoặc vô hiệu hóa")
    
    # Check if user is banned
    if user.status == "banned":
        raise HTTPException(status_code=403, detail="Tài khoản đã bị cấm")
    
    return user

def require_admin(current_user: User = Depends(authenticate)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập (Admin only)"
        )
    return current_user

