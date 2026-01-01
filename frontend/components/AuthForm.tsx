import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface AuthFormProps {
  mode: "login" | "signup";
  onSuccess: () => void;
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onSuccess();
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <span style={styles.logoText}>TaskFlow</span>
          </div>
          <h2 style={styles.title}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p style={styles.subtitle}>
            {mode === "login"
              ? "Enter your credentials to access your tasks"
              : "Start organizing your work today"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={styles.input}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              style={styles.input}
              required
              disabled={loading}
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.buttonText}>Please wait...</span>
            ) : mode === "login" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>

          <div style={styles.switchContainer}>
            <p style={styles.switchText}>
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <a href="/signup" style={styles.link}>
                    Sign up
                  </a>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <a href="/login" style={styles.link}>
                    Sign in
                  </a>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: "100vh",
    padding: "24px",
    backgroundColor: "#0f0f0f",
  } as const,
  card: {
    backgroundColor: "#1a1a1a",
    padding: "40px",
    borderRadius: "16px",
    border: "1px solid #2a2a2a",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    maxWidth: "420px",
    width: "100%",
  } as const,
  header: {
    marginBottom: "32px",
    textAlign: "center" as const,
  } as const,
  logo: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: "12px",
    marginBottom: "24px",
  } as const,
  logoIcon: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center",
    width: "48px",
    height: "48px",
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    borderRadius: "12px",
    color: "#f97316",
  } as const,
  logoText: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
  } as const,
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  } as const,
  subtitle: {
    fontSize: "15px",
    color: "#9ca3af",
    margin: 0,
    lineHeight: 1.5,
  } as const,
  form: {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "20px",
  } as const,
  formGroup: {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "8px",
  } as const,
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#e5e5e5",
  } as const,
  input: {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    fontSize: "15px",
    color: "#ffffff",
    backgroundColor: "#141414",
    boxSizing: "border-box" as const,
    transition: "all 0.2s ease",
  } as const,
  button: {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: "8px",
    width: "100%",
    padding: "14px",
    backgroundColor: "#f97316",
    color: "#000000",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    marginTop: "8px",
    transition: "all 0.2s ease",
  } as const,
  buttonText: {
    color: "#000000",
  } as const,
  switchContainer: {
    marginTop: "8px",
    paddingTop: "24px",
    borderTop: "1px solid #2a2a2a",
  } as const,
  switchText: {
    textAlign: "center" as const,
    margin: 0,
    fontSize: "14px",
    color: "#9ca3af",
  } as const,
  link: {
    color: "#f97316",
    fontWeight: "500",
    textDecoration: "none",
    transition: "color 0.2s ease",
  } as const,
  divider: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "16px",
    marginTop: "8px",
  } as const,
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#2a2a2a",
  } as const,
  dividerText: {
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
  } as const,
};
