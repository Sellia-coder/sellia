"use client";

import { useTransition } from "react";
import { Eye, CheckCircle, ArrowCounterClockwise, Storefront } from "@phosphor-icons/react";
import AdminIconAction from "./AdminIconAction";
import {
  adminCloseSupportTicketAction,
  adminReopenSupportTicketAction,
} from "@/app/actions/admin-platform";

export default function AdminSupportRowActions({
  ticketId,
  isClosed,
  shopAdminUrl,
}: {
  ticketId: string;
  isClosed: boolean;
  shopAdminUrl: string | null;
}) {
  const [pending, startTransition] = useTransition();

  const toggleClose = () => {
    const msg = isClosed
      ? "Rouvrir ce ticket ?"
      : "Clore ce ticket ?";
    if (!window.confirm(msg)) return;
    startTransition(async () => {
      const res = isClosed
        ? await adminReopenSupportTicketAction(ticketId)
        : await adminCloseSupportTicketAction(ticketId);
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  return (
    <div className="admin-icon-actions">
      <AdminIconAction
        href={`/admin/support/${ticketId}`}
        title="Ouvrir le ticket"
      >
        <Eye size={18} weight="duotone" />
      </AdminIconAction>
      <AdminIconAction
        onClick={toggleClose}
        disabled={pending}
        variant={isClosed ? "ok" : "neutral"}
        title={isClosed ? "Rouvrir le ticket" : "Clore le ticket"}
      >
        {isClosed ? (
          <ArrowCounterClockwise size={18} weight="duotone" />
        ) : (
          <CheckCircle size={18} weight="duotone" />
        )}
      </AdminIconAction>
      {shopAdminUrl ? (
        <AdminIconAction href={shopAdminUrl} title="Voir la boutique">
          <Storefront size={18} weight="duotone" />
        </AdminIconAction>
      ) : null}
    </div>
  );
}
