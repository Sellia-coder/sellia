"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MagnifyingGlass, Eye } from "@phosphor-icons/react";
import {
  computeDisplayStatus,
  STATUS_CONFIG,
  getOrderTypeKind,
  formatPrice,
  type OrderItem,
  type DisplayStatus,
} from "@/lib/order-status";
import styles from "./orders-list.module.css";

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerCity: string | null;
  total: number;
  subtotal: number;
  shippingPrice: number;
  paymentStatus: string;
  status: string;
  paymentMethod: string;
  paymentSubMethod: string | null;
  qrCode: string | null;
  qrScannedAt: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  refundDeadline: string | null;
  items: OrderItem[];
  createdAt: string;
}

interface Stats {
  total: number;
  awaitingPayment: number;
  inDelivery: number;
  delivered: number;
  refunded: number;
  totalRevenue: number;
}

interface Props {
  shopSlug: string;
  currency: string;
  orders: OrderRow[];
  stats: Stats;
}

type FilterTab = "all" | "awaiting" | "in_delivery" | "delivered" | "refunded";

function toOrderForStatus(o: OrderRow) {
  return {
    paymentStatus: o.paymentStatus,
    status: o.status,
    qrScannedAt: o.qrScannedAt ? new Date(o.qrScannedAt) : null,
    paidAt: o.paidAt ? new Date(o.paidAt) : null,
    refundedAt: o.refundedAt ? new Date(o.refundedAt) : null,
    items: o.items,
  };
}

function matchesFilter(displayStatus: DisplayStatus, filter: FilterTab): boolean {
  if (filter === "awaiting") return displayStatus === "awaiting_payment";
  if (filter === "in_delivery") {
    return (
      displayStatus === "in_delivery" ||
      displayStatus === "paid_pending_delivery" ||
      displayStatus === "downloadable"
    );
  }
  if (filter === "delivered") {
    return displayStatus === "delivered" || displayStatus === "completed";
  }
  if (filter === "refunded") return displayStatus === "refunded";
  return true;
}

export default function OrdersListClient({
  currency,
  orders,
  stats,
}: Props) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = orders;

    if (filter !== "all") {
      list = list.filter((o) =>
        matchesFilter(computeDisplayStatus(toOrderForStatus(o)), filter)
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          (o.customerEmail || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [orders, filter, search]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const kindLabel = (kind: ReturnType<typeof getOrderTypeKind>) => {
    if (kind === "physical") return "Physique";
    if (kind === "digital") return "Digital";
    if (kind === "service") return "Service";
    return "Mixte";
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>— COMMANDES</span>
          <h1 className={styles.title}>Commandes</h1>
          <p className={styles.subtitle}>
            Suivez l&apos;ensemble de vos ventes, gérez les livraisons et
            libérez les versements en attente.
          </p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>TOTAL COMMANDES</div>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statPill}>Tous statuts</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>REVENUS LIVRÉS</div>
          <div
            className={styles.statValue}
            style={{ color: "var(--sellia-success)" }}
          >
            {formatPrice(stats.totalRevenue)}
          </div>
          <div
            className={styles.statPill}
            style={{ background: "#DCFCE7", color: "#15803D" }}
          >
            {currency}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>EN LIVRAISON</div>
          <div
            className={styles.statValue}
            style={{ color: "var(--sellia-info)" }}
          >
            {stats.inDelivery}
          </div>
          <div
            className={styles.statPill}
            style={{ background: "#DBEAFE", color: "#1D4ED8" }}
          >
            À traiter
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>EN ATTENTE PAIEMENT</div>
          <div
            className={styles.statValue}
            style={{ color: "var(--sellia-warning)" }}
          >
            {stats.awaitingPayment}
          </div>
          <div
            className={styles.statPill}
            style={{ background: "#FFEDD5", color: "#C2410C" }}
          >
            Inachevées
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {(
            [
              { key: "all", label: "Toutes", count: stats.total },
              {
                key: "awaiting",
                label: "En attente",
                count: stats.awaitingPayment,
              },
              {
                key: "in_delivery",
                label: "En livraison",
                count: stats.inDelivery,
              },
              { key: "delivered", label: "Livrées", count: stats.delivered },
              { key: "refunded", label: "Remboursées", count: stats.refunded },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tab} ${filter === tab.key ? styles.tabActive : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span className={styles.tabCount}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.searchWrap}>
          <MagnifyingGlass size={14} weight="regular" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="N° commande, client, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>Aucune commande</h3>
          <p>
            {filter === "all"
              ? "Les commandes apparaîtront ici dès que vos clients passeront leurs premiers achats."
              : "Essayez un autre filtre."}
          </p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>N° Commande</th>
                <th>Client</th>
                <th>Articles</th>
                <th>Montant</th>
                <th>Mode</th>
                <th>Statut</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const displayStatus = computeDisplayStatus(toOrderForStatus(o));
                const statusCfg = STATUS_CONFIG[displayStatus];
                const kind = getOrderTypeKind(o.items);
                const itemsCount = o.items.reduce(
                  (sum, i) => sum + i.quantity,
                  0
                );

                return (
                  <tr key={o.id}>
                    <td>
                      <Link
                        href={`/dashboard/commandes/${o.orderNumber}`}
                        className={styles.orderNumber}
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.customerName}>
                          {o.customerName}
                        </div>
                        <div className={styles.customerPhone}>
                          {o.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.itemsCell}>
                        <span className={styles.itemsCount}>
                          {itemsCount} article{itemsCount > 1 ? "s" : ""}
                        </span>
                        <span className={styles.itemsKind}>
                          {kindLabel(kind)}
                        </span>
                      </div>
                    </td>
                    <td className={styles.amount}>
                      {formatPrice(o.total)} {currency}
                    </td>
                    <td className={styles.payment}>
                      <div>{o.paymentMethod.replace(/_/g, " ")}</div>
                      {o.paymentSubMethod && (
                        <div className={styles.paymentSub}>
                          {o.paymentSubMethod}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          background: statusCfg.bg,
                          color: statusCfg.color,
                        }}
                      >
                        <span
                          className={styles.statusDot}
                          style={{ background: statusCfg.color }}
                        />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className={styles.date}>{formatDate(o.createdAt)}</td>
                    <td>
                      <Link
                        href={`/dashboard/commandes/${o.orderNumber}`}
                        className={styles.actionBtn}
                        title="Voir le détail"
                      >
                        <Eye size={14} weight="regular" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
