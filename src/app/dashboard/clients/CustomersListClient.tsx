"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  Phone,
  Envelope,
  WhatsappLogo,
  Trophy,
} from "@phosphor-icons/react";
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
        <div className={styles.grid}>
          {filtered.map((c, idx) => {
            const isTopCustomer = idx < 3 && sortBy !== "recent";
            return (
              <div key={c.id} className={styles.card}>
                <Link
                  href={`/dashboard/clients/${c.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                {isTopCustomer && (
                  <div className={styles.topBadge}>
                    <Trophy size={11} weight="duotone" /> Top {idx + 1}
                  </div>
                )}
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>{getInitials(c.fullName)}</div>
                  <div className={styles.cardHeaderInfo}>
                    <div className={styles.cardName}>{c.fullName}</div>
                    <div className={styles.cardCity}>{c.city || "—"}</div>
                  </div>
                </div>

                <div className={styles.cardStats}>
                  <div>
                    <div className={styles.cardStatValue}>{c.totalOrders}</div>
                    <div className={styles.cardStatLabel}>Commandes</div>
                  </div>
                  <div>
                    <div className={styles.cardStatValue}>
                      {formatPrice(c.totalSpent)}
                    </div>
                    <div className={styles.cardStatLabel}>
                      Dépenses {currency}
                    </div>
                  </div>
                  <div>
                    <div className={styles.cardStatValue}>
                      {formatPrice(c.averageOrder)}
                    </div>
                    <div className={styles.cardStatLabel}>Panier moyen</div>
                  </div>
                </div>

                <div className={styles.cardContacts}>
                  <span className={styles.cardContact}>
                    <Phone size={12} weight="duotone" /> {c.phone}
                  </span>
                  {c.email && (
                    <span className={styles.cardContact}>
                      <Envelope size={12} weight="duotone" /> {c.email}
                    </span>
                  )}
                </div>

                </Link>
                <div className={styles.cardFooter}>
                  <span className={styles.cardDate}>
                    Dernière : {formatDate(c.lastOrderAt)}
                  </span>
                  <a
                    href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappLink}
                  >
                    <WhatsappLogo size={12} weight="duotone" /> WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
