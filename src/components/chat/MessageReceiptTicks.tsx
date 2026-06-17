"use client";

import { Check } from "@phosphor-icons/react";
import styles from "./message-receipt-ticks.module.css";

export type ReceiptState = "sent" | "delivered" | "read";

export function getReceiptState(
  deliveredAt: string | null | undefined,
  readAt: string | null | undefined
): ReceiptState {
  if (readAt) return "read";
  if (deliveredAt) return "delivered";
  return "sent";
}

interface Props {
  deliveredAt?: string | null;
  readAt?: string | null;
  /** Sur bulle foncée (client) */
  onDark?: boolean;
  className?: string;
}

export default function MessageReceiptTicks({
  deliveredAt,
  readAt,
  onDark = false,
  className,
}: Props) {
  const state = getReceiptState(deliveredAt, readAt);

  return (
    <span
      className={`${styles.wrap} ${onDark ? styles.onDark : ""} ${styles[state]} ${className ?? ""}`}
      aria-label={
        state === "read"
          ? "Lu"
          : state === "delivered"
            ? "Reçu"
            : "Envoyé"
      }
      title={
        state === "read"
          ? "Lu"
          : state === "delivered"
            ? "Reçu"
            : "Envoyé"
      }
    >
      <Check size={11} weight="bold" className={styles.tick} />
      {(state === "delivered" || state === "read") && (
        <Check size={11} weight="bold" className={styles.tickSecond} />
      )}
    </span>
  );
}
