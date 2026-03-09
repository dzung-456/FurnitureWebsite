import axiosInstance from "./api";
import { getToken, getStoredUser } from "./authStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const toWsBaseUrl = (base) => {
  if (!base) return "ws://localhost:8000";
  if (base.startsWith("https://")) return base.replace("https://", "wss://");
  if (base.startsWith("http://")) return base.replace("http://", "ws://");
  // already ws(s)
  return base;
};

export const getOrCreateConversationId = () => {
  const storedUser = getStoredUser();
  const scope = storedUser?.id
    ? `user:${storedUser.id}`
    : storedUser?.username
    ? `user:${storedUser.username}`
    : "guest";
  const key = `livechatConversationId:${scope}`;
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;

    const id = `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, id);
    return id;
  } catch {
    return `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
};

export const createVisitorSocket = ({
  conversationId,
  onMessage,
  onOpen,
  onClose,
  onError,
} = {}) => {
  const token = getToken();
  const wsBase = toWsBaseUrl(API_BASE_URL);
  const tokenParam = token ? `&token=${encodeURIComponent(token)}` : "";
  const url = `${wsBase}/api/ws/livechat/${encodeURIComponent(
    conversationId
  )}?role=visitor${tokenParam}`;
  const ws = new WebSocket(url);

  ws.onopen = () => onOpen?.();
  ws.onclose = () => onClose?.();
  ws.onerror = (e) => onError?.(e);
  ws.onmessage = (evt) => {
    try {
      const payload = JSON.parse(evt.data);
      onMessage?.(payload);
    } catch {
      // ignore
    }
  };

  return ws;
};

export const createAgentSocket = ({
  conversationId,
  onMessage,
  onOpen,
  onClose,
  onError,
} = {}) => {
  const token = getToken();
  const wsBase = toWsBaseUrl(API_BASE_URL);
  const url = `${wsBase}/api/ws/livechat/${encodeURIComponent(
    conversationId
  )}?role=agent&token=${encodeURIComponent(token)}`;

  const ws = new WebSocket(url);
  ws.onopen = () => onOpen?.();
  ws.onclose = () => onClose?.();
  ws.onerror = (e) => onError?.(e);
  ws.onmessage = (evt) => {
    try {
      const payload = JSON.parse(evt.data);
      onMessage?.(payload);
    } catch {
      // ignore
    }
  };

  return ws;
};

const liveChatService = {
  listConversations: async () => {
    const token = getToken();
    const res = await axiosInstance.get("/api/livechat/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data || [];
  },

  getHistory: async (conversationId, limit = 50) => {
    const token = getToken();
    const res = await axiosInstance.get(
      `/api/livechat/history/${conversationId}?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data?.data || [];
  },
};

export default liveChatService;
