import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import ConfirmModal from "./ConfirmModal";

interface TaskItemProps {
  task: Task;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onUpdate: (id: number, title: string, description: string) => void;
}

export default function TaskItem({ task, onDelete, onToggle, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDeleteModal]);

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, editTitle.trim(), editDescription.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(task.id);
  };

  if (isEditing) {
    return (
      <div style={styles.taskCard}>
        <div style={styles.editHeader}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span style={styles.editTitle}>Edit Task</span>
        </div>

        <div style={styles.editRow}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
            style={styles.editInput}
            autoFocus
          />
        </div>
        <div style={styles.editRow}>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            style={styles.editTextarea}
            rows={3}
          />
        </div>
        <div style={styles.actions}>
          <button onClick={handleSave} style={styles.saveButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Save
          </button>
          <button onClick={handleCancel} style={styles.cancelButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.taskCard,
        ...(task.completed ? styles.completed : {}),
      }}
    >
      <div style={styles.taskContent}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            style={styles.checkbox}
          />
          <span
            style={{
              ...styles.customCheckbox,
              ...(task.completed ? styles.customCheckboxChecked : {}),
            }}
          />
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            style={{
              ...styles.checkIcon,
              ...(task.completed ? styles.checkIconVisible : {}),
            }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </label>
        <div style={styles.taskDetails}>
          <h3
            style={{
              ...styles.taskTitle,
              ...(task.completed ? styles.taskTitleCompleted : {}),
            }}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              style={{
                ...styles.taskDescription,
                ...(task.completed ? styles.taskDescriptionCompleted : {}),
              }}
            >
              {task.description}
            </p>
          )}
        </div>
      </div>
      <div style={styles.actions}>
        <button
          onClick={() => setIsEditing(true)}
          style={styles.editButton}
          title="Edit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          style={styles.deleteButton}
          title="Delete"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

const styles = {
  taskCard: {
    backgroundColor: "#1a1a1a",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #2a2a2a",
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "16px",
    transition: "all 0.2s ease",
    animation: "slideIn 0.25s ease",
  } as const,
  completed: {
    opacity: 0.5,
    backgroundColor: "#141414",
    borderColor: "#222222",
  } as const,
  taskContent: {
    display: "flex" as const,
    gap: "14px",
    alignItems: "flex-start" as const,
  } as const,
  checkboxLabel: {
    position: "relative" as const,
    display: "inline-block" as const,
    cursor: "pointer",
    paddingTop: "2px",
  } as const,
  checkbox: {
    position: "absolute" as const,
    opacity: 0,
    cursor: "pointer",
  } as const,
  customCheckbox: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: "22px",
    height: "22px",
    border: "2px solid #404040",
    borderRadius: "6px",
    backgroundColor: "#141414",
    transition: "all 0.2s ease",
  } as const,
  customCheckboxChecked: {
    backgroundColor: "#f97316",
    borderColor: "#f97316",
  } as const,
  checkIcon: {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "#000000",
    opacity: 0,
    transition: "opacity 0.15s ease",
    pointerEvents: "none" as const,
  } as const,
  checkIconVisible: {
    opacity: 1,
  } as const,
  taskDetails: {
    flex: 1,
  } as const,
  taskTitle: {
    margin: "0 0 6px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 1.4,
    transition: "all 0.2s ease",
  } as const,
  taskTitleCompleted: {
    textDecoration: "line-through",
    color: "#6b7280",
  } as const,
  taskDescription: {
    margin: "0",
    fontSize: "14px",
    color: "#9ca3af",
    lineHeight: 1.6,
    transition: "all 0.2s ease",
  } as const,
  taskDescriptionCompleted: {
    color: "#4b5563",
  } as const,
  actions: {
    display: "flex" as const,
    gap: "8px",
    justifyContent: "flex-end" as const,
  } as const,
  editHeader: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
    marginBottom: "12px",
    color: "#f97316",
  } as const,
  editTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
  } as const,
  editRow: {
    marginBottom: "12px",
  } as const,
  editInput: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box" as const,
    backgroundColor: "#141414",
    color: "#ffffff",
  } as const,
  editTextarea: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box" as const,
    resize: "vertical" as const,
    lineHeight: 1.5,
    fontFamily: "inherit",
    backgroundColor: "#141414",
    color: "#ffffff",
  } as const,
  saveButton: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
    padding: "10px 16px",
    backgroundColor: "#f97316",
    color: "#000000",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as const,
  cancelButton: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
    padding: "10px 16px",
    backgroundColor: "transparent",
    color: "#9ca3af",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    border: "1px solid #2a2a2a",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as const,
  editButton: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: "8px",
    backgroundColor: "transparent",
    color: "#6b7280",
    borderRadius: "8px",
    fontSize: "13px",
    border: "1px solid #2a2a2a",
    cursor: "pointer",
    width: "34px",
    height: "34px",
    transition: "all 0.2s ease",
  } as const,
  deleteButton: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: "8px",
    backgroundColor: "transparent",
    color: "#6b7280",
    borderRadius: "8px",
    fontSize: "13px",
    border: "1px solid #2a2a2a",
    cursor: "pointer",
    width: "34px",
    height: "34px",
    transition: "all 0.2s ease",
  } as const,
};
