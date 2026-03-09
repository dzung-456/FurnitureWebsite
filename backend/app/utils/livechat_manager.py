from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set

from fastapi import WebSocket


@dataclass
class LiveChatMessage:
    sender: str  # 'visitor' | 'agent' | 'system'
    text: str
    ts: str


@dataclass
class LiveChatConversationState:
    conversation_id: str
    visitor_connected: bool = False
    agent_connected: bool = False
    visitor_user_id: Optional[int] = None
    visitor_display_name: Optional[str] = None
    last_activity_ts: str = ""
    history: List[LiveChatMessage] = None

    def __post_init__(self) -> None:
        if self.history is None:
            self.history = []


class LiveChatManager:
    def __init__(self) -> None:
        self._connections: Dict[str, Set[WebSocket]] = {}
        self._roles: Dict[WebSocket, str] = {}
        self._conversation_state: Dict[str, LiveChatConversationState] = {}

    def _now_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _get_state(self, conversation_id: str) -> LiveChatConversationState:
        state = self._conversation_state.get(conversation_id)
        if state is None:
            state = LiveChatConversationState(
                conversation_id=conversation_id,
                visitor_connected=False,
                agent_connected=False,
                last_activity_ts=self._now_iso(),
                history=[],
            )
            self._conversation_state[conversation_id] = state
        return state

    async def connect(self, websocket: WebSocket, conversation_id: str, role: str, accept: bool = True) -> None:
        if accept:
            await websocket.accept()

        self._connections.setdefault(conversation_id, set()).add(websocket)
        self._roles[websocket] = role

        state = self._get_state(conversation_id)
        if role == "visitor":
            state.visitor_connected = True
        elif role == "agent":
            state.agent_connected = True
        state.last_activity_ts = self._now_iso()

        # Send history on connect
        await websocket.send_json(
            {
                "type": "history",
                "conversationId": conversation_id,
                "messages": [m.__dict__ for m in state.history[-50:]],
            }
        )

    async def disconnect(self, websocket: WebSocket, conversation_id: str) -> None:
        role = self._roles.get(websocket)

        try:
            self._connections.get(conversation_id, set()).discard(websocket)
        except Exception:
            pass

        if websocket in self._roles:
            del self._roles[websocket]

        # Update state flags by scanning remaining connections
        state = self._get_state(conversation_id)
        visitor_connected = False
        agent_connected = False
        for ws in self._connections.get(conversation_id, set()):
            r = self._roles.get(ws)
            if r == "visitor":
                visitor_connected = True
            elif r == "agent":
                agent_connected = True
        state.visitor_connected = visitor_connected
        state.agent_connected = agent_connected
        state.last_activity_ts = self._now_iso()

        # Cleanup empty
        if not self._connections.get(conversation_id):
            self._connections.pop(conversation_id, None)

        # Optionally write a system message
        if role in ("visitor", "agent"):
            role_vi = "Nhân viên" if role == "agent" else "Khách hàng"
            await self.add_system_message(conversation_id, f"{role_vi} đã ngắt kết nối")

    async def add_system_message(self, conversation_id: str, text: str) -> None:
        await self.add_message(conversation_id, sender="system", text=text, broadcast=True)

    async def add_message(self, conversation_id: str, sender: str, text: str, broadcast: bool) -> None:
        state = self._get_state(conversation_id)
        msg = LiveChatMessage(sender=sender, text=text, ts=self._now_iso())
        state.history.append(msg)
        state.last_activity_ts = msg.ts

        if broadcast:
            await self.broadcast(conversation_id, {"type": "message", **msg.__dict__})

    async def broadcast(self, conversation_id: str, payload: dict) -> None:
        for ws in list(self._connections.get(conversation_id, set())):
            try:
                await ws.send_json(payload)
            except Exception:
                # Ignore send errors; cleanup will happen on disconnect.
                pass

    def list_conversations(self) -> List[dict]:
        out: List[dict] = []
        for cid, state in self._conversation_state.items():
            out.append(
                {
                    "conversationId": cid,
                    "visitorUserId": state.visitor_user_id,
                    "visitorDisplayName": state.visitor_display_name,
                    "visitorConnected": state.visitor_connected,
                    "agentConnected": state.agent_connected,
                    "lastActivityTs": state.last_activity_ts,
                    "messageCount": len(state.history),
                }
            )
        # Most recent first
        out.sort(key=lambda x: x.get("lastActivityTs") or "", reverse=True)
        return out

    def get_history(self, conversation_id: str, limit: int = 50) -> List[dict]:
        state = self._get_state(conversation_id)
        return [m.__dict__ for m in state.history[-limit:]]


livechat_manager = LiveChatManager()
