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

function getNextDelayMs(pollCount: number): number {
  if (pollCount < 5) return 2000;
  if (pollCount < 12) return 5000;
  return 10000;
}

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
  const cancelledRef = useRef(false);

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
          onSuccess();
          return;
        }
        if (result === "failed") {
          cancelledRef.current = true;
          onFailed("Le paiement n'a pas pu être finalisé.");
          return;
        }
      } catch {
        // retry on network error
      }
      currentCount += 1;
      setPollCount(currentCount);
      if (!cancelledRef.current) {
        const delay = getNextDelayMs(currentCount);
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
    try {
      const reconcileRes = await fetch(
        `/api/admin/reconcile/${encodeURIComponent(orderNumber)}`,
        { method: "POST", cache: "no-store" }
      );
      if (cancelledRef.current) return;

      if (reconcileRes.ok) {
        const data = await reconcileRes.json();
        if (data.reconciled && data.new_payment_status === "paid_escrow") {
          cancelledRef.current = true;
          onSuccess();
          return;
        }
        if (data.reconciled && data.new_payment_status === "failed") {
          cancelledRef.current = true;
          onFailed("Le paiement a échoué.");
          return;
        }
      }
    } catch {
      // ignore
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
