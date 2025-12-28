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
        <div style={styles.emptyIcon}>📝</div>
        <h3 style={styles.emptyTitle}>No tasks yet</h3>
        <p style={styles.emptyText}>Create your first task to get started!</p>
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
    gap: "16px",
  } as const,
  emptyState: {
    textAlign: "center" as const,
    padding: "80px 40px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  } as const,
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: "12px",
  } as const,
  emptyText: {
    color: "#718096",
    fontSize: "18px",
    margin: 0,
  } as const,
};
