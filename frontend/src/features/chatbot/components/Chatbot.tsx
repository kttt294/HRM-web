import { useState, useRef, useEffect } from "react";
import anime from "animejs";
import { chatbotApi } from "../services/chatbot.api";
import { useAuthStore } from "../../../store/auth.store";

/**
 * ============================================
 * AI CHATBOT COMPONENT - Premium & Personalized
 * ============================================
 */

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Greeting
  useEffect(() => {
    if (user && chatHistory.length === 0) {
      const displayName = user.name || user.username;
      setChatHistory([
        { 
          role: "model", 
          parts: [{ text: `Xin chào **${displayName}**! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn hôm nay?` }] 
        }
      ]);
    }
  }, [user]);

  // Handle auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  // Animation for opening/closing
  useEffect(() => {
    if (isOpen) {
      anime({
        targets: chatWindowRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.95, 1],
        duration: 400,
        easing: "easeOutElastic(1, .8)",
      });
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", parts: [{ text: message }] };
    setChatHistory((prev) => [...prev, userMsg]);
    setIsLoading(true);
    const textToSend = message;
    setMessage("");

    try {
      // Gemini SDK requires history to start with a 'user' message.
      // We skip the initial 'model' greeting if it's at the start.
      const validHistory = chatHistory
        .filter((msg, idx) => !(idx === 0 && msg.role === "model"))
        .map(msg => ({
          role: msg.role,
          parts: msg.parts
        }));

      const response = await chatbotApi.ask(textToSend, validHistory);
      const modelMsg: ChatMessage = { role: "model", parts: [{ text: response.reply }] };
      setChatHistory((prev) => [...prev, modelMsg]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev, 
        { role: "model", parts: [{ text: "Rất tiếc, tôi đang gặp chút sự cố kết nối. Bạn thử lại sau nhé!" }] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  if (!user) return null; // Only show if logged in

  return (
    <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 1000 }}>
      {/* Floating Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-bubble pulse"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1976d2, #64b5f6)",
            color: "white",
            border: "none",
            boxShadow: "0 8px 32px rgba(25, 118, 210, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1) rotate(5deg)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          style={{
            width: "380px",
            height: "550px",
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 12px 60px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: '1px solid #eee'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px",
              background: "linear-gradient(135deg, #1976d2, #1565c0)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12L2.1 12.1"/><path d="M12 12L12 22.1"/><path d="M12 12L21.9 11.9"/><path d="M12 12L12 1.9"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>Trợ lý AI</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Sẵn sàng hỗ trợ bạn</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "white", fontSize: "28px", cursor: "pointer", opacity: 0.7 }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              background: "#f8f9fa",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                  background: msg.role === "user" ? "#1976d2" : "white",
                  color: msg.role === "user" ? "white" : "#333",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  whiteSpace: "pre-line"
                }}
              >
                {/* Basic Markdown Rendering - Bold and links */}
                {msg.parts[0].text.split("**").map((part, idx) => (
                  idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                ))}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: "flex-start", padding: "12px 16px", borderRadius: "18px 18px 18px 2px", background: "white", display: 'flex', gap: '4px' }}>
                <span className="dot-typing"></span>
                <span className="dot-typing" style={{ animationDelay: '0.2s' }}></span>
                <span className="dot-typing" style={{ animationDelay: '0.4s' }}></span>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "20px", background: "white", borderTop: "1px solid #eee", display: "flex", gap: "12px" }}>
            <input
              placeholder="Nhập câu hỏi của bạn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flex: 1,
                border: "1px solid #ddd",
                borderRadius: "20px",
                padding: "10px 16px",
                fontSize: "14px",
                outline: "none",
                background: '#f5f5f5'
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#1976d2",
                color: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: (isLoading || !message.trim()) ? 0.5 : 1
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        .chatbot-bubble.pulse {
          animation: pulse-blue 2s infinite;
        }
        @keyframes pulse-blue {
          0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(25, 118, 210, 0); }
          100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
        }
        .dot-typing {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ccc;
          animation: typing-jump 0.6s infinite alternate;
        }
        @keyframes typing-jump {
          from { transform: translateY(0); }
          to { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
