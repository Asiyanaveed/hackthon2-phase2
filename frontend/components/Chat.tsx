import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { chatApi, ChatMessage, ChatResponse } from "@/lib/chat-api";

interface ChatProps {
  onClose?: () => void;
}

interface Conversation {
  id: number;
  title: string;
  updated_at: string;
}

export default function Chat({ onClose }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const convs = await chatApi.getConversations();
      setConversations(convs);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const loadConversation = async (convId: number) => {
    try {
      const msgs = await chatApi.getConversationMessages(convId);
      setMessages(msgs.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        created_at: m.created_at,
      })));
      setConversationId(convId);
      setShowSidebar(false);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setShowSidebar(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response: ChatResponse = await chatApi.sendMessage(userMessage.content, conversationId);

      // Update conversation ID if this is the first message
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
        loadConversations();
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: err instanceof Error ? err.message : "Sorry, something went wrong. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={styles.menuButton}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div style={styles.botIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
              <circle cx="8" cy="14" r="2" />
              <circle cx="16" cy="14" r="2" />
            </svg>
          </div>
          <span style={styles.headerTitle}>Todo AI Assistant</span>
        </div>
        <div style={styles.headerRight}>
          <button onClick={startNewChat} style={styles.newChatButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chat
          </button>
          {onClose && (
            <button onClick={onClose} style={styles.closeButton}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarTitle}>Conversations</span>
          </div>
          <div style={styles.sidebarContent}>
            <button onClick={startNewChat} style={styles.newConvButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Conversation
            </button>
            <div style={styles.convList}>
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  style={{
                    ...styles.convItem,
                    ...(conversationId === conv.id ? styles.convItemActive : {}),
                  }}
                >
                  <span style={styles.convTitle}>{conv.title}</span>
                  <span style={styles.convDate}>
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                <circle cx="8" cy="14" r="2" />
                <circle cx="16" cy="14" r="2" />
              </svg>
            </div>
            <h3 style={styles.emptyTitle}>How can I help you today?</h3>
            <p style={styles.emptyText}>
              Try saying something like:<br />
              &quot;Add a task to buy groceries&quot;<br />
              &quot;List my pending tasks&quot;<br />
              &quot;Mark task #3 as complete&quot;
            </p>
          </div>
        ) : (
          <div style={styles.messageList}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.messageWrapper,
                  ...(msg.role === "user" ? styles.messageUser : styles.messageAssistant),
                }}
              >
                <div style={styles.messageAvatar}>
                  {msg.role === "user" ? (
                    <div style={styles.userAvatar} title={user?.email}>
                      {(user?.email || "U")[0].toUpperCase()}
                    </div>
                  ) : (
                    <div style={styles.botAvatar}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div style={styles.messageContent}>
                  <div style={styles.messageBubble}>{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        <form onSubmit={handleSubmit} style={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to manage your tasks..."
            style={styles.input}
            disabled={loading}
          />
          <button
            type="submit"
            style={{
              ...styles.sendButton,
              ...(loading || !input.trim() ? styles.sendButtonDisabled : {}),
            }}
            disabled={loading || !input.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex" as const,
    flexDirection: "column" as const,
    height: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #2a2a2a",
  },
  header: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: "14px 18px",
    backgroundColor: "#1f1f1f",
    borderBottom: "1px solid #2a2a2a",
  },
  headerLeft: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "10px",
  },
  menuButton: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    background: "none",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
  },
  botIcon: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    width: "36px",
    height: "36px",
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    borderRadius: "10px",
    color: "#f97316",
  },
  headerTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
  },
  headerRight: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
  },
  newChatButton: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "#f97316",
    color: "#000000",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  closeButton: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
  },
  sidebar: {
    position: "absolute" as const,
    top: "62px",
    left: "0",
    width: "280px",
    height: "calc(100% - 62px)",
    backgroundColor: "#1a1a1a",
    borderRight: "1px solid #2a2a2a",
    zIndex: 10,
    display: "flex" as const,
    flexDirection: "column" as const,
  },
  sidebarHeader: {
    padding: "16px",
    borderBottom: "1px solid #2a2a2a",
  },
  sidebarTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  sidebarContent: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "12px",
  },
  newConvButton: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#2a2a2a",
    color: "#e5e5e5",
    border: "1px solid #3a3a3a",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginBottom: "12px",
    transition: "all 0.2s ease",
  },
  convList: {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "4px",
  },
  convItem: {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "2px",
    padding: "10px 12px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "all 0.2s ease",
  },
  convItemActive: {
    backgroundColor: "#2a2a2a",
  },
  convTitle: {
    fontSize: "14px",
    color: "#e5e5e5",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  convDate: {
    fontSize: "12px",
    color: "#6b7280",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "20px",
  },
  emptyState: {
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    height: "100%",
    textAlign: "center" as const,
  },
  emptyIcon: {
    color: "#404040",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: 1.6,
  },
  messageList: {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "16px",
  },
  messageWrapper: {
    display: "flex" as const,
    gap: "12px",
    alignItems: "flex-start",
  },
  messageUser: {
    flexDirection: "row-reverse" as const,
  },
  messageAssistant: {},
  messageAvatar: {
    flexShrink: 0,
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    color: "#f97316",
    fontSize: "14px",
    fontWeight: "600",
    border: "1px solid rgba(249, 115, 22, 0.3)",
  },
  botAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    color: "#f97316",
  },
  messageContent: {
    maxWidth: "75%",
  },
  messageBubble: {
    padding: "12px 16px",
    borderRadius: "16px",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  typingIndicator: {
    display: "flex" as const,
    gap: "4px",
    padding: "12px 16px",
    backgroundColor: "#2a2a2a",
    borderRadius: "16px",
    width: "fit-content",
  },
  inputContainer: {
    padding: "16px",
    backgroundColor: "#1f1f1f",
    borderTop: "1px solid #2a2a2a",
  },
  inputForm: {
    display: "flex" as const,
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "#2a2a2a",
    border: "1px solid #3a3a3a",
    borderRadius: "12px",
    fontSize: "14px",
    color: "#ffffff",
    outline: "none",
    transition: "all 0.2s ease",
  },
  sendButton: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    width: "44px",
    height: "44px",
    backgroundColor: "#f97316",
    border: "none",
    borderRadius: "12px",
    color: "#000000",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};
