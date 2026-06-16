"use client";

import { Eye, Storefront } from "@phosphor-icons/react";
import AdminIconAction from "./AdminIconAction";

export default function AdminOrderRowActions({
  orderNumber,
  shopId,
}: {
  orderNumber: string;
  shopId: string;
}) {
  return (
    <div className="admin-icon-actions">
      <AdminIconAction
        href={`/admin/transactions/${encodeURIComponent(orderNumber)}`}
        title="Détail commande"
      >
        <Eye size={18} weight="duotone" />
      </AdminIconAction>
      <AdminIconAction
        href={`/admin/boutiques/${shopId}`}
        title="Voir la boutique"
      >
        <Storefront size={18} weight="duotone" />
      </AdminIconAction>
    </div>
  );
}
