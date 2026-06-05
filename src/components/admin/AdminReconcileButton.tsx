"use client";

import { useState } from "react";

export default function AdminReconcileButton({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reconcile = async () => {
    if (!window.confirm(`Réconcilier la commande ${orderNumber} ?`)) return;
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/admin/reconcile/${encodeURIComponent(orderNumber)}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.reconciled) {
        setMessage("Réconciliation réussie.");
        window.location.reload();
      } else if (data.already_finalized) {
        setMessage("Déjà finalisée.");
      } else if (data.still_pending) {
        setMessage(data.message ?? "Paiement encore en attente.");
      } else if (data.error) {
        setMessage(
          data.message ??
            (data.error === "no_cartevo_transaction"
              ? "Pas de paiement Mobile Money associé."
              : `Erreur : ${data.error}`)
        );
      } else {
        setMessage("Réponse inattendue du serveur.");
      }
    } catch {
      setMessage("Erreur réseau.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="admin-reconcile-cell">
      <button
        type="button"
        className="admin-btn admin-btn--sm"
        onClick={reconcile}
        disabled={pending}
      >
        {pending ? "…" : "Réconcilier"}
      </button>
      {message ? (
        <span className="admin-reconcile-msg" title={message}>
          {message.length > 40 ? `${message.slice(0, 40)}…` : message}
        </span>
      ) : null}
    </div>
  );
}
