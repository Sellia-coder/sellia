"use client";

import Link from "next/link";
import {
  TrendUp,
  TrendDown,
  ShoppingCart,
  Users,
  Wallet,
  Package,
  ArrowRight,
  CaretRight,
  ClipboardText,
  Truck,
  Receipt,
  Coins,
  ChartLineUp,
  Sparkle,
} from "@phosphor-icons/react";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import styles from "./dashboard-home.module.css";

interface Kpi {
  current: number;
  previous: number;
  delta: number;
}

interface Props {
  user: { name: string };
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    currency: string;
  };
  kpis: {
    revenue: Kpi;
    orders: Kpi;
    customers: Kpi;
    avgBasket: Kpi;
  };
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
    imageUrl: string | null;
    emoji: string | null;
  }>;
  topCustomers: Array<{
    id: string;
    fullName: string;
    phone: string;
    city: string | null;
    totalOrders: number;
    totalSpent: number;
  }>;
  recentActivity: Array<{
    type: string;
    timestamp: string;
    title: string;
    subtitle: string;
    amount: number;
    href?: string;
  }>;
  revenueSeries: Array<{ date: string; revenue: number; label: string }>;
  balances: {
    available: number;
    pendingEscrow: number;
    inProgress: number;
    paidTotal: number;
    refunded: number;
  };
  actionItems: {
    pendingPaymentCount: number;
    toDeliverCount: number;
  };
}

const formatPrice = (n: number) => n.toLocaleString("fr-FR");

function displayCurrency(currency: string) {
  return currency === "XAF" ? "FCFA" : currency;
}

const formatRelativeDate = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
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

