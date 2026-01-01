import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Store the currently focused element
      previousActiveElement.current = document.activeElement;
      // Focus the modal for accessibility
      setTimeout(() => {
        modalRef.current?.focus();
      }, 10);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      // Restore focus to the element that opened the modal
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Focus trap - handle tab key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconColor: "#ef4444",
      iconBg: "rgba(239, 68, 68, 0.1)",
      buttonColor: "#ef4444",
    },
    warning: {
      iconColor: "#fbbf24",
      iconBg: "rgba(251, 191, 36, 0.1)",
      buttonColor: "#fbbf24",
    },
    info: {
      iconColor: "#3b82f6",
      iconBg: "rgba(59, 130, 246, 0.1)",
      buttonColor: "#f97316",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      style={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
    >
      <div
        style={styles.modal}
        ref={modalRef}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Icon */}
        <div style={{ ...styles.iconContainer, backgroundColor: style.iconBg }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={style.iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <h2 id="modal-title" style={styles.title}>
            {title}
          </h2>
          <p id="modal-message" style={styles.message}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            onClick={onClose}
            style={styles.cancelButton}
            autoFocus
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              ...styles.confirmButton,
              backgroundColor: style.buttonColor,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 2000,
    padding: "20px",
    animation: "fadeIn 0.2s ease",
  } as const,
  modal: {
    backgroundColor: "#1a1a1a",
    borderRadius: "16px",
    border: "1px solid #2a2a2a",
    padding: "28px",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
    animation: "slideIn 0.2s ease",
    outline: "none",
  } as const,
  iconContainer: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    marginBottom: "20px",
  } as const,
  content: {
    marginBottom: "24px",
    textAlign: "center" as const,
  } as const,
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 10px 0",
  } as const,
  message: {
    fontSize: "15px",
    color: "#9ca3af",
    margin: 0,
    lineHeight: 1.5,
  } as const,
  actions: {
    display: "flex" as const,
    gap: "12px",
    justifyContent: "center" as const,
  } as const,
  cancelButton: {
    flex: 1,
    padding: "12px 20px",
    backgroundColor: "transparent",
    color: "#9ca3af",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as const,
  confirmButton: {
    flex: 1,
    padding: "12px 20px",
    color: "#000000",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as const,
};
