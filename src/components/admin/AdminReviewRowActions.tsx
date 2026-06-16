"use client";

import { useTransition } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import AdminIconAction from "./AdminIconAction";
import { adminToggleReviewVisibilityAction } from "@/app/actions/admin-insights";

export default function AdminReviewRowActions({
  reviewId,
  shopId,
  isHidden,
}: {
  reviewId: string;
  shopId: string;
  isHidden: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const msg = isHidden
      ? "Réafficher cet avis sur la boutique ?"
      : "Masquer cet avis (réversible) ?";
    if (!window.confirm(msg)) return;
    startTransition(async () => {
      const res = await adminToggleReviewVisibilityAction(reviewId, !isHidden);
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  return (
    <div className="admin-icon-actions">
      <AdminIconAction
        href={`/admin/avis/${shopId}`}
        title="Voir la boutique"
      >
        <Eye size={18} weight="duotone" />
      </AdminIconAction>
      <AdminIconAction
        onClick={toggle}
        disabled={pending}
        variant={isHidden ? "ok" : "danger"}
        title={isHidden ? "Réafficher l'avis" : "Masquer l'avis"}
      >
        {isHidden ? (
          <Eye size={18} weight="duotone" />
        ) : (
          <EyeSlash size={18} weight="duotone" />
        )}
      </AdminIconAction>
    </div>
  );
}
