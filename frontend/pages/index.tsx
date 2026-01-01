"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { taskApi } from "@/lib/api";
import { Task, TaskCreate } from "@/types/task";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import Chat from "@/components/Chat";

export default function Home() {
  const { isAuthenticated, logout, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Prevent hydration mismatch by only rendering auth-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load tasks" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    }
  }, [isAuthenticated]);

  const handleCreateTask = async (taskData: TaskCreate) => {
    try {
      const newTask = await taskApi.createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      setMessage({ type: "success", text: "Task created successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to create task" });
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      setMessage({ type: "success", text: "Task deleted" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to delete task" });
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
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update task" });
      console.error(err);
    }
  };

  const handleUpdateTask = async (id: number, title: string, description: string) => {
    try {
      const updatedTask = await taskApi.updateTask(id, { title, description });
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      setMessage({ type: "success", text: "Task updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update task" });
      console.error(err);
    }
  };

  const clearMessage = () => setMessage(null);

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.notAuthenticated}>
          <div style={styles.lockIcon}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={styles.notAuthTitle}>Task Manager</h2>
          <p style={styles.notAuthText}>
            Sign in to access your personal task workspace
          </p>
          <a href="/login" style={styles.notAuthButton}>
            Sign In
          </a>
          <p style={styles.notAuthFooter}>
            Don&apos;t have an account?{" "}
            <a href="/signup" style={styles.notAuthLink}>
              Create one
            </a>
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  // Get first letter of email for avatar
  const getEmailInitial = (email: string | undefined) => {
    if (!email) return "U";
    return email[0].toUpperCase();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.appLogo}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span style={styles.appTitle}>TaskFlow</span>
          </div>
          <p style={styles.subtitle}>
            Welcome back,
            <span style={styles.userEmail}>{user?.email?.split("@")[0]}</span>
          </p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.stats}>
            <div style={styles.statBox}>
              <span style={styles.statNumber}>{tasks.length}</span>
              <span style={styles.statLabel}>Total</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statNumberPending}>{pendingCount}</span>
              <span style={styles.statLabel}>Pending</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statNumberCompleted}>{completedCount}</span>
              <span style={styles.statLabel}>Done</span>
            </div>
          </div>
          <button onClick={() => setShowChat(true)} style={styles.chatButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
            </svg>
            AI Chat
          </button>
          <div style={styles.userAvatar} title={user?.email}>
            {getEmailInitial(user?.email)}
          </div>
          <button onClick={logout} style={styles.logoutButton} title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          ...styles.messageBanner,
          ...(message.type === "success" ? styles.messageSuccess : styles.messageError)
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {message.type === "success" ? (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </>
            )}
          </svg>
          <span style={styles.messageText}>{message.text}</span>
          <button onClick={clearMessage} style={styles.messageClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatModal}>
            <Chat onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}

      <div style={styles.mainContent}>
        <TaskForm onSubmit={handleCreateTask} />

        <div style={styles.tasksSection}>
          <div style={styles.tasksHeader}>
            <span style={styles.tasksTitle}>Your Tasks</span>
            <span style={styles.tasksCount}>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading your tasks...</p>
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
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "32px 24px 60px",
  } as const,
  header: {
    display: "flex" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: "32px",
    gap: "24px",
    flexWrap: "wrap" as const,
  } as const,
  headerLeft: {
    flex: 1,
  } as const,
  appLogo: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "12px",
    marginBottom: "8px",
  } as const,
  appTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "-0.5px",
  } as const,
  headerRight: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "16px",
  } as const,
  subtitle: {
    fontSize: "15px",
    color: "#9ca3af",
    marginTop: "4px",
  } as const,
  userEmail: {
    color: "#f97316",
    fontWeight: "600",
    marginLeft: "6px",
  } as const,
  stats: {
    display: "flex" as const,
    gap: "10px",
  } as const,
  statBox: {
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    padding: "12px 18px",
    backgroundColor: "#1a1a1a",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
    minWidth: "76px",
  } as const,
  statNumber: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#ffffff",
  } as const,
  statNumberPending: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#fbbf24",
  } as const,
  statNumberCompleted: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#22c55e",
  } as const,
  statLabel: {
    fontSize: "11px",
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginTop: "2px",
  } as const,
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    color: "#f97316",
    fontSize: "16px",
    fontWeight: "600",
    border: "1px solid rgba(249, 115, 22, 0.3)",
  } as const,
  logoutButton: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    padding: "10px",
    backgroundColor: "transparent",
    color: "#9ca3af",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    width: "40px",
    height: "40px",
  } as const,
  notAuthenticated: {
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    padding: "60px 32px",
    backgroundColor: "#1a1a1a",
    borderRadius: "16px",
    border: "1px solid #2a2a2a",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
    maxWidth: "420px",
    width: "100%",
    margin: "80px auto",
  } as const,
  lockIcon: {
    color: "#f97316",
    marginBottom: "24px",
  } as const,
  notAuthTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "12px",
    textAlign: "center" as const,
  } as const,
  notAuthText: {
    fontSize: "15px",
    color: "#9ca3af",
    textAlign: "center" as const,
    marginBottom: "28px",
    lineHeight: 1.5,
  } as const,
  notAuthButton: {
    display: "inline-block",
    padding: "14px 36px",
    backgroundColor: "#f97316",
    color: "#000000",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    transition: "all 0.2s ease",
    marginBottom: "20px",
  } as const,
  notAuthFooter: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  } as const,
  notAuthLink: {
    color: "#f97316",
    fontWeight: "500",
    textDecoration: "none",
  } as const,
  mainContent: {
    animation: "fadeIn 0.3s ease",
  } as const,
  tasksSection: {
    marginTop: "32px",
  } as const,
  tasksHeader: {
    display: "flex" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: "16px",
    padding: "0 4px",
  } as const,
  tasksTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#e5e5e5",
  } as const,
  tasksCount: {
    fontSize: "13px",
    color: "#6b7280",
  } as const,
  messageBanner: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "10px",
    marginBottom: "24px",
    animation: "fadeIn 0.25s ease",
  } as const,
  messageSuccess: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#22c55e",
  } as const,
  messageError: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#ef4444",
  } as const,
  messageText: {
    flex: 1,
    fontSize: "14px",
    fontWeight: "500",
  } as const,
  messageClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    opacity: 0.7,
    display: "flex" as const,
  } as const,
  loadingContainer: {
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: "80px 20px",
    backgroundColor: "#1a1a1a",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
  } as const,
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #2a2a2a",
    borderTop: "3px solid #f97316",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: "16px",
  } as const,
  loadingText: {
    color: "#9ca3af",
    fontSize: "15px",
  } as const,
  chatButton: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    color: "#f97316",
    border: "1px solid rgba(249, 115, 22, 0.3)",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as const,
  chatOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 1000,
    padding: "20px",
  } as const,
  chatModal: {
    width: "100%",
    maxWidth: "500px",
    height: "80vh",
    maxHeight: "700px",
  } as const,
};
