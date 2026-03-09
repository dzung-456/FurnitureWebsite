import React, { useEffect, useMemo, useRef, useState } from "react";
import liveChatService, {
  createAgentSocket,
} from "../../../services/liveChatService";
import { getStoredUser } from "../../../services/authStorage";

const LiveChat = () => {
  const user = getStoredUser();
  const isAdmin = user?.role === "admin";

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("disconnected");
  const [errorText, setErrorText] = useState("");

  const statusLabel =
    status === "connected"
      ? "đã kết nối"
      : status === "connecting"
      ? "đang kết nối"
      : "đã ngắt kết nối";

  const wsRef = useRef(null);
  const endRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.conversationId === selectedId) || null,
    [conversations, selectedId]
  );

  const conversationTitle = (c) => {
    const name = (c?.visitorDisplayName || "").trim();
    return name || c?.conversationId || "";
  };

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageTs = (value) => {
    try {
      if (!value) return "";
      const d = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(d.getTime())) return "";
      const time = d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const date = d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${time} (${date})`;
    } catch {
      return "";
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll conversations list (simple MVP)
  useEffect(() => {
    if (!isAdmin) return;

    let alive = true;
    const tick = async () => {
      try {
        const data = await liveChatService.listConversations();
        if (alive) setConversations(data);
        if (alive) setErrorText("");
      } catch {
        if (alive)
          setErrorText(
            "Không thể tải danh sách chat. Vui lòng đăng nhập lại bằng tài khoản admin."
          );
      }
    };

    tick();
    const id = setInterval(tick, 2000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [isAdmin]);

  // Cleanup ws on unmount
  useEffect(() => {
    return () => {
      try {
        wsRef.current?.close();
      } catch {
        // ignore
      }
    };
  }, []);

  const connectToConversation = async (conversationId) => {
    if (!conversationId) return;

    // Close previous
    try {
      wsRef.current?.close();
    } catch {
      // ignore
    }

    setSelectedId(conversationId);
    setMessages([]);
    setStatus("connecting");
    setErrorText("");

    try {
      const history = await liveChatService.getHistory(conversationId, 50);
      setMessages(
        history.map((m) => ({
          id: `${m.ts}_${Math.random()}`,
          sender: m.sender,
          text: m.text,
          ts: m.ts,
        }))
      );
    } catch {
      // ignore
    }

    const ws = createAgentSocket({
      conversationId,
      onOpen: () => setStatus("connected"),
      onClose: () => setStatus("disconnected"),
      onError: () => setStatus("disconnected"),
      onMessage: (payload) => {
        if (payload?.type === "error" && payload.message) {
          setErrorText(payload.message);
          setStatus("disconnected");
          return;
        }
        if (payload?.type === "message" && payload.text) {
          setMessages((prev) => [
            ...prev,
            {
              id: `${payload.ts || Date.now()}_${Math.random()}`,
              sender: payload.sender,
              text: payload.text,
              ts: payload.ts,
            },
          ]);
        }
      },
    });

    wsRef.current = ws;
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ type: "message", text }));
    setInput("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Live Chat</h2>
        <div className="text-red-600">
          Chỉ tài khoản admin mới được dùng tính năng này.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Live Chat (CSKH)</h2>

      {errorText && (
        <div className="mb-3 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {errorText}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Left: conversation list */}
        <div className="col-span-12 md:col-span-4 bg-white rounded shadow p-3">
          <div className="font-semibold mb-2">Cuộc trò chuyện</div>
          <div className="space-y-2 max-h-[70vh] overflow-auto">
            {conversations.length === 0 && (
              <div className="text-sm text-gray-500">
                Chưa có phiên chat nào.
              </div>
            )}
            {conversations.map((c) => (
              <button
                key={c.conversationId}
                className={`w-full text-left p-2 rounded border ${
                  selectedId === c.conversationId
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
                onClick={() => connectToConversation(c.conversationId)}
              >
                <div className="text-sm font-medium">
                  {conversationTitle(c)}
                </div>
                <div className="text-xs text-gray-500">{c.conversationId}</div>
                <div className="text-xs text-gray-600">
                  Khách hàng:{" "}
                  {c.visitorConnected ? "đã kết nối" : "đã ngắt kết nối"} · Nhân
                  viên: {c.agentConnected ? "đã kết nối" : "đã ngắt kết nối"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: chat */}
        <div className="col-span-12 md:col-span-8 bg-white rounded shadow p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">
              {selectedConversation
                ? conversationTitle(selectedConversation)
                : "Chọn 1 cuộc trò chuyện"}
            </div>
            <div className="text-xs text-gray-600">
              Trạng thái: {statusLabel}
            </div>
          </div>

          <div className="flex-1 border rounded p-3 overflow-auto min-h-[50vh]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`mb-2 ${
                  m.sender === "agent" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded ${
                    m.sender === "agent"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {m.text}
                </div>
                {!!m.ts && (
                  <div
                    className={`mt-1 text-xs text-gray-500 ${
                      m.sender === "agent" ? "text-right" : "text-left"
                    }`}
                  >
                    {formatMessageTs(m.ts)}
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Nhập trả lời..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={!selectedId || status !== "connected"}
            />
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              onClick={send}
              disabled={!selectedId || status !== "connected" || !input.trim()}
            >
              Gửi
            </button>
          </div>

          {!selectedId && (
            <div className="text-xs text-gray-500 mt-2">
              Chọn cuộc trò chuyện bên trái để bắt đầu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
