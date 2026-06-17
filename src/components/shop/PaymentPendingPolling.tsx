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

const AGGRESSIVE_WINDOW_MS = 90_000;
const LONG_WAIT_MS = 180_000;

function isPaidStatus(status: string): boolean {
  return (
    status === "paid_escrow" ||
    status === "paid_released" ||
    status === "delivered"
  );
}

function getNextDelayMs(pollCount: number, aggressive: boolean): number {
  if (aggressive) return 2500;
  if (pollCount < 8) return 3000;
  if (pollCount < 20) return 5000;
  return 10000;
}

type FeedbackKind = "idle" | "checking" | "pending" | "success" | "failed";

const REASSURING_WAIT =
  "Paiement en cours de confirmation… cela peut prendre quelques instants. Ne fermez pas cette page.";

const LONG_WAIT_MESSAGE =
  "Votre paiement est en cours de traitement. Nous continuons à vérifier automatiquement auprès de l'opérateur.";

/** GET /status — verify-on-pull côté serveur (cartevoTx.cartevoTxId). */
async function fetchOrderStatus(
  shopSlug: string,
  orderNumber: string
): Promise<{ paymentStatus: string } | null> {
  const res = await fetch(
    `/api/shop/${shopSlug}/orders/${encodeURIComponent(orderNumber)}/status`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

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
  const [feedback, setFeedback] = useState<FeedbackKind>("pending");
  const [feedbackText, setFeedbackText] = useState<string>(REASSURING_WAIT);
  const cancelledRef = useRef(false);
  const aggressiveUntilRef = useRef(Date.now() + AGGRESSIVE_WINDOW_MS);
  const forcedAggressiveRef = useRef(false);
  const mountedAtRef = useRef(Date.now());
  const pollIterationRef = useRef(0);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const operator = getOperatorInfo(countryCode, operatorCode);
  const operatorName = operator?.name ?? "Mobile Money";

  const successHandledRef = useRef(false);

  const completeSuccess = useCallback(() => {
    if (successHandledRef.current) return;
    successHandledRef.current = true;
    cancelledRef.current = true;
    setFeedback("success");
    setFeedbackText("Paiement confirmé !");
    setRedirecting(true);
    onSuccess();

    if (autoRedirect) {
      setTimeout(() => {
        router.push(
          `/shop/${shopSlug}/commande/${encodeURIComponent(orderNumber)}`
        );
      }, 800);
    } else {
      // Ne pas masquer l'overlay succès : le parent démonte le polling après refresh.
      setTimeout(() => router.refresh(), 400);
    }
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
            const elapsed = Date.now() - mountedAtRef.current;
            setFeedbackText(
              elapsed >= LONG_WAIT_MS ? LONG_WAIT_MESSAGE : REASSURING_WAIT
            );
          }
        }, durationMs);
      }
    },
    []
  );

  const resolveFromStatus = useCallback(
    (paymentStatus: string): "success" | "failed" | "pending" => {
      if (isPaidStatus(paymentStatus)) return "success";
      if (paymentStatus === "failed" || paymentStatus === "cancelled") {
        return "failed";
      }
      return "pending";
    },
    []
  );

  const performVerifyOnPull = useCallback(async (): Promise<
    "success" | "failed" | "pending"
  > => {
    try {
      const data = await fetchOrderStatus(shopSlug, orderNumber);
      if (!data) return "pending";
      return resolveFromStatus(data.paymentStatus);
    } catch {
      return "pending";
    }
  }, [shopSlug, orderNumber, resolveFromStatus]);

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
      if (data.matched && isPaidStatus(data.new_payment_status)) {
        return "success";
      }
      if (
        data.already_finalized &&
        isPaidStatus(data.new_payment_status)
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
    pollIterationRef.current += 1;
    const n = pollIterationRef.current;
    const aggressive =
      forcedAggressiveRef.current ||
      Date.now() < aggressiveUntilRef.current;

    const statusResult = await performVerifyOnPull();
    if (statusResult !== "pending") return statusResult;

    // Réconciliation solde (secours) : moins fréquent (rate limit 10/min)
    if (aggressive ? n % 2 === 0 : n % 5 === 0) {
      const balanceResult = await performBalanceMatch();
      if (balanceResult !== "pending") return balanceResult;
    }

    return "pending";
  }, [performVerifyOnPull, performBalanceMatch]);

  const handleManualCheck = async () => {
    if (isManualChecking || cancelledRef.current) return;
    setIsManualChecking(true);
    showFeedback("info", "Vérification en cours auprès de l'opérateur…", 0);

    try {
      const statusResult = await performVerifyOnPull();
      if (cancelledRef.current) return;

      if (statusResult === "success") {
        completeSuccess();
        return;
      }
      if (statusResult === "failed") {
        showFeedback("error", "Le paiement n'a pas abouti.");
        cancelledRef.current = true;
        setTimeout(() => onFailed("Paiement non abouti"), 1500);
        return;
      }

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

      if (data.matched && isPaidStatus(data.new_payment_status)) {
        completeSuccess();
        return;
      }

      if (
        data.already_finalized &&
        isPaidStatus(data.new_payment_status)
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

      showFeedback("info", REASSURING_WAIT, 0);
      aggressiveUntilRef.current = Date.now() + AGGRESSIVE_WINDOW_MS;
      forcedAggressiveRef.current = true;
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
    successHandledRef.current = false;
    mountedAtRef.current = Date.now();
    aggressiveUntilRef.current = Date.now() + AGGRESSIVE_WINDOW_MS;
    forcedAggressiveRef.current = false;
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

        const elapsed = Date.now() - mountedAtRef.current;
        setFeedback("pending");
        setFeedbackText(
          elapsed >= LONG_WAIT_MS ? LONG_WAIT_MESSAGE : REASSURING_WAIT
        );
      } catch {
        // retry on network error
      }

      currentCount += 1;
      setPollCount(currentCount);

      if (Date.now() >= aggressiveUntilRef.current) {
        forcedAggressiveRef.current = false;
      }

      if (!cancelledRef.current) {
        const aggressive =
          forcedAggressiveRef.current ||
          Date.now() < aggressiveUntilRef.current;
        const delay = getNextDelayMs(currentCount, aggressive);
        timeoutId = setTimeout(loop, delay);
      }
    };

    // Verify-on-pull dès l'arrivée, puis polling agressif (2,5 s pendant ~90 s).
    void performVerifyOnPull().then((r) => {
      if (cancelledRef.current) return;
      if (r === "success") {
        completeSuccess();
        return;
      }
      if (r === "failed") {
        cancelledRef.current = true;
        setFeedback("failed");
        onFailed("Le paiement n'a pas pu être finalisé.");
        return;
      }
      timeoutId = setTimeout(loop, 800);
    });

    return () => {
      cancelledRef.current = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, [performPoll, performVerifyOnPull, completeSuccess, onFailed]);

  const handleCancelClick = () => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;
    onCancel();
  };

  const isWaiting =
    !redirecting &&
    (feedback === "pending" || feedback === "checking" || feedback === "idle");

  const statusClass =
    feedback === "success"
      ? styles.statusSuccess
      : feedback === "failed"
        ? styles.statusFailed
        : feedback === "checking"
          ? styles.statusChecking
          : styles.statusPending;

  return (
    <>
      {redirecting && (
        <div className={styles.redirectOverlay} role="status" aria-live="polite">
          <div className={styles.redirectCard}>
            <div className={styles.checkWrap}>
              <CheckCircle size={32} color="#16A34A" strokeWidth={2} />
            </div>
            <div className={styles.redirectTitle}>Paiement confirmé</div>
            <div className={styles.redirectSub}>Mise à jour en cours…</div>
          </div>
        </div>
      )}
      <div className={styles.wrap}>
        <div className={styles.card}>
          {isWaiting && (
            <div className={styles.spinnerWrap} aria-hidden>
              <div className={styles.pulse} />
              <div className={styles.spinner} />
            </div>
          )}

          <h2 className={styles.title}>
            {feedback === "failed"
              ? "Paiement non confirmé"
              : "Confirmez le paiement sur votre téléphone"}
          </h2>

          {feedback !== "failed" && !redirecting && (
            <p className={styles.hint}>
              Saisissez votre code {operatorName} — la confirmation est automatique.
            </p>
          )}

          <div className={styles.amount}>
            {total.toLocaleString("fr-FR")}{" "}
            <span className={styles.amountCurrency}>{currency}</span>
          </div>

          {feedbackText && !redirecting && (
            <p className={`${styles.status} ${statusClass}`} role="status" aria-live="polite">
              {feedbackText}
            </p>
          )}

          <p className={styles.ref}>
            Réf. <span>{orderNumber}</span>
          </p>

          <div className={styles.actions}>
            {feedback !== "failed" && !redirecting && (
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
                    Vérification…
                  </>
                ) : (
                  "J'ai payé — Vérifier"
                )}
              </button>
            )}
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={handleCancelClick}
              disabled={redirecting}
            >
              <X size={13} />
              {feedback === "failed" ? "Retour à la boutique" : "Annuler"}
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
