import { useState } from "react";
import { TaskCreate } from "@/types/task";

interface TaskFormProps {
  onSubmit: (task: TaskCreate) => void;
}

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({ title: title.trim(), description: description.trim() });
      setTitle("");
      setDescription("");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.header}>
        <span style={styles.headerIcon}>➕</span>
        <span style={styles.headerText}>Create New Task</span>
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="title" style={styles.label}>Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          style={styles.input}
          required
        />
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="description" style={styles.label}>Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details about this task..."
          style={styles.textarea}
          rows={3}
        />
      </div>
      <button type="submit" style={styles.button}>
        <span style={styles.buttonIcon}>✓</span>
        Add Task
      </button>
    </form>
  );
}

const styles = {
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    padding: "28px",
    borderRadius: "16px",
    marginBottom: "32px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  } as const,
  header: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "10px",
    marginBottom: "24px",
  } as const,
  headerIcon: {
    fontSize: "24px",
  },
  headerText: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#2d3748",
  },
  formGroup: {
    marginBottom: "20px",
  } as const,
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#4a5568",
    fontSize: "14px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  } as const,
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    fontSize: "16px",
    boxSizing: "border-box" as const,
  } as const,
  textarea: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box" as const,
    resize: "vertical" as const,
    lineHeight: "1.6",
  } as const,
  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: "8px",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  } as const,
  buttonIcon: {
    fontSize: "18px",
    fontWeight: "900",
  },
};
