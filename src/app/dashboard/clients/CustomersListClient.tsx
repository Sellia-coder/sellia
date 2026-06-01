"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import EmptyCustomers from "@/app/dashboard/empty-states/EmptyCustomers";
import { formatPrice } from "@/lib/order-status";
import styles from "./customers-list.module.css";

interface CustomerRow {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string | null;
  totalOrders: number;
  totalSpent: number;
  averageOrder: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  tags: string[];
}

interface Props {
  currency: string;
  customers: CustomerRow[];
  stats: {
    total: number;
    newThisMonth: number;
    repeatCustomers: number;
    totalRevenue: number;
  };
}

type SortBy = "recent" | "spent" | "orders";

export default function CustomersListClient({
  currency,
  customers,
  stats,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  const filtered = useMemo(() => {
    let list = [...customers];

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
  }, [customers, search, sortBy]);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>— CLIENTS</span>
          <h1 className={styles.title}>Clients</h1>
          <p className={styles.subtitle}>
            Suivez vos acheteurs, segmentez votre base et identifiez vos
            meilleurs clients.
          </p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>TOTAL CLIENTS</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>NOUVEAUX (30J)</div>
          <div
            className={styles.statValue}
            style={{ color: "var(--sellia-success)" }}
          >
            +{stats.newThisMonth}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>FIDÈLES</div>
          <div
            className={styles.statValue}
            style={{ color: "var(--sellia-info)" }}
          >
            {stats.repeatCustomers}
          </div>
          <div className={styles.statPill}>2+ commandes</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>CA TOTAL</div>
          <div
            className={styles.statValue}
            style={{ color: "var(--sellia-ember)" }}
          >
            {formatPrice(stats.totalRevenue)}
          </div>
          <div className={styles.statPill}>{currency}</div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.sortTabs}>
          {(
            [
              { key: "recent", label: "Plus récents" },
              { key: "spent", label: "Top dépenses" },
              { key: "orders", label: "Top commandes" },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              type="button"
              className={`${styles.sortTab} ${sortBy === s.key ? styles.sortTabActive : ""}`}
              onClick={() => setSortBy(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className={styles.searchWrap}>
          <MagnifyingGlass size={14} weight="regular" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Nom, téléphone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <EmptyCustomers size={180} />
          <h3>Aucun client</h3>
          <p>Les clients apparaîtront ici dès leur première commande.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Commandes</th>
                <th>Total dépensé</th>
                <th>Panier moyen</th>
                <th>Dernière commande</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/dashboard/clients/${c.id}`)}
                >
                  <td>
                    <div className={styles.rowClient}>
                      <div className={styles.rowAvatar}>
                        {getInitials(c.fullName)}
                      </div>
                      <div>
                        <div className={styles.rowName}>{c.fullName}</div>
                        {c.email && (
                          <div className={styles.rowEmail}>{c.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={styles.cellPhone}>{c.phone}</td>
                  <td className={styles.cellMuted}>{c.city || "—"}</td>
                  <td className={styles.cellNum}>{c.totalOrders}</td>
                  <td className={styles.cellAmount}>
                    {formatPrice(c.totalSpent)} {currency}
                  </td>
                  <td className={styles.cellMuted}>
                    {formatPrice(c.averageOrder)} {currency}
                  </td>
                  <td className={styles.cellDate}>
                    {formatDate(c.lastOrderAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
