"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  Hourglass,
  CheckCircle,
  TrendUp,
  DownloadSimple,
  MagnifyingGlass,
  Gear,
  Warning,
  CaretRight,
  ShieldCheck,
} from "@phosphor-icons/react";
import PayoutMethodModal from "@/components/dashboard/PayoutMethodModal";
import EmptyTransactions from "@/app/dashboard/empty-states/EmptyTransactions";
import {
  getMerchantWithdrawalFeeRate,
  getPayoutOperators,
} from "@/lib/cartevo/pricing";
import styles from "./paiements.module.css";

interface Balances {
  available: number;
  pendingEscrow: number;
  inProgress: number;
  paidTotal: number;
  refunded: number;
}

interface PayoutRow {
  id: string;
  amount: number;
  grossAmount: number | null;
  commissionAmount: number | null;
  commissionRate: number | null;
  netAmount: number;
  feeCartevo: number;
  currency: string;
  status: string;
  payoutType: string;
  operator: string;
  phoneNumber: string;
  description: string | null;
  createdAt: string;
  releasedAt: string | null;
  paidOutAt: string | null;
  orderNumber: string | null;
  customerName: string | null;
}

interface Props {
  shopName: string;
  currency: string;
  planId: string;
  payoutMethodConfigured: boolean;
  payoutMethod?: {
    operator: string | null;
    country: string | null;
    phoneNumber: string | null;
    holderName: string | null;
  };
  balances: Balances;
  monthlyStats: {
    grossRevenue: number;
    totalCommission: number;
    transactionsCount: number;
  };
  payouts: PayoutRow[];
}

type FilterTab = "all" | "available" | "escrow" | "paid" | "in_progress";

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
  ORDER_DIGITAL: "Digital",
  ORDER_PHYSICAL: "Physique",
  ORDER_SERVICE: "Service",
  MERCHANT_REQUESTED: "Retrait manuel",
};

