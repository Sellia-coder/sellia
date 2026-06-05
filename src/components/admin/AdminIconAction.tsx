"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type AdminIconVariant = "neutral" | "primary" | "ok" | "danger";

export default function AdminIconAction({
  href,
  onClick,
  title,
  variant = "neutral",
  disabled,
  external,
  children,
}: {
  href?: string;
  onClick?: () => void;
  title: string;
  variant?: AdminIconVariant;
  disabled?: boolean;
  external?: boolean;
  children: ReactNode;
}) {
  const className = [
    "admin-icon-btn",
    variant === "primary" ? "admin-icon-btn--primary" : "",
    variant === "ok" ? "admin-icon-btn--ok" : "",
    variant === "danger" ? "admin-icon-btn--danger" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          title={title}
          aria-label={title}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={className} title={title} aria-label={title}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}
