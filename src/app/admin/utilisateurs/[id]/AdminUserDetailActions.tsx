"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  Storefront,
  Prohibit,
  CheckCircle,
  Wallet,
  Receipt,
  Users,
} from "@phosphor-icons/react";
import { adminToggleUserBlockAction } from "@/app/actions/admin-platform";

export default function AdminUserDetailActions({
  userId,
  role,
  isBlocked,
  isSelf,
  shopId,
  shopSlug,
  publicShopUrl,
}: {
  userId: string;
  role: string | null;
  isBlocked: boolean;
  isSelf: boolean;
  shopId: string | null;
  shopSlug: string | null;
  publicShopUrl: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const isAdmin = role === "admin";
  const canBlock = !isAdmin && !isSelf;

  const toggleBlock = () => {
    if (isBlocked) {
      if (
        !window.confirm(
          "Débloquer ce marchand ? Il pourra à nouveau se connecter."
        )
      ) {
        return;
      }
      startTransition(async () => {
        const res = await adminToggleUserBlockAction(userId, false);
        if (res.ok) window.location.reload();
        else alert(res.error ?? "Erreur");
      });
      return;
    }
    const motif = window.prompt(
      "Motif du blocage (obligatoire pour l'audit) :",
      ""
    );
    if (motif === null) return;
    if (!motif.trim()) {
      alert("Le motif est requis.");
      return;
    }
    if (!window.confirm(`Bloquer ce marchand ?\nMotif : ${motif.trim()}`)) {
      return;
    }
    startTransition(async () => {
      const res = await adminToggleUserBlockAction(userId, true, motif.trim());
      if (res.ok) window.location.reload();
      else alert(res.error ?? "Erreur");
    });
  };

  return (
    <div className="admin-detail-actions-bar">
      {shopId ? (
        <>
          <Link href={`/admin/boutiques/${shopId}`} className="admin-btn">
            <Storefront size={16} weight="duotone" />
            Fiche boutique
          </Link>
          <Link
            href={`/admin/transactions?q=${encodeURIComponent(shopSlug ?? "")}`}
            className="admin-btn admin-btn--ghost"
          >
            <Receipt size={16} weight="duotone" />
            Transactions
          </Link>
          <Link href="/admin/retraits" className="admin-btn admin-btn--ghost">
            <Wallet size={16} weight="duotone" />
            Retraits
          </Link>
          <Link
            href={`/admin/clients?shop=${shopId}`}
            className="admin-btn admin-btn--ghost"
          >
            <Users size={16} weight="duotone" />
            Clients
          </Link>
        </>
      ) : null}
      {publicShopUrl && shopSlug ? (
        <a
          href={publicShopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn admin-btn--ghost"
        >
          Voir boutique publique
        </a>
      ) : null}
      {canBlock ? (
        <button
          type="button"
          className={
            isBlocked
              ? "admin-btn admin-btn--primary"
              : "admin-btn admin-btn--danger"
          }
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
    </div>
  );
}
