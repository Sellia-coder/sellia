"use client";

import Link from "next/link";
import {
  CaretLeft,
  Phone,
  Envelope,
  MapPin,
  WhatsappLogo,
} from "@phosphor-icons/react";
import {
  computeDisplayStatus,
  STATUS_CONFIG,
  formatPrice,
  type OrderItem,
} from "@/lib/order-status";
import styles from "./customer-detail.module.css";

interface CustomerData {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string | null;
  address: string | null;
  totalOrders: number;
  totalSpent: number;
  averageOrder: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  notes: string | null;
  tags: string[];
}

interface OrderRow {
  id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  status: string;
  qrScannedAt: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  items: OrderItem[];
  createdAt: string;
}

interface Props {
  currency: string;
  customer: CustomerData;
  orders: OrderRow[];
}

export default function CustomerDetailClient({
  currency,
  customer,
  orders,
}: Props) {
  const initials = customer.fullName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <Link href="/dashboard/clients" className={styles.backLink}>
          <CaretLeft size={15} weight="bold" /> Tous les clients
        </Link>
      </div>

      <div className={styles.header}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.headerInfo}>
          <h1 className={styles.name}>{customer.fullName}</h1>
          <p className={styles.meta}>
            Client depuis {formatDate(customer.firstOrderAt)} · Dernière
            commande {formatDate(customer.lastOrderAt)}
          </p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Commandes</div>
          <div className={styles.statValue}>{customer.totalOrders}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total dépensé</div>
          <div className={styles.statValue}>
            {formatPrice(customer.totalSpent)}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Panier moyen</div>
          <div className={styles.statValue}>
            {formatPrice(customer.averageOrder)} {currency}
          </div>
        </div>
      </div>

      <div className={styles.contacts}>
        <a href={`tel:${customer.phone}`} className={styles.contactBtn}>
          <Phone size={14} weight="duotone" /> {customer.phone}
        </a>
        {customer.email && (
          <a href={`mailto:${customer.email}`} className={styles.contactBtn}>
            <Envelope size={14} weight="duotone" /> {customer.email}
          </a>
        )}
        {(customer.city || customer.address) && (
          <span className={styles.contactBtn}>
            <MapPin size={14} weight="duotone" />
            {customer.address && `${customer.address}, `}
            {customer.city}
          </span>
        )}
        <a
          href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.contactBtn} ${styles.whatsappBtn}`}
        >
          <WhatsappLogo size={14} weight="duotone" /> WhatsApp
        </a>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Historique commandes ({orders.length})
        </h2>
        {orders.length === 0 ? (
          <div className={styles.emptyOrders}>Aucune commande enregistrée.</div>
        ) : (
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>N°</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const displayStatus = computeDisplayStatus({
                  paymentStatus: o.paymentStatus,
                  status: o.status,
                  qrScannedAt: o.qrScannedAt
                    ? new Date(o.qrScannedAt)
                    : null,
                  paidAt: o.paidAt ? new Date(o.paidAt) : null,
                  refundedAt: o.refundedAt
                    ? new Date(o.refundedAt)
                    : null,
                  items: o.items,
                });
                const cfg = STATUS_CONFIG[displayStatus];
                return (
                  <tr key={o.id}>
                    <td>
                      <Link
                        href={`/dashboard/commandes/${o.orderNumber}`}
                        className={styles.orderLink}
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>
                      {formatPrice(o.total)} {currency}
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {customer.notes && (
        <div className={styles.notes}>
          <strong>Notes marchand :</strong> {customer.notes}
        </div>
      )}
    </div>
  );
}
