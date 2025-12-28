import { useState, useEffect } from "react";
import { Task, TaskCreate } from "@/types/task";
import { taskApi } from "@/lib/api";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks. Is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (taskData: TaskCreate) => {
    try {
      const newTask = await taskApi.createTask(taskData);
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      setError("Failed to create task");
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setError("Failed to delete task");
      console.error(err);
    }
  };

  const handleToggleTask = async (id: number) => {
    try {
      const updatedTask = await taskApi.toggleTask(id);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      setError("Failed to update task");
      console.error(err);
    }
  };

  const handleUpdateTask = async (id: number, title: string, description: string) => {
    try {
      const updatedTask = await taskApi.updateTask(id, { title, description });
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      setError("Failed to update task");
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>✨ Task Manager</h1>
      <p style={styles.subtitle}>Stay organized and productive</p>

      {error && (
        <div style={styles.error}>
          <span style={styles.errorIcon}>⚠️</span>
          <span style={styles.errorText}>{error}</span>
          <button
            onClick={loadTasks}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}

      <TaskForm onSubmit={handleCreateTask} />

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading tasks...</p>
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          onDelete={handleDeleteTask}
          onToggle={handleToggleTask}
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "60px 20px",
  } as const,
  title: {
    textAlign: "center" as const,
    marginBottom: "8px",
    fontSize: "56px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent",
    textShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  subtitle: {
    textAlign: "center" as const,
    marginBottom: "48px",
    fontSize: "20px",
    color: "#e0e7ff",
    fontWeight: "400",
  },
  error: {
    backgroundColor: "#fff5f5",
    border: "2px solid #fed7d7",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "24px",
    color: "#c53030",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  errorIcon: {
    fontSize: "20px",
  },
  errorText: {
    flex: 1,
    fontWeight: "500",
  },
  retryButton: {
    padding: "8px 20px",
    backgroundColor: "#c53030",
    color: "white",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
  },
  loadingContainer: {
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: "60px 20px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: "20px",
  } as const,
  loadingText: {
    color: "#4a5568",
    fontSize: "18px",
    fontWeight: "500",
  },
};
