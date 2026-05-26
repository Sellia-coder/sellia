"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle, X } from "@phosphor-icons/react";
import styles from "./success-modal.module.css";

interface Action {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
}

interface Props {
  title: string;
  description?: string;
  actions?: Action[];
  onClose: () => void;
}

export default function SuccessModal({
  title,
  description,
  actions,
  onClose,
}: Props) {
  useEffect(() => {
    if (!actions || actions.length === 0) {
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }
  }, [actions, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Fermer"
        >
          <X size={16} weight="bold" />
        </button>

        <div className={styles.iconCircle}>
          <CheckCircle size={48} weight="fill" />
        </div>

        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}

        {actions && actions.length > 0 && (
          <div className={styles.actions}>
            {actions.map((action, idx) => {
              const isPrimary = action.variant !== "secondary";
              const className = isPrimary
                ? styles.btnPrimary
                : styles.btnSecondary;

              if (action.href) {
                return (
                  <Link key={idx} href={action.href} className={className}>
                    {action.icon}
                    {action.label}
                  </Link>
                );
              }
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={action.onClick}
                  className={className}
                >
                  {action.icon}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
