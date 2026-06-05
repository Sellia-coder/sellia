"use client";

import { useState } from "react";
import {
  adminApproveWithdrawalAction,
  adminRejectWithdrawalAction,
} from "@/app/actions/admin-withdrawals";

export default function AdminWithdrawalActions({
  withdrawalGroupId,
  status,
}: {
  withdrawalGroupId: string;
  status: string;
}) {
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (status !== "REQUESTED") return null;

  const approve = async () => {
    if (
      !window.confirm(
        "Valider ce retrait et l'envoyer sur Mobile Money ? Cette action est définitive."
      )
    ) {
      return;
    }
    setPending("approve");
    setMessage(null);
    try {
      const res = await adminApproveWithdrawalAction(withdrawalGroupId);
      if (res.ok) {
        window.location.reload();
      } else {
        setMessage(res.error ?? "Erreur");
      }
    } catch {
      setMessage("Erreur réseau.");
    } finally {
      setPending(null);
    }
  };

  const reject = async () => {
    const reason = window.prompt(
      "Motif du rejet (optionnel) :",
      ""
    );
    if (reason === null) return;
    if (
      !window.confirm(
        "Rejeter ce retrait et restituer les fonds au marchand ?"
      )
    ) {
      return;
    }
    setPending("reject");
    setMessage(null);
    try {
      const res = await adminRejectWithdrawalAction(
        withdrawalGroupId,
        reason || undefined
      );
      if (res.ok) {
        window.location.reload();
      } else {
        setMessage(res.error ?? "Erreur");
      }
    } catch {
      setMessage("Erreur réseau.");
    } finally {
      setPending(null);
    }
  };

  const busy = pending !== null;

  return (
    <div className="admin-withdrawal-actions">
      <button
        type="button"
        className="admin-btn admin-btn--primary admin-btn--sm"
        onClick={approve}
        disabled={busy}
      >
        {pending === "approve" ? "…" : "Valider"}
      </button>
      <button
        type="button"
        className="admin-btn admin-btn--danger admin-btn--sm"
        onClick={reject}
        disabled={busy}
      >
        {pending === "reject" ? "…" : "Rejeter"}
      </button>
      {message ? (
        <span className="admin-reconcile-msg" title={message}>
          {message.length > 36 ? `${message.slice(0, 36)}…` : message}
        </span>
      ) : null}
    </div>
  );
}
