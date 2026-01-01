/**
 * Authentication API client for the Todo App backend.
 *
 * This module handles login and signup by communicating with the FastAPI backend
 * which issues JWT tokens for authentication.
 *
 * The backend runs at the API_URL (default: http://localhost:8000)
 */

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function authRequest<T>(
  endpoint: string,
  body: { email: string; password: string }
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Parse response once - body stream can only be read once
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      // Response is not JSON, get status text
      throw new Error(response.statusText || "Request failed");
    }

    if (!response.ok) {
      const errorMessage =
        (data as { detail?: string; message?: string })?.detail ||
        (data as { detail?: string; message?: string })?.message ||
        "Request failed";
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Cannot connect to server. Make sure the backend is running on http://localhost:8000");
    }
    throw error;
  }
}

export const authApi = {
  /**
   * Sign in a user with email and password.
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    return authRequest<AuthResponse>("/auth/login", { email, password });
  },

  /**
   * Sign up a new user with email and password.
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    return authRequest<AuthResponse>("/auth/signup", { email, password });
  },
};
