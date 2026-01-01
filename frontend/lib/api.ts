import { Task, TaskCreate, TaskUpdate } from "@/types/task";

const API_BASE_URL = "http://localhost:8000";

async function apiRequest<T>(
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
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const taskApi = {
  getTasks: (): Promise<Task[]> =>
    apiRequest<Task[]>("/tasks"),

  getTask: (id: number): Promise<Task> =>
    apiRequest<Task>(`/tasks/${id}`),

  createTask: (task: TaskCreate): Promise<Task> =>
    apiRequest<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),

  updateTask: (id: number, task: TaskUpdate): Promise<Task> =>
    apiRequest<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    }),

  deleteTask: (id: number): Promise<{ message: string }> =>
    apiRequest<{ message: string }>(`/tasks/${id}`, {
      method: "DELETE",
    }),

  toggleTask: (id: number): Promise<Task> =>
    apiRequest<Task>(`/tasks/${id}/toggle`, {
      method: "PATCH",
    }),
};
