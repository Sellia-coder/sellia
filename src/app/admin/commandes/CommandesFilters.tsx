"use client";

import Link from "next/link";

const TABS = [
  { key: "", label: "Toutes" },
  { key: "in_progress", label: "En cours" },
  { key: "pending_delivery", label: "En attente de livraison" },
  { key: "delivered", label: "Livré" },
] as const;

export default function CommandesFilters({
  activeTab,
  counts,
  total,
}: {
  activeTab: string;
  counts: {
    in_progress: number;
    pending_delivery: number;
    delivered: number;
    total?: number;
  };
  total: number;
}) {
  return (
    <>
      <div className="admin-status-chips">
        <span className="admin-chip">
          Total <strong>{total}</strong>
        </span>
        <span className="admin-chip admin-chip--info">
          En cours <strong>{counts.in_progress ?? 0}</strong>
        </span>
        <span className="admin-chip admin-chip--warn">
          Attente livraison <strong>{counts.pending_delivery ?? 0}</strong>
        </span>
        <span className="admin-chip admin-chip--ok">
          Livré <strong>{counts.delivered ?? 0}</strong>
        </span>
      </div>

      <div className="admin-pill-tabs" role="tablist">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/admin/commandes?tab=${t.key}` : "/admin/commandes"}
            className={`admin-pill-tab ${
              activeTab === t.key ? "admin-pill-tab--active" : ""
            }`}
            role="tab"
            aria-selected={activeTab === t.key}
          >
            {t.label}
            {t.key && counts[t.key] != null ? (
              <span className="admin-pill-tab-count">{counts[t.key]}</span>
            ) : null}
          </Link>
        ))}
      </div>
    </>
  );
}
