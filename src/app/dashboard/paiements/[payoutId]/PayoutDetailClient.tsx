"use client";

import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react";
import styles from "./payout-detail.module.css";

const STATUS_LABELS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING_ESCROW: { label: "En attente", color: "#C2410C", bg: "#FFEDD5" },
  AVAILABLE: { label: "Disponible", color: "#15803D", bg: "#DCFCE7" },
  REQUESTED: { label: "Retrait demandé", color: "#1D4ED8", bg: "#DBEAFE" },
  PROCESSING: { label: "En cours", color: "#7C3AED", bg: "#EDE9FE" },
  PAID: { label: "Versé", color: "#0F766E", bg: "#CCFBF1" },
  SUCCESS: { label: "Versé", color: "#0F766E", bg: "#CCFBF1" },
  FAILED: { label: "Échec", color: "#B91C1C", bg: "#FEE2E2" },
  REFUNDED: { label: "Annulé", color: "#6B6E76", bg: "#F5F2EC" },
  CANCELLED: { label: "Annulé", color: "#6B6E76", bg: "#F5F2EC" },
  PENDING: { label: "En attente", color: "#C2410C", bg: "#FFEDD5" },
};

const TYPE_LABELS: Record<string, string> = {
  ORDER_DIGITAL: "Vente digitale",
  ORDER_PHYSICAL: "Vente physique",
  ORDER_SERVICE: "Service",
  MERCHANT_REQUESTED: "Retrait manuel",
};

interface PayoutData {
  id: string;
  amount: number;
  grossAmount: number | null;
  commissionAmount: number | null;
  commissionRate: number | null;
  feeCartevo: number;
  netAmount: number;
  currency: string;
  status: string;
  payoutType: string;
  operator: string;
  country: string;
  phoneNumber: string;
  description: string | null;
  createdAt: string;
  releasedAt: string | null;
  paidOutAt: string | null;
  requestedAt: string;
  completedAt: string | null;
  orderNumber: string | null;
  customerName: string | null;
  customerPhone: string | null;
  orderPaymentStatus: string | null;
  orderStatus: string | null;
}

interface Props {
  currency: string;
  payout: PayoutData;
}

export default function PayoutDetailClient({ currency, payout }: Props) {
  const formatPrice = (n: number) => n.toLocaleString("fr-FR");
  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusCfg =
    STATUS_LABELS[payout.status] || STATUS_LABELS.PENDING_ESCROW;

  return (
    <div className={styles.wrap}>
      <Link href="/dashboard/paiements" className={styles.backLink}>
        <CaretLeft size={15} weight="bold" /> Retour aux paiements
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>
          {payout.description || "Transaction"}
        </h1>
        <p className={styles.subtitle}>
          {TYPE_LABELS[payout.payoutType] || payout.payoutType} · Créée le{" "}
          {formatDate(payout.createdAt)}
        </p>
        <span
          className={styles.statusBadge}
          style={{ background: statusCfg.bg, color: statusCfg.color }}
        >
          <span
            className={styles.statusDot}
            style={{ background: statusCfg.color }}
          />
          {statusCfg.label}
        </span>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Montants</h2>
        <div className={styles.grid}>
          <div className={styles.row}>
            <span className={styles.label}>Net marchand</span>
            <span className={styles.valueLarge}>
              {formatPrice(payout.amount)} {currency}
            </span>
          </div>
          {payout.grossAmount !== null && (
            <div className={styles.row}>
              <span className={styles.label}>Montant brut (hors livraison)</span>
              <span className={styles.value}>
                {formatPrice(payout.grossAmount)} {currency}
              </span>
            </div>
          )}
          {payout.commissionAmount !== null && (
            <div className={styles.row}>
              <span className={styles.label}>
                Commission Sellia ({payout.commissionRate}%)
              </span>
              <span className={styles.value}>
                -{formatPrice(payout.commissionAmount)} {currency}
              </span>
            </div>
          )}
          {payout.feeCartevo > 0 && (
            <div className={styles.row}>
              <span className={styles.label}>Frais Cartevo</span>
              <span className={styles.value}>
                -{formatPrice(payout.feeCartevo)} {currency}
              </span>
            </div>
          )}
        </div>
      </section>

      {payout.orderNumber && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Commande liée</h2>
          <div className={styles.grid}>
            <div className={styles.row}>
              <span className={styles.label}>N° commande</span>
              <Link
                href={`/dashboard/commandes/${payout.orderNumber}`}
                className={styles.orderLink}
              >
                {payout.orderNumber}
              </Link>
            </div>
            {payout.customerName && (
              <div className={styles.row}>
                <span className={styles.label}>Client</span>
                <span className={styles.value}>{payout.customerName}</span>
              </div>
            )}
            {payout.customerPhone && (
              <div className={styles.row}>
                <span className={styles.label}>Téléphone</span>
                <span className={styles.value}>{payout.customerPhone}</span>
              </div>
            )}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Retrait & dates</h2>
        <div className={styles.grid}>
          <div className={styles.row}>
            <span className={styles.label}>Opérateur</span>
            <span className={styles.value}>{payout.operator}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Numéro</span>
            <span className={styles.value}>{payout.phoneNumber}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Date de libération</span>
            <span className={styles.value}>{formatDate(payout.releasedAt)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Versé au marchand</span>
            <span className={styles.value}>{formatDate(payout.paidOutAt)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