function WithdrawModal({
  available,
  currency,
  country,
  onClose,
}: {
  available: number;
  currency: string;
  country: string;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(available);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const feeRate = getMerchantWithdrawalFeeRate(country); // 0 ou 2 (%)
  const isFree = feeRate === 0;
  const fee = Math.round((amount * feeRate) / 100);
  const netReceived = amount - fee;
  const formatPrice = (n: number) => n.toLocaleString("fr-FR");
  // Cartevo ne propose pas de retrait Mobile Money dans certains pays (ex Tchad).
  const payoutUnavailable = getPayoutOperators(country).length === 0;

  const handleSubmit = async () => {
    if (payoutUnavailable) return;
    if (amount <= 0 || amount > available) {
      setError("Montant invalide");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la demande");
        return;
      }
      setSuccessMessage(typeof data.message === "string" ? data.message : null);
      setSuccess(true);
      setTimeout(() => window.location.reload(), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Problème réseau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {success ? (
          <div className={styles.modalSuccess}>
            <CheckCircle
              size={48}
              weight="duotone"
              color="var(--sellia-success)"
            />
            <h3>Demande envoyée</h3>
            <p>
              {successMessage ??
                `Vous recevrez ${formatPrice(netReceived)} ${currency} sur votre Mobile Money sous peu.`}
            </p>
          </div>
        ) : (
          <>
            <h3 className={styles.modalTitle}>Retirer votre solde</h3>
            <p className={styles.modalDesc}>
              Recevez votre argent directement sur votre Mobile Money.
            </p>
            {payoutUnavailable && (
              <div
                style={{
                  background: "#FEF3C7",
                  border: "1px solid #FDE68A",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "12px",
                  fontSize: "13px",
                  color: "#92400E",
                  lineHeight: 1.45,
                }}
              >
                Le retrait Mobile Money n&apos;est pas disponible dans votre pays
                pour le moment.
              </div>
            )}
            <div className={styles.modalField}>
              <label>Montant ({currency})</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                max={available}
                min={1000}
                className={styles.modalInput}
              />
              <div className={styles.modalFieldMeta}>
                Disponible :{" "}
                <strong>
                  {formatPrice(available)} {currency}
                </strong>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6B6E76",
                  marginTop: "8px",
                  lineHeight: 1.45,
                }}
              >
                Retraits jusqu&apos;à 50 000 {currency} : instantanés. Au-delà :
                validation manuelle sous 15 minutes maximum, pour votre
                sécurité.
              </div>
            </div>

            {isFree ? (
              <div
                style={{
                  background: "#DCFCE7",
                  border: "1px solid #BBF7D0",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#15803D",
                    marginBottom: "6px",
                  }}
                >
                  💚 Chez Sellia, votre argent vous appartient — les retraits
                  sont gratuits.
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    color: "#0E1116",
                  }}
                >
                  <span>Vous recevez</span>
                  <strong>
                    {formatPrice(amount)} {currency}
                  </strong>
                </div>
              </div>
            ) : (
              <div className={styles.modalBreakdown}>
                <div className={styles.modalBreakdownLine}>
                  <span>Montant retiré</span>
                  <span>
                    {formatPrice(amount)} {currency}
                  </span>
                </div>
                <div className={styles.modalBreakdownLine}>
                  <span>Frais de retrait ({feeRate}%)</span>
                  <span style={{ color: "var(--sellia-warning)" }}>
                    -{formatPrice(fee)} {currency}
                  </span>
                </div>
                <div className={styles.modalBreakdownLineFinal}>
                  <span>Vous recevrez</span>
                  <strong>
                    {formatPrice(netReceived)} {currency}
                  </strong>
                </div>
              </div>
            )}
            {error && <div className={styles.modalError}>⚠️ {error}</div>}
            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.btnSecondary}>
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  payoutUnavailable ||
                  amount <= 0 ||
                  amount > available
                }
                className={styles.btnPrimary}
              >
                {submitting ? "Envoi..." : "Confirmer le retrait"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaiementsClient({
  currency,
  planId,
  payoutMethodConfigured,
  payoutMethod,
  balances,
  monthlyStats,
  payouts,
}: Props) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPayoutMethodModal, setShowPayoutMethodModal] = useState(false);

  const formatPrice = (n: number) => n.toLocaleString("fr-FR");
  const commissionRate = planId === "pro" || planId === "business" ? 4 : 6;

  const filtered = useMemo(() => {
    let list = payouts;
    if (filter !== "all") {
      list = list.filter((p) => {
        if (filter === "available") return p.status === "AVAILABLE";
        if (filter === "escrow") return p.status === "PENDING_ESCROW";
        if (filter === "paid")
          return p.status === "PAID" || p.status === "SUCCESS";
        if (filter === "in_progress")
          return ["REQUESTED", "PROCESSING", "PENDING"].includes(p.status);
        return true;
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.orderNumber || "").toLowerCase().includes(q) ||
          (p.customerName || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [payouts, filter, search]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>— FINANCES</span>
          <h1 className={styles.title}>Paiements</h1>
          <p className={styles.subtitle}>
            Suivez vos revenus, vos versements en attente et retirez votre argent
            sur Mobile Money.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setShowPayoutMethodModal(true)}
          >
            <Gear size={14} weight="duotone" /> Méthode de retrait
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={balances.available <= 0 || !payoutMethodConfigured}
            onClick={() => setShowWithdrawModal(true)}
          >
            <DownloadSimple size={14} weight="bold" /> Retirer{" "}
            {formatPrice(balances.available)} {currency}
          </button>
        </div>
      </div>

      {!payoutMethodConfigured && (
        <div className={styles.alertCard}>
          <Warning size={16} weight="duotone" />
          <div className={styles.alertText}>
            <strong>Méthode de retrait non configurée</strong>
            <span>
              Configurez votre numéro Mobile Money pour pouvoir retirer vos
              gains.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPayoutMethodModal(true)}
            className={styles.alertCta}
          >
            Configurer <CaretRight size={13} weight="bold" />
          </button>
        </div>
      )}

      <div className={styles.balanceHero}>
        <div className={styles.balanceMain}>
          <div className={styles.balanceLabel}>SOLDE DISPONIBLE</div>
          <div className={styles.balanceValue}>
            {formatPrice(balances.available)}
            <span className={styles.balanceCurrency}>{currency}</span>
          </div>
          <div className={styles.balanceMeta}>
            <Wallet size={15} weight="duotone" color="currentColor" />{" "}
            Versement vers votre Mobile Money
          </div>
        </div>
        <div className={styles.balanceDivider} />
        <div className={styles.balanceSecondary}>
          <div className={styles.balanceSecItem}>
            <Hourglass
              size={16}
              weight="duotone"
              style={{ color: "var(--sellia-warning)" }}
            />
            <div>
              <div className={styles.balanceSecLabel}>En attente</div>
              <div className={styles.balanceSecValue}>
                {formatPrice(balances.pendingEscrow)} {currency}
              </div>
            </div>
          </div>
          <div className={styles.balanceSecItem}>
            <TrendUp size={14} weight="regular" style={{ color: "var(--sellia-info)" }} />
            <div>
              <div className={styles.balanceSecLabel}>Retraits en cours</div>
              <div className={styles.balanceSecValue}>
                {formatPrice(balances.inProgress)} {currency}
              </div>
            </div>
          </div>
          <div className={styles.balanceSecItem}>
            <CheckCircle
              size={14}
              weight="duotone"
              style={{ color: "var(--sellia-success)" }}
            />
            <div>
              <div className={styles.balanceSecLabel}>Versé total</div>
              <div className={styles.balanceSecValue}>
                {formatPrice(balances.paidTotal)} {currency}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.escrowExplainer}>
        <div className={styles.escrowExplainerIcon}>
          <ShieldCheck size={18} weight="duotone" />
        </div>
        <div className={styles.escrowExplainerText}>
          <strong>Comment fonctionnent vos paiements</strong>
          <span>
            Produits digitaux et services : versement immédiat dès le paiement.
            Produits physiques : fonds en attente, libérés quand le client
            confirme la réception avec son code à 6 chiffres.
          </span>
        </div>
      </div>

      <div className={styles.monthlyStats}>
        <div className={styles.monthlyStatsHeader}>
          <h2>Performance des 30 derniers jours</h2>
        </div>
        <div className={styles.monthlyStatsGrid}>
          <div className={styles.statBlock}>
            <div className={styles.statBlockLabel}>REVENUS BRUTS</div>
            <div className={styles.statBlockValue}>
              {formatPrice(monthlyStats.grossRevenue)}
              <span className={styles.statBlockCurrency}>{currency}</span>
            </div>
            <div className={styles.statBlockMeta}>
              <TrendUp size={11} weight="regular" />{" "}
              {monthlyStats.transactionsCount}{" "}
              transactions
            </div>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.statBlockLabel}>COMMISSION SELLIA</div>
            <div className={styles.statBlockValue}>
              -{formatPrice(monthlyStats.totalCommission)}
              <span className={styles.statBlockCurrency}>{currency}</span>
            </div>
            <div className={styles.statBlockMeta}>
              Taux {commissionRate}% · Plan{" "}
              {planId === "pro" ? "Pro" : "Découverte"}
            </div>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.statBlockLabel}>NET MARCHAND</div>
            <div
              className={styles.statBlockValue}
              style={{ color: "var(--sellia-success)" }}
            >
              {formatPrice(
                monthlyStats.grossRevenue - monthlyStats.totalCommission
              )}
              <span className={styles.statBlockCurrency}>{currency}</span>
            </div>
            <div className={styles.statBlockMeta}>Net après commission</div>
          </div>
        </div>
      </div>

      <div className={styles.transactionsSection}>
        <div className={styles.transactionsHeader}>
          <h2>Transactions</h2>
          <p>Historique complet de vos versements et retraits.</p>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            {(
              [
                { key: "all", label: "Toutes", count: payouts.length },
                {
                  key: "available",
                  label: "Disponibles",
                  count: payouts.filter((p) => p.status === "AVAILABLE").length,
                },
                {
                  key: "escrow",
                  label: "En attente",
                  count: payouts.filter((p) => p.status === "PENDING_ESCROW")
                    .length,
                },
                {
                  key: "in_progress",
                  label: "En cours",
                  count: payouts.filter((p) =>
                    ["REQUESTED", "PROCESSING", "PENDING"].includes(p.status)
                  ).length,
                },
                {
                  key: "paid",
                  label: "Versés",
                  count: payouts.filter((p) =>
                    ["PAID", "SUCCESS"].includes(p.status)
                  ).length,
                },
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
            <MagnifyingGlass
              size={14}
              weight="regular"
              className={styles.searchIcon}
            />
            <input
              type="text"
              placeholder="N° commande, client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <EmptyTransactions size={180} />
            <h3>Aucune transaction</h3>
            <p>
              Vos transactions apparaîtront ici dès vos premières ventes livrées
              ou libérées.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Brut</th>
                  <th>Commission</th>
                  <th>Net marchand</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const statusCfg =
                    STATUS_LABELS[p.status] || STATUS_LABELS.PENDING_ESCROW;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className={styles.descCell}>
                          <div className={styles.descMain}>
                            <Link
                              href={`/dashboard/paiements/${p.id}`}
                              className={styles.detailLink}
                            >
                              {p.orderNumber ? (
                                <span className={styles.orderLink}>
                                  {p.orderNumber}
                                </span>
                              ) : (
                                p.description || "Transaction"
                              )}
                            </Link>
                          </div>
                          {p.customerName && (
                            <div className={styles.descSub}>{p.customerName}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={styles.typePill}>
                          {TYPE_LABELS[p.payoutType] || p.payoutType}
                        </span>
                      </td>
                      <td className={styles.amountCell}>
                        {p.grossAmount !== null
                          ? `${formatPrice(p.grossAmount)} ${currency}`
                          : "—"}
                      </td>
                      <td className={styles.commissionCell}>
                        {p.commissionAmount !== null ? (
                          <>
                            <span>
                              -{formatPrice(p.commissionAmount)} {currency}
                            </span>
                            {p.commissionRate !== null && (
                              <span className={styles.commissionRate}>
                                {p.commissionRate}%
                              </span>
                            )}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className={styles.netCell}>
                        <strong>
                          {formatPrice(p.amount)} {currency}
                        </strong>
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
                      <td className={styles.dateCell}>
                        {formatDate(p.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showWithdrawModal && (
        <WithdrawModal
          available={balances.available}
          currency={currency}
          country={payoutMethod?.country || "CM"}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}

      {showPayoutMethodModal && (
        <PayoutMethodModal
          initialMethod={payoutMethod}
          onClose={() => setShowPayoutMethodModal(false)}
        />
      )}
    </div>
  );
}
