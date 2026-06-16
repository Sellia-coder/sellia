"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlass,
  Users,
  ShoppingCart,
  Repeat,
  ClockCountdown,
  ArrowClockwise,
  DownloadSimple,
  ChartPie,
  ListBullets,
  MapPin,
  CreditCard,
  Package,
} from "@phosphor-icons/react";
import EmptyCustomers from "@/app/dashboard/empty-states/EmptyCustomers";
import { formatPrice } from "@/lib/order-status";
import {
  type CustomerRow,
  type CustomerSegment,
  type SegmentAnalytics,
  filterBySegment,
  computeCustomerKpis,
  getCustomerSegment,
  segmentLabel,
} from "@/lib/dashboard/customer-insights";
import styles from "./customers-list.module.css";

type SortBy = "recent" | "spent" | "orders";
type ViewMode = "list" | "segments";

type ProductMix = {
  physical: number;
  digital: number;
  service: number;
  physicalPct: number;
  digitalPct: number;
  servicePct: number;
};

type PaymentRow = { method: string; revenue: number; pct: number };
type CityRow = { city: string; count: number; revenue: number };

interface Props {
  currency: string;
  customers: CustomerRow[];
  segments: SegmentAnalytics[];
  cities: CityRow[];
  productMix: ProductMix;
  paymentBreakdown: PaymentRow[];
}

const PAGE_SIZE = 25;

const SEGMENT_FILTERS: Array<{ key: CustomerSegment; label: string }> = [
  { key: "all", label: "Tous" },
  { key: "vip", label: "VIP" },
  { key: "repeat", label: "Récurrents" },
  { key: "new", label: "Nouveaux" },
  { key: "inactive", label: "Inactifs" },
];

const SEGMENT_BADGE: Record<string, string> = {
  vip: styles.badgeVip,
  repeat: styles.badgeRepeat,
  new: styles.badgeNew,
  inactive: styles.badgeInactive,
  all: styles.badgeDefault,
};

