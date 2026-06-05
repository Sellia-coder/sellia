"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Eye, Storefront, Prohibit, CheckCircle } from "@phosphor-icons/react";
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
      <Link
        href={`/admin/utilisateurs/${userId}`}
        className="admin-icon-btn"
        title="Voir les détails"
        aria-label="Voir les détails"
      >
        <Eye size={18} weight="duotone" />
      </Link>
      {publicShopUrl ? (
        <a
          href={publicShopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-icon-btn"
          title="Voir la boutique"
          aria-label="Voir la boutique"
        >
          <Storefront size={18} weight="duotone" />
        </a>
      ) : null}
      {canBlock ? (
        <button
          type="button"
          className={`admin-icon-btn ${isBlocked ? "admin-icon-btn--ok" : "admin-icon-btn--danger"}`}
          onClick={toggleBlock}
          disabled={pending}
          title={isBlocked ? "Débloquer le marchand" : "Bloquer le marchand"}
          aria-label={isBlocked ? "Débloquer" : "Bloquer"}
        >
          {isBlocked ? (
            <CheckCircle size={18} weight="duotone" />
          ) : (
            <Prohibit size={18} weight="duotone" />
          )}
        </button>
      ) : null}
    </div>
  );
}
