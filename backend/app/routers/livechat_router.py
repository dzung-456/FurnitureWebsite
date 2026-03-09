from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
import jwt

from app.core.config import settings
from app.db.base import get_db
from app.middleware.authenticate import authenticate
from app.models.user_model import User
from app.utils.livechat_manager import livechat_manager

router = APIRouter()


def _role_vi(role: str) -> str:
    return "Nhân viên" if role == "agent" else "Khách hàng"


def _get_user_from_token(token: str, db: Session) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=403, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.deleted_at is not None:
        raise HTTPException(status_code=403, detail="User disabled")
    if user.status == "banned":
        raise HTTPException(status_code=403, detail="User banned")
    return user


def _try_get_user_from_token(token: Optional[str], db: Session) -> Optional[User]:
    if not token:
        return None
    try:
        return _get_user_from_token(token, db)
    except Exception:
        return None


def require_admin(current_user: User = Depends(authenticate)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user


@router.get("/livechat/conversations", tags=["livechat"])
async def list_conversations(_: User = Depends(require_admin)):
    return {"code": "200", "message": "ok", "data": livechat_manager.list_conversations()}


@router.get("/livechat/history/{conversation_id}", tags=["livechat"])
async def get_history(conversation_id: str, limit: int = 50, _: User = Depends(require_admin)):
    return {"code": "200", "message": "ok", "data": livechat_manager.get_history(conversation_id, limit=limit)}


@router.websocket("/ws/livechat/{conversation_id}")
async def ws_livechat(
    websocket: WebSocket,
    conversation_id: str,
    role: str = Query("visitor"),
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    # Accept early so we can report auth errors gracefully.
    await websocket.accept()

    role = (role or "visitor").strip().lower()
    if role not in ("visitor", "agent"):
        await websocket.send_json({"type": "error", "message": "Role không hợp lệ"})
        await websocket.close(code=1008)
        return

    if role == "agent":
        if not token:
            await websocket.send_json({"type": "error", "message": "Thiếu token. Vui lòng đăng nhập admin."})
            await websocket.close(code=1008)
            return
        try:
            user = _get_user_from_token(token, db)
            if user.role != "admin":
                await websocket.send_json({"type": "error", "message": "Chỉ admin mới được vào kênh nhân viên."})
                await websocket.close(code=1008)
                return
        except Exception:
            await websocket.send_json({"type": "error", "message": "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."})
            await websocket.close(code=1008)
            return

    # If visitor provides token, attach identity to conversation
    if role == "visitor":
        visitor_user = _try_get_user_from_token(token, db)
        if visitor_user:
            state = livechat_manager._get_state(conversation_id)  # internal state
            state.visitor_user_id = visitor_user.id
            state.visitor_display_name = visitor_user.full_name or visitor_user.username
        else:
            state = livechat_manager._get_state(conversation_id)
            if not state.visitor_display_name:
                state.visitor_display_name = "Khách vãng lai"

    await livechat_manager.connect(websocket, conversation_id=conversation_id, role=role, accept=False)
    await livechat_manager.add_system_message(conversation_id, f"{_role_vi(role)} đã kết nối")

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = (data.get("type") or "message").strip().lower()
            if msg_type != "message":
                continue

            text = (data.get("text") or "").strip()
            if not text:
                continue

            await livechat_manager.add_message(conversation_id, sender=role, text=text, broadcast=True)

    except WebSocketDisconnect:
        await livechat_manager.disconnect(websocket, conversation_id=conversation_id)
    except Exception:
        await livechat_manager.disconnect(websocket, conversation_id=conversation_id)
