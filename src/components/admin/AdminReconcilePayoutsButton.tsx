"use client";

import { useState } from "react";
import { adminReconcilePayoutsAction } from "@/app/actions/admin-withdrawals";

export default function AdminReconcilePayoutsButton() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reconcile = async () => {
    if (
      !window.confirm(
        "Réconcilier les retraits en cours avec Cartevo ? (max 50 groupes)"
      )
    ) {
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const res = await adminReconcilePayoutsAction();
      if (res.ok) {
        const s = res.stats;
        setMessage(
          `${s.successCount} confirmé(s), ${s.failedRecredited} restitué(s), ${s.stillPending} en attente, ${s.manualReviewFlagged} à vérifier`
        );
        if (
          s.successCount > 0 ||
          s.failedRecredited > 0 ||
          s.manualReviewFlagged > 0
        ) {
          window.location.reload();
        }
      } else {
        setMessage(res.error ?? "Erreur");
      }
    } catch {
      setMessage("Erreur réseau.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="admin-reconcile-toolbar">
      <button
        type="button"
        className="admin-btn admin-btn--sm"
        onClick={reconcile}
        disabled={pending}
      >
        {pending ? "Réconciliation…" : "Réconcilier les retraits"}
      </button>
      {message ? (
        <span className="admin-reconcile-msg" title={message}>
          {message.length > 80 ? `${message.slice(0, 80)}…` : message}
        </span>
      ) : null}
    </div>
  );
}
