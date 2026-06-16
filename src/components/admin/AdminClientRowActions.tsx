"use client";

import { Eye, Envelope, WhatsappLogo } from "@phosphor-icons/react";
import AdminIconAction from "./AdminIconAction";

export default function AdminClientRowActions({
  customerId,
  email,
  phone,
}: {
  customerId: string;
  email: string | null;
  phone: string;
}) {
  const wa = phone.replace(/\D/g, "");
  const waLink = wa ? `https://wa.me/${wa}` : null;

  return (
    <div className="admin-icon-actions">
      <AdminIconAction
        href={`/admin/clients/${customerId}`}
        title="Voir le détail client"
      >
        <Eye size={18} weight="duotone" />
      </AdminIconAction>
      {email ? (
        <AdminIconAction
          href={`mailto:${email}`}
          title="Contacter par email"
        >
          <Envelope size={18} weight="duotone" />
        </AdminIconAction>
      ) : null}
      {waLink ? (
        <AdminIconAction href={waLink} external title="Contacter sur WhatsApp">
          <WhatsappLogo size={18} weight="duotone" />
        </AdminIconAction>
      ) : null}
    </div>
  );
}
