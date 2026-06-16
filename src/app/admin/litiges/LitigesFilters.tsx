"use client";

import Link from "next/link";

const STATUS_TABS = [
  { key: "", label: "Tous" },
  { key: "open", label: "Ouverts" },
  { key: "in_review", label: "En cours" },
  { key: "resolved", label: "Tranchés" },
] as const;

export default function LitigesFilters({
  activeStatus,
  counts,
  q,
  shop,
  from,
  to,
}: {
  activeStatus: string;
  counts: { open: number; in_review: number; resolved: number; total: number };
  q: string;
  shop: string;
  from: string;
  to: string;
}) {
  const buildHref = (status: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    if (shop) params.set("shop", shop);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return qs ? `/admin/litiges?${qs}` : "/admin/litiges";
  };

  return (
    <>
      <div className="admin-status-chips">
        <span className="admin-chip">
          Total <strong>{counts.total}</strong>
        </span>
        <span className="admin-chip admin-chip--warn">
          Ouverts <strong>{counts.open}</strong>
        </span>
        <span className="admin-chip admin-chip--info">
          En cours <strong>{counts.in_review}</strong>
        </span>
        <span className="admin-chip admin-chip--ok">
          Tranchés <strong>{counts.resolved}</strong>
        </span>
      </div>

      <div className="admin-pill-tabs" role="tablist">
        {STATUS_TABS.map((t) => (
          <Link
            key={t.key}
            href={buildHref(t.key)}
            className={`admin-pill-tab ${
              activeStatus === t.key ? "admin-pill-tab--active" : ""
            }`}
            role="tab"
            aria-selected={activeStatus === t.key}
          >
            {t.label}
            {t.key === "open" && counts.open > 0 ? (
              <span className="admin-pill-tab-count">{counts.open}</span>
            ) : null}
          </Link>
        ))}
      </div>

      <form className="admin-toolbar" method="get" action="/admin/litiges">
        {activeStatus ? (
          <input type="hidden" name="status" value={activeStatus} />
        ) : null}
        <input
          type="search"
          name="q"
          className="admin-search"
          placeholder="N° commande, email client, boutique…"
          defaultValue={q}
          style={{ maxWidth: 280 }}
        />
        <input
          type="text"
          name="shop"
          className="admin-search"
          placeholder="Slug boutique"
          defaultValue={shop}
          style={{ maxWidth: 160 }}
        />
        <input
          type="date"
          name="from"
          className="admin-search"
          defaultValue={from}
          style={{ maxWidth: 150, flex: "none" }}
        />
        <input
          type="date"
          name="to"
          className="admin-search"
          defaultValue={to}
          style={{ maxWidth: 150, flex: "none" }}
        />
        <button type="submit" className="admin-btn admin-btn--primary">
          Filtrer
        </button>
        {(q || shop || from || to || activeStatus) && (
          <Link href="/admin/litiges" className="admin-btn">
            Réinitialiser
          </Link>
        )}
      </form>
    </>
  );
}
