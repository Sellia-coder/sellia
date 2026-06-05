"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { ReportStatus } from "@prisma/client";
import {
  adminUpdateReportStatusAction,
  adminToggleProductVisibilityAction,
} from "@/app/actions/admin-platform";

const STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: "PENDING", label: "Nouveau" },
  { value: "REVIEWING", label: "En cours" },
  { value: "RESOLVED", label: "Traité" },
  { value: "DISMISSED", label: "Rejeté" },
];

export default function AdminReportDetailClient({
  reportId,
  currentStatus,
  productId,
  productHidden,
  merchantEmail,
  shopSlug,
}: {
  reportId: string;
  currentStatus: ReportStatus;
  productId: string;
  productHidden: boolean;
  merchantEmail: string | null;
  shopSlug: string;
}) {
  const [pending, startTransition] = useTransition();

  const setStatus = (status: ReportStatus) => {
    if (status === currentStatus) return;
    startTransition(async () => {
      const res = await adminUpdateReportStatusAction(reportId, status);
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  const toggleHide = () => {
    const msg = productHidden
      ? "Republier ce produit sur la boutique ?"
      : "Masquer ce produit de la boutique ? (réversible)";
    if (!window.confirm(msg)) return;
    startTransition(async () => {
      const res = await adminToggleProductVisibilityAction(productId, !productHidden);
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  return (
    <div className="admin-toolbar">
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
        Statut :
        <select
          className="admin-search"
          style={{ maxWidth: 180, flex: "none" }}
          value={currentStatus}
          onChange={(e) => setStatus(e.target.value as ReportStatus)}
          disabled={pending}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      {merchantEmail ? (
        <a href={`mailto:${merchantEmail}`} className="admin-btn">
          Contacter le marchand
        </a>
      ) : null}
      <Link
        href={`/admin/boutiques?q=${encodeURIComponent(shopSlug)}`}
        className="admin-btn"
      >
        Voir la boutique
      </Link>
      <button
        type="button"
        className={productHidden ? "admin-btn admin-btn--primary" : "admin-btn admin-btn--danger"}
        onClick={toggleHide}
        disabled={pending}
      >
        {productHidden ? "Republier le produit" : "Masquer le produit"}
      </button>
    </div>
  );
}
