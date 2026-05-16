"use client";

import { useState } from "react";
import { RotateCw, Check, X } from "lucide-react";

interface Props {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    total: number;
    createdAt: Date;
    paymentSubMethod: string | null;
    cartevoTransaction: {
      id: string;
      cartevoTxId: string;
      status: string;
      operator: string | null;
    } | null;
  };
}

export default function PendingOrderRow({ order }: Props) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsChecking(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/admin/reconcile/${encodeURIComponent(order.orderNumber)}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.reconciled) {
        if (data.new_payment_status === "paid_escrow") {
          setResult("paid");
          setTimeout(() => window.location.reload(), 1200);
        } else if (data.new_payment_status === "failed") {
          setResult("failed");
        }
      } else if (data.still_pending) {
        setResult("pending");
      } else {
        setResult("error");
      }
    } catch {
      setResult("error");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <tr>
      <td>
        <code style={{ fontSize: 12 }}>{order.orderNumber}</code>
      </td>
      <td>
        <div>{order.customerName}</div>
        <div style={{ fontSize: 12, color: "var(--dash-text-tertiary)" }}>
          {order.customerPhone}
        </div>
      </td>
      <td>
        <strong>{order.total.toLocaleString("fr-FR")} FCFA</strong>
      </td>
      <td>
        {(
          order.cartevoTransaction?.operator ||
          order.paymentSubMethod ||
          "—"
        ).toUpperCase()}
      </td>
      <td>
        {new Date(order.createdAt).toLocaleString("fr-FR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td>
        {result === "paid" ? (
          <span className="dash-badge dash-badge-success">
            <Check size={12} /> Confirmé
          </span>
        ) : result === "failed" ? (
          <span className="dash-badge dash-badge-danger">
            <X size={12} /> Échoué
          </span>
        ) : (
          <button
            type="button"
            className="dash-btn dash-btn-sm dash-btn-secondary"
            onClick={handleVerify}
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <RotateCw
                  size={12}
                  style={{ animation: "spin 0.9s linear infinite" }}
                />
                Vérification...
              </>
            ) : (
              "Vérifier maintenant"
            )}
          </button>
        )}
        {result === "pending" && (
          <div
            style={{
              fontSize: 11,
              marginTop: 4,
              color: "var(--dash-text-tertiary)",
            }}
          >
            Encore en attente côté Cartevo
          </div>
        )}
        {result === "error" && (
          <div
            style={{
              fontSize: 11,
              marginTop: 4,
              color: "var(--dash-danger)",
            }}
          >
            Erreur, réessayez
          </div>
        )}
      </td>
    </tr>
  );
}
