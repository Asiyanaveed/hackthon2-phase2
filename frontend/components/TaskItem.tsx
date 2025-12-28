import { useState } from "react";
import { Task } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onUpdate: (id: number, title: string, description: string) => void;
}

export default function TaskItem({ task, onDelete, onToggle, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, editTitle.trim(), editDescription.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id);
    }
  };

  if (isEditing) {
    return (
      <div style={styles.taskCard}>
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
            style={styles.editInput}
            autoFocus
          />
        </div>
        <div style={styles.inputGroup}>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Task description"
            style={styles.editTextarea}
            rows={2}
          />
        </div>
        <div style={styles.actions}>
          <button onClick={handleSave} style={styles.saveButton}>
            <span>💾</span> Save
          </button>
          <button onClick={handleCancel} style={styles.cancelButton}>
            <span>✕</span> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      ...styles.taskCard,
      ...(task.completed ? styles.completed : {}),
    }}>
      <div style={styles.taskContent}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            style={styles.checkbox}
          />
          <span style={styles.customCheckbox}></span>
        </label>
        <div style={styles.taskDetails}>
          <h3 style={styles.taskTitle}>{task.title}</h3>
          {task.description && (
            <p style={styles.taskDescription}>{task.description}</p>
          )}
        </div>
      </div>
      <div style={styles.actions}>
        <button
          onClick={() => setIsEditing(true)}
          style={styles.editButton}
          title="Edit task"
        >
          <span>✏️</span> Edit
        </button>
        <button
          onClick={handleDelete}
          style={styles.deleteButton}
          title="Delete task"
        >
          <span>🗑️</span> Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  taskCard: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "all 0.2s ease",
  } as const,
  completed: {
    opacity: 0.5,
  } as const,
  taskContent: {
    display: "flex" as const,
    gap: "16px",
    alignItems: "flex-start" as const,
  } as const,
  checkboxLabel: {
    position: "relative" as const,
    display: "inline-block" as const,
    cursor: "pointer",
  } as const,
  checkbox: {
    position: "absolute" as const,
    opacity: 0,
    cursor: "pointer",
  } as const,
  customCheckbox: {
    display: "inline-block" as const,
    width: "24px",
    height: "24px",
    border: "3px solid #cbd5e0",
    borderRadius: "6px",
    backgroundColor: "white",
    transition: "all 0.2s ease",
    marginTop: "2px",
  } as const,
  "&:has(input:checked)": {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  } as const,
  "&:has(input:checked)::after": {
    content: '"✓"',
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    height: "100%",
  } as const,
  taskDetails: {
    flex: 1,
    paddingTop: "2px",
  } as const,
  taskTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: "600",
    color: "#2d3748",
    lineHeight: "1.4",
  } as const,
  taskDescription: {
    margin: "0",
    fontSize: "15px",
    color: "#718096",
    lineHeight: "1.6",
  } as const,
  actions: {
    display: "flex" as const,
    gap: "10px",
    justifyContent: "flex-end" as const,
  } as const,
  inputGroup: {
    marginBottom: "12px",
  } as const,
  editInput: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "16px",
    boxSizing: "border-box" as const,
  } as const,
  editTextarea: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box" as const,
    resize: "vertical" as const,
    lineHeight: "1.6",
  } as const,
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#48bb78",
    color: "white",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
    boxShadow: "0 2px 8px rgba(72, 187, 120, 0.3)",
  } as const,
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#a0aec0",
    color: "white",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
    boxShadow: "0 2px 8px rgba(160, 174, 192, 0.3)",
  } as const,
  editButton: {
    padding: "10px 20px",
    backgroundColor: "#667eea",
    color: "white",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
  } as const,
  deleteButton: {
    padding: "10px 20px",
    backgroundColor: "#f56565",
    color: "white",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
    boxShadow: "0 2px 8px rgba(245, 101, 101, 0.3)",
  } as const,
};
