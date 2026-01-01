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
      <div style={styles.formHeader}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span style={styles.formTitle}>Create New Task</span>
      </div>

      <div style={styles.inputGroup}>
        <label htmlFor="title" style={styles.label}>Title</label>
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

      <div style={styles.inputGroup}>
        <label htmlFor="description" style={styles.label}>Description <span style={styles.optional}>(optional)</span></label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          style={styles.textarea}
          rows={3}
        />
      </div>

      <button
        type="submit"
        style={{
          ...styles.button,
          ...(title.trim() ? styles.buttonActive : {})
        }}
        disabled={!title.trim()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Add Task
      </button>
    </form>
  );
}

const styles = {
  form: {
    backgroundColor: "#1a1a1a",
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #2a2a2a",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
  } as const,
  formHeader: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "10px",
    marginBottom: "20px",
    color: "#f97316",
  } as const,
  formTitle: {
    fontSize: "17px",
    fontWeight: "600",
    color: "#ffffff",
  } as const,
  inputGroup: {
    marginBottom: "16px",
  } as const,
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
    color: "#e5e5e5",
    fontSize: "14px",
  } as const,
  optional: {
    color: "#6b7280",
    fontWeight: "400",
  } as const,
  input: {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box" as const,
    backgroundColor: "#141414",
    color: "#ffffff",
    transition: "all 0.2s ease",
  } as const,
  textarea: {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    fontSize: "14px",
    boxSizing: "border-box" as const,
    resize: "vertical" as const,
    lineHeight: 1.6,
    fontFamily: "inherit",
    backgroundColor: "#141414",
    color: "#ffffff",
    transition: "all 0.2s ease",
  } as const,
  button: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: "8px",
    width: "100%",
    padding: "14px 20px",
    backgroundColor: "#2a2a2a",
    color: "#6b7280",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "not-allowed",
    transition: "all 0.2s ease",
    marginTop: "8px",
  } as const,
  buttonActive: {
    backgroundColor: "#f97316",
    color: "#000000",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
  } as const,
};
