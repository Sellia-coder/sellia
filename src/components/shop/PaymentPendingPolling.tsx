"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, RotateCw, CheckCircle } from "lucide-react";
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

function getNextDelayMs(pollCount: number, aggressive: boolean): number {
  if (aggressive) return 2000;
  if (pollCount < 5) return 2000;
  if (pollCount < 12) return 5000;
  return 10000;
}

type FeedbackKind = "idle" | "checking" | "pending" | "success" | "failed";

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
  const [pollCount, setPollCount] = useState(0);
  const [isManualChecking, setIsManualChecking] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackKind>("idle");
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const cancelledRef = useRef(false);
  const aggressiveRef = useRef(false);
  const aggressivePollsRef = useRef(0);

  const operator = getOperatorInfo(countryCode, operatorCode);
  const operatorName = operator?.name ?? "Mobile Money";
  const ussd = operator?.ussd;

  const performPoll = useCallback(async (): Promise<
    "success" | "failed" | "pending"
  > => {
    const res = await fetch(
      `/api/shop/${shopSlug}/orders/${encodeURIComponent(orderNumber)}/status`,
      { cache: "no-store" }
    );
    if (!res.ok) return "pending";
    const data = await res.json();
    if (data.paymentStatus === "paid_escrow") return "success";
    if (data.paymentStatus === "failed" || data.paymentStatus === "cancelled") {
      return "failed";
    }
    return "pending";
  }, [shopSlug, orderNumber]);

  const runReconcile = useCallback(async (): Promise<
    "success" | "failed" | "pending"
  > => {
    const reconcileRes = await fetch(
      `/api/admin/reconcile/${encodeURIComponent(orderNumber)}`,
      { method: "POST", cache: "no-store" }
    );
    if (!reconcileRes.ok) return "pending";
    const data = await reconcileRes.json();
    if (data.reconciled && data.new_payment_status === "paid_escrow") {
      return "success";
    }
    if (data.reconciled && data.new_payment_status === "failed") {
      return "failed";
    }
    return "pending";
  }, [orderNumber]);

  useEffect(() => {
    cancelledRef.current = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let currentCount = 0;

    const loop = async () => {
      if (cancelledRef.current) return;
      try {
        const result = await performPoll();
        if (cancelledRef.current) return;
        if (result === "success") {
          cancelledRef.current = true;
          setFeedback("success");
          setFeedbackText("Paiement confirmé !");
          onSuccess();
          return;
        }
        if (result === "failed") {
          cancelledRef.current = true;
          setFeedback("failed");
          onFailed("Le paiement n'a pas pu être finalisé.");
          return;
        }
        setFeedback((f) => (f === "idle" ? "pending" : f));
      } catch {
        // retry on network error
      }

      currentCount += 1;
      setPollCount(currentCount);

      if (aggressiveRef.current) {
        aggressivePollsRef.current += 1;
        if (aggressivePollsRef.current >= 15) {
          aggressiveRef.current = false;
        }
      }

      if (!cancelledRef.current) {
        const delay = getNextDelayMs(currentCount, aggressiveRef.current);
        timeoutId = setTimeout(loop, delay);
      }
    };

    timeoutId = setTimeout(loop, 2000);

    return () => {
      cancelledRef.current = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [performPoll, onSuccess, onFailed]);

  const handleManualCheck = async () => {
    if (isManualChecking || cancelledRef.current) return;
    setIsManualChecking(true);
    setFeedback("checking");
    setFeedbackText("Vérification en cours auprès de l'opérateur…");
    aggressiveRef.current = true;
    aggressivePollsRef.current = 0;

    try {
      const reconcileResult = await runReconcile();
      if (cancelledRef.current) return;

      if (reconcileResult === "success") {
        cancelledRef.current = true;
        setFeedback("success");
        setFeedbackText("Paiement confirmé !");
        onSuccess();
        return;
      }
      if (reconcileResult === "failed") {
        cancelledRef.current = true;
        setFeedback("failed");
        onFailed("Le paiement a échoué.");
        return;
      }

      const pollResult = await performPoll();
      if (pollResult === "success") {
        cancelledRef.current = true;
        setFeedback("success");
        setFeedbackText("Paiement confirmé !");
        onSuccess();
        return;
      }

      setFeedback("pending");
      setFeedbackText(
        "Pas encore confirmé côté opérateur. Nous vérifions toutes les 2 secondes pendant 30 secondes."
      );
    } catch {
      setFeedback("pending");
      setFeedbackText("Erreur réseau. Nouvelle tentative automatique…");
    } finally {
      setIsManualChecking(false);
    }
  };

  const handleCancelClick = () => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;
    onCancel();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.dots} aria-hidden="true">
          <span className={styles.dot} style={{ background: primaryColor }} />
          <span className={styles.dot} style={{ background: primaryColor }} />
          <span className={styles.dot} style={{ background: primaryColor }} />
        </div>

        <h2 className={styles.title}>Paiement en cours de vérification</h2>

        <p className={styles.subtitle}>
          Confirmez le paiement de{" "}
          <strong>
            {total.toLocaleString("fr-FR")} {currency}
          </strong>{" "}
          sur votre téléphone via <strong>{operatorName}</strong>.
          <br />
          Nous vérifions automatiquement.
        </p>

        {feedbackText && (
          <div
            className={`${styles.feedback} ${
              feedback === "success"
                ? styles.feedbackSuccess
                : feedback === "failed"
                  ? styles.feedbackFailed
                  : feedback === "checking"
                    ? styles.feedbackChecking
                    : styles.feedbackPending
            }`}
            role="status"
          >
            {feedbackText}
          </div>
        )}

        <div className={styles.orderRef}>
          Référence&nbsp;: <span>{orderNumber}</span>
        </div>

        {ussd && (
          <div className={styles.ussdHint}>
            Pas reçu de notification ? Composez{" "}
            <span className={styles.ussdCode}>{ussd}</span> sur votre téléphone.
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleManualCheck}
            disabled={isManualChecking}
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            {isManualChecking ? (
              <>
                <RotateCw size={14} className={styles.spinIcon} />
                Vérification...
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                J&apos;ai payé, vérifier
              </>
            )}
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleCancelClick}
          >
            <X size={13} />
            Annuler
          </button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className={styles.debug}>polls: {pollCount}</div>
        )}
      </div>
    </div>
  );
}
