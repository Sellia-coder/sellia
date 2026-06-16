"use client";

import { Eye } from "@phosphor-icons/react";
import AdminIconAction from "./AdminIconAction";

export default function AdminAvisRowActions({ shopId }: { shopId: string }) {
  return (
    <div className="admin-icon-actions">
      <AdminIconAction href={`/admin/avis/${shopId}`} title="Voir les avis">
        <Eye size={18} weight="duotone" />
      </AdminIconAction>
    </div>
  );
}
