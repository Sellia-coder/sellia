"use client";

import { useState } from "react";
import { Eye, ArrowsClockwise, Storefront } from "@phosphor-icons/react";
import AdminIconAction from "./AdminIconAction";

export default function AdminTransactionRowActions({
  orderNumber,
  shopAdminUrl,
}: {
  orderNumber: string;
  shopAdminUrl: string;
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
        window.location.reload();
      } else if (data.already_finalized) {
        setMessage("Déjà finalisée");
      } else if (data.still_pending) {
        setMessage(data.message ?? "En attente");
      } else {
        setMessage(data.error ?? "Erreur");
      }
    } catch {
      setMessage("Erreur réseau");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="admin-icon-actions">
      <AdminIconAction
        href={`/admin/transactions/${encodeURIComponent(orderNumber)}`}
        title="Voir les détails"
      >
        <Eye size={18} weight="duotone" />
      </AdminIconAction>
      <AdminIconAction
        onClick={reconcile}
        disabled={pending}
        variant="primary"
        title="Réconcilier le paiement"
      >
        <ArrowsClockwise size={18} weight="duotone" />
      </AdminIconAction>
      <AdminIconAction href={shopAdminUrl} title="Voir la boutique">
        <Storefront size={18} weight="duotone" />
      </AdminIconAction>
      {message ? (
        <span className="admin-reconcile-msg" title={message}>
          {message.length > 24 ? `${message.slice(0, 24)}…` : message}
        </span>
      ) : null}
    </div>
  );
}
