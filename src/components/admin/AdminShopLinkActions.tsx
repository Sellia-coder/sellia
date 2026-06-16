"use client";

import { Eye } from "@phosphor-icons/react";
import AdminIconAction from "./AdminIconAction";

export default function AdminShopLinkActions({ shopId }: { shopId: string }) {
  return (
    <div className="admin-icon-actions">
      <AdminIconAction
        href={`/admin/boutiques/${shopId}`}
        title="Voir la boutique"
      >
        <Eye size={18} weight="duotone" />
      </AdminIconAction>
    </div>
  );
}
