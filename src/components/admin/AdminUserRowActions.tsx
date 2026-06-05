"use client";

import { useTransition } from "react";
import { Eye, Storefront, Prohibit, CheckCircle } from "@phosphor-icons/react";
import AdminIconAction from "./AdminIconAction";
import { adminToggleUserBlockAction } from "@/app/actions/admin-platform";

export default function AdminUserRowActions({
  userId,
  role,
  isBlocked,
  isSelf,
  publicShopUrl,
}: {
  userId: string;
  role: string | null;
  isBlocked: boolean;
  isSelf: boolean;
  publicShopUrl: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const isAdmin = role === "admin";
  const canBlock = !isAdmin && !isSelf;

  const toggleBlock = () => {
    const msg = isBlocked
      ? "Débloquer ce marchand ? Il pourra à nouveau se connecter."
      : "Bloquer ce marchand ? Il ne pourra plus se connecter ni accéder à son dashboard.";
    if (!window.confirm(msg)) return;
    startTransition(async () => {
      const res = await adminToggleUserBlockAction(userId, !isBlocked);
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  return (
    <div className="admin-icon-actions">
      <AdminIconAction
        href={`/admin/utilisateurs/${userId}`}
        title="Voir les détails"
      >
        <Eye size={18} weight="duotone" />
      </AdminIconAction>
      {publicShopUrl ? (
        <AdminIconAction
          href={publicShopUrl}
          external
          title="Voir la boutique"
        >
          <Storefront size={18} weight="duotone" />
        </AdminIconAction>
      ) : null}
      {canBlock ? (
        <AdminIconAction
          onClick={toggleBlock}
          disabled={pending}
          variant={isBlocked ? "ok" : "danger"}
          title={isBlocked ? "Débloquer le marchand" : "Bloquer le marchand"}
        >
          {isBlocked ? (
            <CheckCircle size={18} weight="duotone" />
          ) : (
            <Prohibit size={18} weight="duotone" />
          )}
        </AdminIconAction>
      ) : null}
    </div>
  );
}
