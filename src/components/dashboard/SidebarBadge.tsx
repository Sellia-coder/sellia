"use client";

import styles from "./sidebar-badge.module.css";

interface Props {
  count: number;
  variant?: "default" | "warning" | "danger" | "success";
  urgent?: boolean;
}

export default function SidebarBadge({
  count,
  variant = "default",
  urgent = false,
}: Props) {
  if (count <= 0) return null;

  const variantClass = {
    default: styles.default,
    warning: styles.warning,
    danger: styles.danger,
    success: styles.success,
  }[variant];

  const ariaLabel =
    variant === "danger"
      ? `${count} actions urgentes`
      : `${count} éléments`;

  return (
    <span
      className={`${styles.badge} ${variantClass} ${urgent ? styles.urgent : ""}`}
      aria-label={ariaLabel}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