export default function DashboardHomeClient(props: Props) {
  const {
    user,
    shop,
    kpis,
    topProducts,
    topCustomers,
    recentActivity,
    revenueSeries,
    balances,
    actionItems,
  } = props;

  const currencyLabel = displayCurrency(shop.currency);
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hasOrders =
    kpis.orders.current > 0 || kpis.orders.previous > 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <div className={styles.dateLine}>{today.toUpperCase()}</div>
          <h1 className={styles.greeting}>
            Bonjour <span className={styles.greetingName}>{user.name}</span>
          </h1>
          <p className={styles.subtitle}>
            Voici un aperçu de votre activité aujourd&apos;hui.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/produits/nouveau" className={styles.btnPrimary}>
            <Package size={16} weight="duotone" /> Ajouter un produit
          </Link>
        </div>
      </div>

      {(actionItems.pendingPaymentCount > 0 ||
        actionItems.toDeliverCount > 0) && (
        <div className={styles.actionBar}>
          {actionItems.toDeliverCount > 0 && (
            <Link
              href="/dashboard/commandes?filter=in_delivery"
              className={styles.actionItem}
            >
              <div
                className={styles.actionIcon}
                style={{ background: "#DBEAFE", color: "#1D4ED8" }}
              >
                <Truck size={20} weight="duotone" />
              </div>
              <div className={styles.actionContent}>
                <strong>
                  {actionItems.toDeliverCount} commande
                  {actionItems.toDeliverCount > 1 ? "s" : ""} à livrer
                </strong>
                <span>Scannez le QR code pour libérer le paiement</span>
              </div>
              <CaretRight size={14} weight="bold" />
            </Link>
          )}
          {actionItems.pendingPaymentCount > 0 && (
            <Link
              href="/dashboard/commandes?filter=awaiting"
              className={styles.actionItem}
            >
              <div
                className={styles.actionIcon}
                style={{ background: "#FFEDD5", color: "#C2410C" }}
              >
                <ClipboardText size={20} weight="duotone" />
              </div>
              <div className={styles.actionContent}>
                <strong>
                  {actionItems.pendingPaymentCount} paiement
                  {actionItems.pendingPaymentCount > 1 ? "s" : ""} en attente
                </strong>
                <span>Relancez vos clients via WhatsApp</span>
              </div>
              <CaretRight size={14} weight="bold" />
            </Link>
          )}
        </div>
      )}

      <div className={styles.kpisGrid}>
        <KpiCard
          label="REVENUS"
          value={formatPrice(kpis.revenue.current)}
          unit={currencyLabel}
          delta={kpis.revenue.delta}
          subLabel="30 derniers jours"
          icon={<ChartLineUp size={18} weight="duotone" />}
        />
        <KpiCard
          label="COMMANDES"
          value={kpis.orders.current.toString()}
          delta={kpis.orders.delta}
          subLabel="30 derniers jours"
          icon={<ShoppingCart size={18} weight="duotone" />}
        />
        <KpiCard
          label="CLIENTS UNIQUES"
          value={kpis.customers.current.toString()}
          delta={kpis.customers.delta}
          subLabel="30 derniers jours"
          icon={<Users size={18} weight="duotone" />}
        />
        <KpiCard
          label="PANIER MOYEN"
          value={formatPrice(kpis.avgBasket.current)}
          unit={currencyLabel}
          delta={kpis.avgBasket.delta}
          subLabel="par commande"
          icon={<Receipt size={18} weight="duotone" />}
        />
      </div>

      <Link href="/dashboard/paiements" className={styles.balanceBanner}>
        <div className={styles.balanceLeft}>
          <div className={styles.balanceIconBox}>
            <Wallet size={22} weight="duotone" />
          </div>
          <div>
            <div className={styles.balanceLabel}>Solde disponible</div>
            <div className={styles.balanceValue}>
              {formatPrice(balances.available)}{" "}
              <span className={styles.balanceCurrency}>{currencyLabel}</span>
            </div>
            {balances.pendingEscrow > 0 && (
              <div className={styles.balanceMeta}>
                + {formatPrice(balances.pendingEscrow)} {currencyLabel} en
                attente
              </div>
            )}
          </div>
        </div>
        <div className={styles.balanceRight}>
          <span className={styles.balanceCta}>
            Gérer mes paiements <ArrowRight size={14} weight="bold" />
          </span>
        </div>
      </Link>

      {hasOrders && (
        <div className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Évolution des revenus</h2>
              <p className={styles.sectionSubtitle}>30 derniers jours</p>
            </div>
            <Link href="/dashboard/stats" className={styles.sectionLink}>
              Voir détails <CaretRight size={12} weight="bold" />
            </Link>
          </div>
          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={revenueSeries}
                margin={{ top: 10, right: 0, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E84B1F" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#E84B1F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#F0EDE5"
                  strokeDasharray="0 0"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#8A8D95" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#8A8D95" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "#0A0E13",
                    border: "none",
                    borderRadius: 10,
                    color: "#FFFFFF",
                    fontSize: 12,
                    padding: "10px 14px",
                  }}
                  labelStyle={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 11,
                    marginBottom: 4,
                  }}
                  formatter={(value) => [
                    `${formatPrice(Number(value))} ${currencyLabel}`,
                    "Revenus",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E84B1F"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className={styles.bento}>
        <div className={styles.bentoCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Top produits</h2>
              <p className={styles.sectionSubtitle}>30 derniers jours</p>
            </div>
            <Link href="/dashboard/produits" className={styles.sectionLink}>
              Tout voir <CaretRight size={12} weight="bold" />
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <div className={styles.miniEmpty}>
              <Package size={32} weight="duotone" color="var(--sellia-subtle)" />
              <span>Pas encore de ventes</span>
            </div>
          ) : (
            <div className={styles.list}>
              {topProducts.map((p, idx) => (
                <div key={`${p.name}-${idx}`} className={styles.listItem}>
                  <div className={styles.listRank}>{idx + 1}</div>
                  <div className={styles.listImage}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} />
                    ) : (
                      <span className={styles.listEmoji}>{p.emoji || "📦"}</span>
                    )}
                  </div>
                  <div className={styles.listInfo}>
                    <div className={styles.listName}>{p.name}</div>
                    <div className={styles.listMeta}>
                      {p.quantity} vendu{p.quantity > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className={styles.listValue}>
                    {formatPrice(p.revenue)}{" "}
                    <span className={styles.listValueUnit}>{currencyLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.bentoCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Top clients</h2>
              <p className={styles.sectionSubtitle}>Par dépenses totales</p>
            </div>
            <Link href="/dashboard/clients" className={styles.sectionLink}>
              Tout voir <CaretRight size={12} weight="bold" />
            </Link>
          </div>
          {topCustomers.length === 0 ? (
            <div className={styles.miniEmpty}>
              <Users size={32} weight="duotone" color="var(--sellia-subtle)" />
              <span>Pas encore de clients</span>
            </div>
          ) : (
            <div className={styles.list}>
              {topCustomers.map((c, idx) => (
                <Link
                  href={`/dashboard/clients/${c.id}`}
                  key={c.id}
                  className={styles.listItem}
                >
                  <div className={styles.listRank}>{idx + 1}</div>
                  <div className={styles.listAvatar}>
                    {getInitials(c.fullName)}
                  </div>
                  <div className={styles.listInfo}>
                    <div className={styles.listName}>{c.fullName}</div>
                    <div className={styles.listMeta}>
                      {c.totalOrders} commande{c.totalOrders > 1 ? "s" : ""} ·{" "}
                      {c.city || "—"}
                    </div>
                  </div>
                  <div className={styles.listValue}>
                    {formatPrice(c.totalSpent)}{" "}
                    <span className={styles.listValueUnit}>{currencyLabel}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={`${styles.bentoCard} ${styles.bentoCardWide}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Activité récente</h2>
              <p className={styles.sectionSubtitle}>
                Derniers événements de la boutique
              </p>
            </div>
          </div>
          {recentActivity.length === 0 ? (
            <div className={styles.miniEmpty}>
              <Sparkle size={32} weight="duotone" color="var(--sellia-subtle)" />
              <span>Aucune activité récente</span>
            </div>
          ) : (
            <div className={styles.timeline}>
              {recentActivity.map((event, idx) => {
                const isLast = idx === recentActivity.length - 1;
                let iconBg = "#DBEAFE";
                let iconColor = "#1D4ED8";
                let IconComp = ShoppingCart;
                if (event.type === "qr_scanned") {
                  iconBg = "#DCFCE7";
                  iconColor = "#15803D";
                  IconComp = Truck;
                } else if (event.type === "withdraw_requested") {
                  iconBg = "#EDE9FE";
                  iconColor = "#7C3AED";
                  IconComp = Coins;
                }

                const content = (
                  <>
                    <div
                      className={styles.timelineIconBox}
                      style={{ background: iconBg, color: iconColor }}
                    >
                      <IconComp size={16} weight="duotone" />
                      {!isLast && <div className={styles.timelineLine} />}
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineTitle}>{event.title}</div>
                      <div className={styles.timelineMeta}>
                        <span>{event.subtitle}</span>
                        <span className={styles.timelineDot}>·</span>
                        <span>{formatRelativeDate(event.timestamp)}</span>
                      </div>
                    </div>
                    <div className={styles.timelineAmount}>
                      +{formatPrice(event.amount)}
                      <span className={styles.timelineCurrency}>
                        {currencyLabel}
                      </span>
                    </div>
                  </>
                );

                return event.href ? (
                  <Link
                    key={`${event.subtitle}-${idx}`}
                    href={event.href}
                    className={styles.timelineItem}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={`${event.subtitle}-${idx}`}
                    className={styles.timelineItem}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  delta,
  subLabel,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  delta: number;
  subLabel: string;
  icon: React.ReactNode;
}) {
  const isPositive = delta >= 0;
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiHeader}>
        <span className={styles.kpiLabel}>{label}</span>
        <div className={styles.kpiIcon}>{icon}</div>
      </div>
      <div className={styles.kpiValue}>
        {value}
        {unit && <span className={styles.kpiUnit}>{unit}</span>}
      </div>
      <div className={styles.kpiFooter}>
        <span
          className={`${styles.kpiDelta} ${isPositive ? styles.kpiDeltaUp : styles.kpiDeltaDown}`}
        >
          {isPositive ? (
            <TrendUp size={11} weight="bold" />
          ) : (
            <TrendDown size={11} weight="bold" />
          )}
          {Math.abs(delta)}%
        </span>
        <span className={styles.kpiSubLabel}>{subLabel}</span>
      </div>
    </div>
  );
}
