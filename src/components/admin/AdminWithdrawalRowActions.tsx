"use client";

import { useState, useTransition } from "react";
import {
  Eye,
  Check,
  X,
  ArrowsClockwise,
  Storefront,
} from "@phosphor-icons/react";
import AdminIconAction from "./AdminIconAction";
import {
  adminApproveWithdrawalAction,
  adminRejectWithdrawalAction,
  adminReconcileWithdrawalGroupAction,
} from "@/app/actions/admin-withdrawals";

export default function AdminWithdrawalRowActions({
  withdrawalGroupId,
  status,
  shopAdminUrl,
}: {
  withdrawalGroupId: string;
  status: string;
  shopAdminUrl: string;
}) {
  const [pending, setPending] = useState<"approve" | "reject" | "reconcile" | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const approve = () => {
    if (
      !window.confirm(
        "Valider ce retrait et l'envoyer sur Mobile Money ?"
      )
    ) {
      return;
    }
    setPending("approve");
    startTransition(async () => {
      const res = await adminApproveWithdrawalAction(withdrawalGroupId);
      if (res.ok) window.location.reload();
      else setMessage(res.error ?? "Erreur");
      setPending(null);
    });
  };

  const reject = () => {
    const reason = window.prompt("Motif du rejet (optionnel) :", "");
    if (reason === null) return;
    if (!window.confirm("Rejeter et restituer les fonds au marchand ?")) return;
    setPending("reject");
    startTransition(async () => {
      const res = await adminRejectWithdrawalAction(
        withdrawalGroupId,
        reason || undefined
      );
      if (res.ok) window.location.reload();
      else setMessage(res.error ?? "Erreur");
      setPending(null);
    });
  };

  const reconcile = () => {
    if (!window.confirm("Réconcilier ce retrait avec Cartevo ?")) return;
    setPending("reconcile");
    startTransition(async () => {
      const res = await adminReconcileWithdrawalGroupAction(withdrawalGroupId);
      if (res.ok) {
        if (res.outcome === "success" || res.outcome === "failed_recredited") {
          window.location.reload();
        } else {
          setMessage(
            res.outcome === "still_pending"
              ? "Toujours en attente"
              : res.outcome === "manual_review"
                ? "Vérification manuelle requise"
                : "Déjà traité"
          );
        }
      } else {
        setMessage(res.error ?? "Erreur");
      }
      setPending(null);
    });
  };

  const busy = pending !== null;

  return (
    <div className="admin-icon-actions">
      <AdminIconAction
        href={`/admin/retraits/${encodeURIComponent(withdrawalGroupId)}`}
        title="Voir les détails"
      >
        <Eye size={18} weight="duotone" />
      </AdminIconAction>
      {status === "REQUESTED" ? (
        <>
          <AdminIconAction
            onClick={approve}
            disabled={busy}
            variant="ok"
            title="Valider le retrait"
          >
            <Check size={18} weight="bold" />
          </AdminIconAction>
          <AdminIconAction
            onClick={reject}
            disabled={busy}
            variant="danger"
            title="Rejeter le retrait"
          >
            <X size={18} weight="bold" />
          </AdminIconAction>
        </>
      ) : null}
      {status === "PROCESSING" ? (
        <AdminIconAction
          onClick={reconcile}
          disabled={busy}
          variant="primary"
          title="Réconcilier ce retrait"
        >
          <ArrowsClockwise size={18} weight="duotone" />
        </AdminIconAction>
      ) : null}
      <AdminIconAction href={shopAdminUrl} title="Voir la boutique">
        <Storefront size={18} weight="duotone" />
      </AdminIconAction>
      {message ? (
        <span className="admin-reconcile-msg" title={message}>
          {message.length > 20 ? `${message.slice(0, 20)}…` : message}
        </span>
      ) : null}
    </div>
  );
}
