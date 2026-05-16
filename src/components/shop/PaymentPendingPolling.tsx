"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, X } from "lucide-react";
import styles from "./payment-pending.module.css";
import { getOperatorInfo } from "@/lib/cartevo/operators-catalog";

interface Props {
  shopSlug: string;
  orderNumber: string;
  operatorCode: string;
  countryCode: string;
  total: number;
  currency: string;
  primaryColor?: string;
  onSuccess: () => void;
  onFailed: (reason: string) => void;
  onCancel: () => void;
}

const COUNTDOWN_SECONDS = 5 * 60;
const POLL_INTERVAL_MS = 3000;

export default function PaymentPendingPolling({
  shopSlug,
  orderNumber,
  operatorCode,
  countryCode,
  total,
  currency,
  primaryColor = "#E84B1F",
  onSuccess,
  onFailed,
  onCancel,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [pollCount, setPollCount] = useState(0);
  const cancelledRef = useRef(false);

  const operator = getOperatorInfo(countryCode, operatorCode);

  const operatorName = operator?.name ?? "Mobile Money";
  const operatorColor = operator?.color ?? primaryColor;
  const ussd = operator?.ussd;

  useEffect(() => {
    if (secondsLeft <= 0) {
      cancelledRef.current = true;
      onFailed("Délai d'attente dépassé. Aucun montant n'a été débité.");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onFailed]);

  useEffect(() => {
    cancelledRef.current = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      if (cancelledRef.current) return;
      try {
        const res = await fetch(
          `/api/shop/${shopSlug}/orders/${encodeURIComponent(orderNumber)}/status`,
          { cache: "no-store" }
        );
        if (cancelledRef.current) return;
        if (!res.ok) {
          timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }
        const data = await res.json();
        if (cancelledRef.current) return;

        if (data.paymentStatus === "paid_escrow") {
          cancelledRef.current = true;
          onSuccess();
          return;
        }
        if (
          data.paymentStatus === "failed" ||
          data.paymentStatus === "cancelled"
        ) {
          cancelledRef.current = true;
          onFailed(
            data.paymentStatus === "cancelled"
              ? "Paiement annulé"
              : "Le paiement a échoué"
          );
          return;
        }

        setPollCount((c) => c + 1);
        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelledRef.current) {
          timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    };

    timeoutId = setTimeout(poll, 2000);

    return () => {
      cancelledRef.current = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [shopSlug, orderNumber, onSuccess, onFailed]);

  const handleCancelClick = () => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;
    onCancel();
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div
          className={styles.loaderRing}
          style={{ borderTopColor: operatorColor }}
        >
          <Loader2 size={28} className={styles.loaderIcon} />
        </div>

        <h2 className={styles.title}>Confirmer sur votre téléphone</h2>

        <p className={styles.subtitle}>
          Une notification{" "}
          <strong style={{ color: operatorColor }}>{operatorName}</strong> a été
          envoyée à votre numéro.
          <br />
          Confirmez le paiement de{" "}
          <strong>
            {total.toLocaleString("fr-FR")} {currency}
          </strong>
          .
        </p>

        {ussd && (
          <div className={styles.ussdBox}>
            <div className={styles.ussdEmoji}>💡</div>
            <div className={styles.ussdContent}>
              <div className={styles.ussdHint}>
                Pas de notification après 30 secondes ?
              </div>
              <div className={styles.ussdCode}>
                Composez <strong>{ussd}</strong> sur votre téléphone
              </div>
            </div>
          </div>
        )}

        <div className={styles.countdown}>
          <span className={styles.countdownLabel}>Temps restant</span>
          <span
            className={styles.countdownValue}
            style={{ color: secondsLeft < 30 ? "#DC2626" : "inherit" }}
          >
            {timeString}
          </span>
        </div>

        <div className={styles.orderRef}>
          Référence : <span>{orderNumber}</span>
        </div>

        <button
          type="button"
          className={styles.cancelBtn}
          onClick={handleCancelClick}
        >
          <X size={14} strokeWidth={2.2} />
          Annuler le paiement
        </button>

        {process.env.NODE_ENV === "development" && (
          <div className={styles.debug}>polls: {pollCount}</div>
        )}
      </div>

      <div className={styles.bgPulse} style={{ background: operatorColor }} />
    </div>
  );
}
