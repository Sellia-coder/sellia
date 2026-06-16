"use client";

import { Eye, Wallet, CreditCard } from "@phosphor-icons/react";
import AdminIconAction from "./AdminIconAction";

export default function AdminBalanceRowActions({
  shopId,
}: {
  shopId: string;
}) {
  return (
    <div className="admin-icon-actions">
      <AdminIconAction
        href={`/admin/boutiques/${shopId}`}
        title="Voir la boutique"
      >
        <Eye size={18} weight="duotone" />
      </AdminIconAction>
      <AdminIconAction
        href={`/admin/retraits?shop=${shopId}`}
        title="Voir les retraits"
      >
        <Wallet size={18} weight="duotone" />
      </AdminIconAction>
      <AdminIconAction
        href={`/admin/transactions?q=${encodeURIComponent(shopId)}`}
        title="Voir les transactions"
      >
        <CreditCard size={18} weight="duotone" />
      </AdminIconAction>
    </div>
  );
}
