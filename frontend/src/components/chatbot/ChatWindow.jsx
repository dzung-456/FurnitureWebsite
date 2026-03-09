import React, { useState, useEffect, useRef } from "react";
import chatbotService from "../../services/chatbotService";
import "../../assets/css/chatbot.css";
import { createVisitorSocket } from "../../services/liveChatService";

const ChatWindow = ({ onClose, conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [isLiveChat, setIsLiveChat] = useState(false);
  const [liveChatStatus, setLiveChatStatus] = useState("disconnected"); // disconnected|connecting|connected
  const messagesEndRef = useRef(null);
  const greetingSentRef = useRef(false);
  const wsRef = useRef(null);

  const storageKey = conversationId
    ? `livechat:messages:${conversationId}`
    : null;

  const quickQuestions = chatbotService.getQuickQuestions();

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Restore persisted messages (so closing widget / logout doesn't wipe history)
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const restored = parsed
        .filter((m) => m && typeof m.text === "string" && m.text.trim())
        .map((m) => ({
          id: m.id ?? Date.now() + Math.random(),
          text: m.text,
          sender: m.sender === "user" ? "user" : "bot",
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
      if (restored.length) setMessages(restored);
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Persist messages
  useEffect(() => {
    if (!storageKey) return;
    try {
      const compact = messages.slice(-200).map((m) => ({
        id: m.id,
        text: m.text,
        sender: m.sender,
        timestamp:
          m.timestamp instanceof Date
            ? m.timestamp.toISOString()
            : new Date().toISOString(),
      }));
      localStorage.setItem(storageKey, JSON.stringify(compact));
    } catch {
      // ignore
    }
  }, [messages, storageKey]);

  // Send initial greeting (only once)
  useEffect(() => {
    if (!greetingSentRef.current) {
      greetingSentRef.current = true;
      setTimeout(() => {
        addBotMessage(chatbotService.getGreeting());
      }, 500);
    }
  }, []);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      try {
        wsRef.current?.close();
      } catch {
        // ignore
      }
    };
  }, []);

  // NOTE: Previously we cleared chat messages on the global "cart:updated" event.
  // That caused chat history to disappear on logout and even on cart updates.
  // We intentionally keep history now; users can clear chat manually if needed.

  const addBotMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender: "user",
        timestamp: new Date(),
      },
    ]);
  };

  const handleQuickQuestion = (question) => {
    // Add user message
    addUserMessage(question.question);

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      setIsTyping(false);
      const answer = chatbotService.findAnswer(question.id);
      addBotMessage(answer);
    }, 800 + Math.random() * 1000); // Random delay 800-1800ms for realism
  };

  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    // Add user message
    addUserMessage(trimmedInput);
    setInputValue("");

    // If live chat is connected, send to agent via WebSocket
    if (
      isLiveChat &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({ type: "message", text: trimmedInput })
      );
      return;
    }

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      setIsTyping(false);
      const answer = chatbotService.searchAnswer(trimmedInput);
      addBotMessage(answer);
    }, 1000 + Math.random() * 1500); // Random delay for realism
  };

  const startLiveChat = () => {
    if (!conversationId) {
      addBotMessage(
        "Không thể khởi tạo phiên chat lúc này. Vui lòng thử lại sau."
      );
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsLiveChat(true);
      setLiveChatStatus("connected");
      return;
    }

    setIsLiveChat(true);
    setLiveChatStatus("connecting");
    addBotMessage("Đang kết nối nhân viên hỗ trợ... (vui lòng đợi)");

    const ws = createVisitorSocket({
      conversationId,
      onOpen: () => {
        setLiveChatStatus("connected");
        addBotMessage("Bạn đã kết nối với CSKH. Hãy gửi câu hỏi của bạn nhé!");
      },
      onClose: () => {
        setLiveChatStatus("disconnected");
        addBotMessage("Kết nối CSKH đã đóng. Bạn có thể thử kết nối lại.");
      },
      onError: () => {
        setLiveChatStatus("disconnected");
        addBotMessage("Kết nối CSKH gặp lỗi. Vui lòng thử lại sau.");
      },
      onMessage: (payload) => {
        if (payload?.type === "history" && Array.isArray(payload.messages)) {
          setMessages((prev) => {
            const mapped = payload.messages
              .filter((m) => m && m.text)
              .map((m) => ({
                id: Date.now() + Math.random(),
                text: m.text,
                sender:
                  m.sender === "agent"
                    ? "bot"
                    : m.sender === "visitor"
                    ? "user"
                    : "bot",
                timestamp: new Date(m.ts || Date.now()),
              }));
            return [...prev, ...mapped];
          });
          return;
        }

        if (payload?.type === "message" && payload.text) {
          const sender =
            payload.sender === "agent"
              ? "bot"
              : payload.sender === "visitor"
              ? "user"
              : "bot";
          if (sender === "bot") addBotMessage(payload.text);
        }
      },
    });

    wsRef.current = ws;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (value) => {
    try {
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

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar">🤖</div>
          <div className="chat-header-text">
            <h3>{chatbotService.getBotName()}</h3>
            <p>Trợ lý ảo</p>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === "bot" ? "🤖" : "👤"}
            </div>
            <div className="message-content">
              <div className="message-bubble">{msg.text}</div>
              <div className="message-time">
                {formatMessageTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Live chat handoff button (when bot doesn't understand) */}
        {!isLiveChat &&
          messages.length > 0 &&
          chatbotService.isFallbackResponse(
            messages[messages.length - 1]?.text
          ) && (
            <div className="message bot">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble">
                <div style={{ marginBottom: 8 }}>
                  Bạn muốn kết nối nhân viên CSKH để được hỗ trợ trực tiếp
                  không?
                </div>
                <button
                  className="quick-question-btn"
                  onClick={startLiveChat}
                  disabled={liveChatStatus === "connecting"}
                >
                  {liveChatStatus === "connecting"
                    ? "Đang kết nối..."
                    : "Kết nối CSKH"}
                </button>
              </div>
            </div>
          )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-bubble">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions - Collapsible */}
      {!isLiveChat && (
        <div className="quick-questions-section">
          <button
            className="quick-questions-toggle"
            onClick={() => setShowQuickQuestions(!showQuickQuestions)}
          >
            <span>💡 Câu hỏi gợi ý</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: showQuickQuestions
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {showQuickQuestions && (
            <div className="quick-questions">
              {quickQuestions.map((question) => (
                <button
                  key={question.id}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question.question}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Nhập câu hỏi của bạn..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="chat-send-btn"
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
