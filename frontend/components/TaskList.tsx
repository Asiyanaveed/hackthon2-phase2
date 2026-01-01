import { Task } from "@/types/task";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onUpdate: (id: number, title: string, description: string) => void;
}

export default function TaskList({
  tasks,
  onDelete,
  onToggle,
  onUpdate,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <h3 style={styles.emptyTitle}>No tasks yet</h3>
        <p style={styles.emptyText}>Create your first task to get started</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onToggle={onToggle}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "12px",
  } as const,
  emptyState: {
    textAlign: "center" as const,
    padding: "60px 32px",
    backgroundColor: "#1a1a1a",
    borderRadius: "14px",
    border: "1px solid #2a2a2a",
  } as const,
  emptyIcon: {
    color: "#404040",
    marginBottom: "16px",
    display: "flex" as const,
    justifyContent: "center" as const,
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
    margin: "0 0 8px 0",
  } as const,
  emptyText: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  } as const,
};
