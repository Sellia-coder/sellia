"use client";

import { useEffect, useState } from "react";
import { Check, X, Info, AlertCircle } from "lucide-react";
import styles from "./ToastProvider.module.css";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToastEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message: string;
        type?: "success" | "error" | "info";
      }>;
      const { message, type = "info" } = customEvent.detail;

      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: Toast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener("sellia:toast", handleToastEvent);
    return () => window.removeEventListener("sellia:toast", handleToastEvent);
  }, []);

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer} aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${
            styles[
              `toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`
            ]
          }`}
        >
          <div className={styles.toastIcon}>
            {toast.type === "success" && <Check size={16} strokeWidth={2.5} />}
            {toast.type === "error" && <AlertCircle size={16} strokeWidth={2.2} />}
            {toast.type === "info" && <Info size={16} strokeWidth={2.2} />}
          </div>
          <span className={styles.toastMessage}>{toast.message}</span>
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => handleClose(toast.id)}
            aria-label="Fermer"
          >
            <X size={14} strokeWidth={2.2} />
          </button>
        </div>
      ))}
    </div>
  );
}
