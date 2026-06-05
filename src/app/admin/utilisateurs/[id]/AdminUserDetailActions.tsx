"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Storefront, Prohibit, CheckCircle } from "@phosphor-icons/react";
import { adminToggleUserBlockAction } from "@/app/actions/admin-platform";

export default function AdminUserDetailActions({
  userId,
  role,
  isBlocked,
  isSelf,
  shopSlug,
  publicShopUrl,
}: {
  userId: string;
  role: string | null;
  isBlocked: boolean;
  isSelf: boolean;
  shopSlug: string | null;
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
    <div className="admin-toolbar">
      {publicShopUrl && shopSlug ? (
        <a
          href={publicShopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn"
        >
          <Storefront size={16} weight="duotone" />
          Voir la boutique
        </a>
      ) : null}
      {canBlock ? (
        <button
          type="button"
          className={isBlocked ? "admin-btn admin-btn--primary" : "admin-btn admin-btn--danger"}
          onClick={toggleBlock}
          disabled={pending}
        >
          {isBlocked ? (
            <CheckCircle size={16} weight="duotone" />
          ) : (
            <Prohibit size={16} weight="duotone" />
          )}
          {pending ? "…" : isBlocked ? "Débloquer le marchand" : "Bloquer le marchand"}
        </button>
      ) : null}
      <Link href="/admin/utilisateurs" className="admin-btn admin-btn--ghost">
        Retour à la liste
      </Link>
    </div>
  );
}
