"use client";

import { useState, useTransition } from "react";
import {
  adminSetWithdrawalNoteAction,
  adminMarkWithdrawalVerifiedAction,
} from "@/app/actions/admin-insights";
import { adminReconcileWithdrawalGroupAction } from "@/app/actions/admin-withdrawals";

export default function AdminWithdrawalMgmt({
  withdrawalGroupId,
  initialNote,
  manualReviewRequired,
  cartevoTxId,
  status,
}: {
  withdrawalGroupId: string;
  initialNote: string | null;
  manualReviewRequired: boolean;
  cartevoTxId: string | null;
  status: string;
}) {
  const [note, setNote] = useState(initialNote ?? "");
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const saveNote = () => {
    startTransition(async () => {
      const res = await adminSetWithdrawalNoteAction(withdrawalGroupId, note);
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  const markVerified = () => {
    if (
      !window.confirm(
        "Marquer comme vérifié manuellement ? (lève le drapeau d'alerte, sans toucher aux fonds)"
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await adminMarkWithdrawalVerifiedAction(withdrawalGroupId);
      if (res.ok) window.location.reload();
      else alert(res.error ?? "Erreur");
    });
  };

  const reconcile = () => {
    if (!window.confirm("Relancer la réconciliation Cartevo pour ce retrait ?")) {
      return;
    }
    startTransition(async () => {
      const res = await adminReconcileWithdrawalGroupAction(withdrawalGroupId);
      if (res.ok && (res.outcome === "success" || res.outcome === "failed_recredited")) {
        window.location.reload();
      } else if (res.ok) {
        alert(
          res.outcome === "still_pending"
            ? "Toujours en attente chez Cartevo."
            : "Aucun changement."
        );
      } else {
        alert(res.error ?? "Erreur");
      }
    });
  };

  const copyRef = async () => {
    if (!cartevoTxId) return;
    try {
      await navigator.clipboard.writeText(cartevoTxId);
      setCopyMsg("Copié");
      setTimeout(() => setCopyMsg(null), 2000);
    } catch {
      setCopyMsg("Échec copie");
    }
  };

  return (
    <div className="admin-detail-card" style={{ marginTop: 24 }}>
      <h2 className="admin-detail-card-title">Gestion (sans impact sur les fonds)</h2>
      <div className="admin-settings-field">
        <label>Note interne admin</label>
        <textarea
          className="admin-search"
          style={{ width: "100%", minHeight: 72 }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note visible uniquement par l'équipe admin…"
        />
        <button
          type="button"
          className="admin-btn admin-btn--sm"
          style={{ marginTop: 8 }}
          onClick={saveNote}
          disabled={pending}
        >
          Enregistrer la note
        </button>
      </div>
      <div className="admin-toolbar" style={{ marginTop: 12 }}>
        {manualReviewRequired ? (
          <button
            type="button"
            className="admin-btn admin-btn--primary admin-btn--sm"
            onClick={markVerified}
            disabled={pending}
          >
            Marquer vérifié manuellement
          </button>
        ) : null}
        {status === "PROCESSING" ? (
          <button
            type="button"
            className="admin-btn admin-btn--sm"
            onClick={reconcile}
            disabled={pending}
          >
            Relancer réconciliation
          </button>
        ) : null}
        {cartevoTxId ? (
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={copyRef}
          >
            Copier ref. Cartevo {copyMsg ? `(${copyMsg})` : ""}
          </button>
        ) : null}
      </div>
    </div>
  );
}
