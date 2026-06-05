"use client";

import { useTransition } from "react";
import { adminToggleShopVisibilityAction } from "@/app/actions/admin-platform";

export default function AdminShopActions({
  shopId,
  isPublished,
  publicUrl,
}: {
  shopId: string;
  isPublished: boolean;
  publicUrl: string;
}) {
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const msg = isPublished
      ? "Suspendre cette boutique ? Elle ne sera plus visible publiquement."
      : "Réactiver cette boutique et la republier ?";
    if (!window.confirm(msg)) return;
    startTransition(async () => {
      const res = await adminToggleShopVisibilityAction(shopId);
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="admin-btn"
      >
        Voir la boutique
      </a>
      <button
        type="button"
        className={`admin-btn ${isPublished ? "admin-btn--danger" : "admin-btn--primary"}`}
        onClick={toggle}
        disabled={pending}
      >
        {pending ? "…" : isPublished ? "Suspendre" : "Réactiver"}
      </button>
    </div>
  );
}
