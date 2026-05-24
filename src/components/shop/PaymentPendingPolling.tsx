"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  /** Si false, reste sur la page et refresh (ex. page commande premium). */
  autoRedirect?: boolean;
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
  autoRedirect = true,
  onSuccess,
  onFailed,
  onCancel,
}: Props) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [isManualChecking, setIsManualChecking] = useState(false);
  const [forcedAggressive, setForcedAggressive] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackKind>("idle");
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const cancelledRef = useRef(false);
  const aggressiveUntilRef = useRef(0);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const operator = getOperatorInfo(countryCode, operatorCode);
  const operatorName = operator?.name ?? "Mobile Money";
  const ussd = operator?.ussd;

  const completeSuccess = useCallback(() => {
    cancelledRef.current = true;
    setFeedback("success");
    setFeedbackText("Paiement confirmé ! Redirection...");
    setRedirecting(true);
    onSuccess();
    setTimeout(() => {
      if (autoRedirect) {
        router.push(
          `/shop/${shopSlug}/commande/${encodeURIComponent(orderNumber)}`
        );
      } else {
        router.refresh();
        setRedirecting(false);
      }
    }, 800);
  }, [autoRedirect, onSuccess, orderNumber, router, shopSlug]);

  const showFeedback = useCallback(
    (
      kind: "info" | "warning" | "success" | "error",
      text: string,
      durationMs = 6000
    ) => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
      const mapped: FeedbackKind =
        kind === "success"
          ? "success"
          : kind === "error"
            ? "failed"
            : kind === "info"
              ? "checking"
              : "pending";
      setFeedback(mapped);
      setFeedbackText(text);
      if (durationMs > 0) {
        feedbackTimeoutRef.current = setTimeout(() => {
          setFeedback((f) => (f === mapped ? "pending" : f));
          if (mapped !== "success" && mapped !== "failed") {
            setFeedbackText(
              "Nous vérifions automatiquement votre paiement Mobile Money."
            );
          }
        }, durationMs);
      }
    },
    []
  );

  const performBalanceMatch = useCallback(async (): Promise<
    "success" | "failed" | "pending"
  > => {
    try {
      const res = await fetch(
        `/api/shop/${shopSlug}/orders/${encodeURIComponent(orderNumber)}/balance-match`,
        { method: "POST", cache: "no-store" }
      );
      if (!res.ok) return "pending";
      const data = await res.json();
      if (data.matched && data.new_payment_status === "paid_escrow") {
        return "success";
      }
      if (
        data.already_finalized &&
        data.new_payment_status === "paid_escrow"
      ) {
        return "success";
      }
      if (
        data.already_finalized &&
        (data.new_payment_status === "failed" ||
          data.new_payment_status === "cancelled")
      ) {
        return "failed";
      }
    } catch {
      // fallback status passif
    }
    return "pending";
  }, [shopSlug, orderNumber]);

  const performPoll = useCallback(async (): Promise<
    "success" | "failed" | "pending"
  > => {
    const aggressive =
      forcedAggressive || Date.now() < aggressiveUntilRef.current;

    if (aggressive) {
      const balanceResult = await performBalanceMatch();
      if (balanceResult !== "pending") return balanceResult;
    }

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
  }, [shopSlug, orderNumber, forcedAggressive, performBalanceMatch]);

  const handleManualCheck = async () => {
    if (isManualChecking || cancelledRef.current) return;
    setIsManualChecking(true);
    showFeedback("info", "Vérification en cours auprès de l'opérateur...");

    try {
      const res = await fetch(
        `/api/shop/${shopSlug}/orders/${encodeURIComponent(orderNumber)}/balance-match`,
        { method: "POST", cache: "no-store" }
      );

      if (cancelledRef.current) return;

      if (!res.ok) {
        showFeedback(
          "warning",
          "Vérification difficile pour l'instant. Nous continuons automatiquement.",
          8000
        );
        return;
      }

      const data = await res.json();

      if (data.matched && data.new_payment_status === "paid_escrow") {
        completeSuccess();
        return;
      }

      if (
        data.already_finalized &&
        data.new_payment_status === "paid_escrow"
      ) {
        completeSuccess();
        return;
      }

      if (
        data.already_finalized &&
        (data.new_payment_status === "failed" ||
          data.new_payment_status === "cancelled")
      ) {
        showFeedback("error", "Le paiement n'a pas abouti.");
        cancelledRef.current = true;
        setTimeout(() => onFailed("Paiement non abouti"), 1500);
        return;
      }

      showFeedback(
        "info",
        "Votre paiement est en cours de traitement. Nous vérifions automatiquement toutes les 2 secondes.",
        0
      );
      aggressiveUntilRef.current = Date.now() + 60_000;
      setForcedAggressive(true);
    } catch {
      if (!cancelledRef.current) {
        showFeedback(
          "warning",
          "Problème réseau. Nous continuons en arrière-plan.",
          6000
        );
      }
    } finally {
      setIsManualChecking(false);
    }
  };

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
          completeSuccess();
          return;
        }
        if (result === "failed") {
          cancelledRef.current = true;
          setFeedback("failed");
          onFailed("Le paiement n'a pas pu être finalisé.");
          return;
        }
        setFeedback((f) => (f === "idle" ? "pending" : f));
        if (!feedbackText) {
          setFeedbackText(
            "Nous vérifions automatiquement votre paiement Mobile Money."
          );
        }
      } catch {
        // retry on network error
      }

      currentCount += 1;
      setPollCount(currentCount);

      const aggressive =
        forcedAggressive || Date.now() < aggressiveUntilRef.current;
      if (Date.now() >= aggressiveUntilRef.current && forcedAggressive) {
        setForcedAggressive(false);
      }

      if (!cancelledRef.current) {
        const delay = getNextDelayMs(currentCount, aggressive);
        timeoutId = setTimeout(loop, delay);
      }
    };

    timeoutId = setTimeout(loop, 2000);

    return () => {
      cancelledRef.current = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, [performPoll, completeSuccess, onFailed, forcedAggressive]);

  const handleCancelClick = () => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;
    onCancel();
  };

  return (
    <>
    {redirecting && (
      <div className={styles.redirectOverlay} role="status" aria-live="polite">
        <div className={styles.redirectContent}>
          <div className={styles.redirectSuccess}>
            <svg width="64" height="64" viewBox="0 0 64 64" className={styles.redirectCheck} aria-hidden>
              <circle cx="32" cy="32" r="28" stroke="#16A34A" strokeWidth="3" fill="none" />
              <path d="M20 32 L28 40 L44 24" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={styles.redirectTitle}>Paiement confirmé</div>
          <div className={styles.redirectSubtitle}>Préparation de votre commande...</div>
        </div>
      </div>
    )}
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
    </>
  );
}
