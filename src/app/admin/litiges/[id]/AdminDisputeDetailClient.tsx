"use client";

import { useState, useTransition } from "react";
import { adminResolveDisputeAction } from "@/app/actions/disputes";
import { DISPUTE_STATUS_LABELS, type DisputeStatus } from "@/lib/disputes/constants";

const DECISION_OPTIONS = [
  { value: "customer" as const, label: "En faveur du client" },
  { value: "merchant" as const, label: "En faveur du marchand" },
  { value: "closed" as const, label: "Clôturer sans décision" },
];

export default function AdminDisputeDetailClient({
  disputeId,
  currentStatus,
}: {
  disputeId: string;
  currentStatus: string;
}) {
  const [decision, setDecision] = useState<"customer" | "merchant" | "closed">(
    "customer"
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isResolved = ["RESOLVED_CUSTOMER", "RESOLVED_MERCHANT", "CLOSED"].includes(
    currentStatus
  );

  const submit = () => {
    setError(null);
    const msg =
      "Confirmer la décision ? Aucun remboursement ne sera effectué automatiquement.";
    if (!window.confirm(msg)) return;

    startTransition(async () => {
      const res = await adminResolveDisputeAction(disputeId, decision, note);
      if (!res.ok) {
        setError(res.error ?? "Erreur");
        return;
      }
      setNote("");
    });
  };

  if (isResolved) {
    return (
      <div className="admin-detail-card" style={{ marginTop: 24 }}>
        <h2 className="admin-detail-card-title">Décision rendue</h2>
        <p style={{ margin: 0, fontSize: 14 }}>
          Statut :{" "}
          <strong>
            {DISPUTE_STATUS_LABELS[currentStatus as DisputeStatus] ?? currentStatus}
          </strong>
        </p>
        <p
          className="admin-muted"
          style={{ marginTop: 12, fontSize: 13, fontStyle: "italic" }}
        >
          La décision n&apos;effectue pas de remboursement automatique. Tout
          remboursement éventuel passe par le flux money existant ou reste manuel.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-detail-card" style={{ marginTop: 24 }}>
      <h2 className="admin-detail-card-title">Trancher le litige</h2>
      <p className="admin-muted" style={{ fontSize: 13, marginBottom: 16 }}>
        Enregistre une décision et met à jour le statut.{" "}
        <strong>Aucun mouvement d&apos;argent n&apos;est déclenché.</strong>
      </p>

      <div className="admin-toolbar" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
          Décision
          <select
            className="admin-search"
            value={decision}
            onChange={(e) =>
              setDecision(e.target.value as "customer" | "merchant" | "closed")
            }
            disabled={pending}
          >
            {DECISION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
          Note de résolution (visible marchand / traçabilité)
          <textarea
            className="admin-search"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Motivation de la décision…"
            disabled={pending}
            style={{ resize: "vertical", minHeight: 100 }}
          />
        </label>

        {error ? (
          <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>
        ) : null}

        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={submit}
          disabled={pending || note.trim().length < 5}
        >
          {pending ? "Enregistrement…" : "Enregistrer la décision"}
        </button>

        <p className="admin-muted" style={{ fontSize: 12, fontStyle: "italic", margin: 0 }}>
          Cette action n&apos;effectue pas de remboursement automatique.
        </p>
      </div>
    </div>
  );
}
