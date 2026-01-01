const API_BASE_URL = "http://localhost:8000";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

interface ChatRequest {
  message: string;
  conversation_id?: number | null;
}

interface ChatResponse {
  response: string;
  conversation_id: number;
  intent: string;
  tool_result?: {
    success: boolean;
    message: string;
    task?: {
      id: number;
      title: string;
      completed: boolean;
    };
  };
}

interface Conversation {
  id: number;
  title: string;
  updated_at: string;
  created_at: string;
}

interface ConversationMessage {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  created_at: string;
}

async function authFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("jwt_token")
    : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...headers,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user");
      throw new Error("Authentication expired. Please login again.");
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const chatApi = {
  getUserId: (): string | null => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.id || null;
      } catch {
        return null;
      }
    }
    return null;
  },

  sendMessage: (message: string, conversationId?: number | null): Promise<ChatResponse> => {
    const userId = chatApi.getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const request: ChatRequest = {
      message,
      conversation_id: conversationId || null,
    };
    return authFetch<ChatResponse>(`/api/${userId}/chat`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  getConversations: (): Promise<Conversation[]> => {
    const userId = chatApi.getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return authFetch<Conversation[]>(`/api/${userId}/conversations`);
  },

  getConversationMessages: (conversationId: number): Promise<ConversationMessage[]> => {
    const userId = chatApi.getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return authFetch<ConversationMessage[]>(`/api/${userId}/conversations/${conversationId}/messages`);
  },
};

export type { ChatMessage, ChatResponse, Conversation, ConversationMessage };