export default function CustomersListClient({
  currency,
  customers,
  segments,
  cities,
  productMix,
  paymentBreakdown,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [segment, setSegment] = useState<CustomerSegment>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);

  const kpis = useMemo(() => computeCustomerKpis(customers), [customers]);

  const filtered = useMemo(() => {
    let list = filterBySegment(customers, segment);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "spent") {
      list.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (sortBy === "orders") {
      list.sort((a, b) => b.totalOrders - a.totalOrders);
    } else {
      list.sort((a, b) => {
        const aDate = a.lastOrderAt ? new Date(a.lastOrderAt).getTime() : 0;
        const bDate = b.lastOrderAt ? new Date(b.lastOrderAt).getTime() : 0;
        return bDate - aDate;
      });
    }

    return list;
  }, [customers, search, sortBy, segment]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE
  );

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatRelative = (iso: string | null) => {
    if (!iso) return null;
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / (24 * 3600 * 1000));
    if (days <= 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 30) return `Il y a ${days} j`;
    const months = Math.floor(days / 30);
    if (months < 12) return `Il y a ${months} mois`;
    const years = Math.floor(months / 12);
    return `Il y a ${years} an${years > 1 ? "s" : ""}`;
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const exportCsv = useCallback(() => {
    const header = [
      "Nom",
      "Téléphone",
      "Email",
      "Ville",
      "Segment",
      "Commandes",
      "Total dépensé",
      "Dernier achat",
    ];
    const rows = filtered.map((c) => [
      c.fullName,
      c.phone,
      c.email || "",
      c.city || "",
      segmentLabel(getCustomerSegment(c)),
      String(c.totalOrders),
      String(c.totalSpent),
      c.lastOrderAt || "",
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sellia-clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  return (
    <>
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Clients total</span>
            <div className={styles.statIcon}>
              <Users size={16} weight="duotone" />
            </div>
          </div>
          <div className={styles.statValue}>{kpis.total}</div>
          <div className={styles.statSub}>
            +{kpis.newThisMonth} ce mois
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Panier moyen</span>
            <div className={styles.statIcon}>
              <ShoppingCart size={16} weight="duotone" />
            </div>
          </div>
          <div className={styles.statValue}>
            {formatPrice(kpis.avgBasket)}
          </div>
          <div className={styles.statSub}>{currency}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Récurrents</span>
            <div className={styles.statIcon}>
              <Repeat size={16} weight="duotone" />
            </div>
          </div>
          <div className={styles.statValue}>{kpis.repeat}</div>
          <div className={styles.statSub}>2+ commandes</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>Inactifs</span>
            <div className={styles.statIcon}>
              <ClockCountdown size={16} weight="duotone" />
            </div>
          </div>
          <div className={styles.statValue}>{kpis.inactive}</div>
          <div className={styles.statSub}>90 jours sans achat</div>
        </div>
      </div>

      <div className={styles.viewToggle}>
        <button
          type="button"
          className={`${styles.viewBtn} ${viewMode === "list" ? styles.viewBtnActive : ""}`}
          onClick={() => setViewMode("list")}
        >
          <ListBullets size={15} weight="duotone" />
          Liste
        </button>
        <button
          type="button"
          className={`${styles.viewBtn} ${viewMode === "segments" ? styles.viewBtnActive : ""}`}
          onClick={() => setViewMode("segments")}
        >
          <ChartPie size={15} weight="duotone" />
          Segments
        </button>
      </div>

      {viewMode === "segments" ? (
        <div className={styles.segmentsView}>
          <div className={styles.segmentGrid}>
            {segments.map((s) => (
              <div key={s.id} className={styles.segmentCard}>
                <div className={styles.segmentCardHead}>
                  <span className={styles.segmentName}>{s.label}</span>
                  <span className={styles.segmentCount}>{s.count}</span>
                </div>
                <p className={styles.segmentCriteria}>{s.criteria}</p>
                <div className={styles.segmentMetrics}>
                  <div>
                    <span className={styles.segmentMetricLabel}>% CA</span>
                    <span className={styles.segmentValue}>{s.revenuePct}%</span>
                  </div>
                  <div>
                    <span className={styles.segmentMetricLabel}>% clients</span>
                    <span className={styles.segmentValue}>{s.clientPct}%</span>
                  </div>
                </div>
                <div className={styles.segmentBar}>
                  <div
                    className={styles.segmentBarFill}
                    style={{ width: `${s.clientPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsTitle}>
                <MapPin size={16} weight="duotone" />
                Répartition géographique
              </div>
              {cities.length === 0 ? (
                <p className={styles.analyticsEmpty}>Aucune donnée ville.</p>
              ) : (
                <ul className={styles.analyticsList}>
                  {cities.map((c) => (
                    <li key={c.city}>
                      <span>{c.city}</span>
                      <span className={styles.analyticsNum}>
                        {c.count} · {formatPrice(c.revenue)} {currency}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.analyticsCard}>
              <div className={styles.analyticsTitle}>
                <CreditCard size={16} weight="duotone" />
                Moyens de paiement
              </div>
              {paymentBreakdown.length === 0 ? (
                <p className={styles.analyticsEmpty}>Aucune commande payée.</p>
              ) : (
                <ul className={styles.analyticsList}>
                  {paymentBreakdown.map((p) => (
                    <li key={p.method}>
                      <span>{p.method}</span>
                      <span className={styles.analyticsNum}>
                        {p.pct}% · {formatPrice(p.revenue)} {currency}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.analyticsCard}>
              <div className={styles.analyticsTitle}>
                <Package size={16} weight="duotone" />
                Physique vs digital
              </div>
              <div className={styles.mixBars}>
                <div className={styles.mixRow}>
                  <span>Physique</span>
                  <div className={styles.mixBar}>
                    <div
                      className={styles.mixFill}
                      style={{ width: `${productMix.physicalPct}%` }}
                    />
                  </div>
                  <span className={styles.analyticsNum}>
                    {productMix.physicalPct}%
                  </span>
                </div>
                <div className={styles.mixRow}>
                  <span>Digital</span>
                  <div className={styles.mixBar}>
                    <div
                      className={`${styles.mixFill} ${styles.mixFillDigital}`}
                      style={{ width: `${productMix.digitalPct}%` }}
                    />
                  </div>
                  <span className={styles.analyticsNum}>
                    {productMix.digitalPct}%
                  </span>
                </div>
                {productMix.servicePct > 0 ? (
                  <div className={styles.mixRow}>
                    <span>Service</span>
                    <div className={styles.mixBar}>
                      <div
                        className={`${styles.mixFill} ${styles.mixFillService}`}
                        style={{ width: `${productMix.servicePct}%` }}
                      />
                    </div>
                    <span className={styles.analyticsNum}>
                      {productMix.servicePct}%
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div className={styles.filterPills}>
              {SEGMENT_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`${styles.filterPill} ${segment === f.key ? styles.filterPillActive : ""}`}
                  onClick={() => {
                    setSegment(f.key);
                    setPage(1);
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className={styles.toolbarRight}>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="recent">Dernier achat</option>
                <option value="spent">Total dépensé</option>
                <option value="orders">Commandes</option>
              </select>

              <div className={styles.searchWrap}>
                <MagnifyingGlass
                  size={14}
                  weight="regular"
                  className={styles.searchIcon}
                />
                <input
                  type="text"
                  placeholder="Nom, téléphone, email…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className={styles.searchInput}
                />
              </div>

              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => router.refresh()}
                title="Actualiser"
              >
                <ArrowClockwise size={16} />
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={exportCsv}
                title="Exporter CSV"
              >
                <DownloadSimple size={16} />
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <EmptyCustomers size={180} />
              <h3>Aucun client</h3>
              <p>Les clients apparaîtront ici dès leur première commande.</p>
            </div>
          ) : (
            <>
              <div className={styles.listSummary}>
                <span>
                  <strong>{filtered.length}</strong> client
                  {filtered.length > 1 ? "s" : ""}
                  {segment !== "all"
                    ? ` · filtre ${SEGMENT_FILTERS.find((f) => f.key === segment)?.label}`
                    : ""}
                </span>
                <span>
                  CA segment :{" "}
                  <strong>
                    {formatPrice(
                      filtered.reduce((s, c) => s + c.totalSpent, 0)
                    )}{" "}
                    {currency}
                  </strong>
                </span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Segment</th>
                      <th>Total dépensé</th>
                      <th>Commandes</th>
                      <th>Dernier achat</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((c) => {
                      const seg = getCustomerSegment(c);
                      return (
                        <tr key={c.id}>
                          <td>
                            <div className={styles.rowClient}>
                              <div className={styles.rowAvatar}>
                                {getInitials(c.fullName)}
                              </div>
                              <div>
                                <div className={styles.rowName}>
                                  {c.fullName}
                                </div>
                                <div className={styles.rowPhone}>{c.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`${styles.segmentBadge} ${SEGMENT_BADGE[seg] || styles.badgeDefault}`}
                            >
                              {segmentLabel(seg)}
                            </span>
                          </td>
                          <td className={styles.cellAmount}>
                            {formatPrice(c.totalSpent)} {currency}
                          </td>
                          <td className={styles.cellNum}>{c.totalOrders}</td>
                          <td className={styles.cellDate}>
                            <div className={styles.cellDateWrap}>
                              <span>{formatDate(c.lastOrderAt)}</span>
                              {c.lastOrderAt ? (
                                <span className={styles.cellDateRelative}>
                                  {formatRelative(c.lastOrderAt)}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.viewLinkBtn}
                              onClick={() =>
                                router.push(`/dashboard/clients/${c.id}`)
                              }
                            >
                              Voir
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className={styles.pagination}>
                <span className={styles.pageInfo}>
                  {(pageSafe - 1) * PAGE_SIZE + 1}–
                  {Math.min(pageSafe * PAGE_SIZE, filtered.length)} sur{" "}
                  {filtered.length}
                </span>
                <div className={styles.pageBtns}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={pageSafe <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={pageSafe >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
