import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthContextType {
  token: string | null;
  user: { id: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from localStorage only on client after mount
  useEffect(() => {
    const storedToken = localStorage.getItem("jwt_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Sync to localStorage when auth state changes (only after initial load)
  useEffect(() => {
    if (!isInitialized) return;

    if (token) {
      localStorage.setItem("jwt_token", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
    } else {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user");
    }
  }, [token, user, isInitialized]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { authApi } = await import("./better-auth");
      const response = await authApi.signIn(email, password);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Login failed");
      throw error;
    }
  };

  const signup = async (email: string, password: string): Promise<void> => {
    try {
      const { authApi } = await import("./better-auth");
      const response = await authApi.signUp(email, password);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Signup failed");
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
