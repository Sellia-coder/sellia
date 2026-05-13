"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import "./home-stripe.css";

export interface SetupStep {
  id: string;
  label: string;
  description: string;
  done: boolean;
  href: string;
  missing: string[];
}

interface KPI {
  label: string;
  value: string;
  unit?: string;
  trend: number;
  trendType: "up" | "down";
  period: string;
}

interface ActivityItem {
  id: string;
  type: "order" | "pending" | "new_customer" | "stock_alert";
  text: string;
  meta: string;
  amount?: number;
  amountType?: "positive" | "neutral";
}

export interface TopProductRow {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  imageUrl: string | null;
  realName: string;
}

export interface TopCustomerRow {
  phone: string;
  name: string;
  orderCount: number;
  totalSpent: number;
}

export interface ConversionFunnel {
  visits: number;
  carts: number;
  orders: number;
  cartRate: number;
  orderRate: number;
  globalRate: number;
}

interface HomeClientProps {
  firstName: string;
  shop?: { slug: string; name: string } | null;
  kpis?: KPI[] | null;
  recentActivities?: ActivityItem[];
  setupSteps?: SetupStep[] | null;
  topProducts?: TopProductRow[] | null;
  topCustomers?: TopCustomerRow[] | null;
  conversionFunnel?: ConversionFunnel | null;
  lowStockProducts?: Array<{
    id: string;
    name: string;
    stock: number;
    imageUrl: string | null;
    price: number;
  }> | null;
  salesSeries?: number[] | null;
}

type RecentRow = {
  id: string;
  type: "order" | "pending" | "new_customer" | "stock_alert";
  customerName: string;
  orderNumber: string;
  amount: number;
  time: string;
};

type TopProductView = {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  imageUrl: string | null;
};

type MockInsight = {
  type: "growth" | "tip" | "opportunity";
  title: string;
  desc: string;
  icon: "trending-up" | "alert" | "zap";
  action?: string;
  href?: string;
};

const MOCK_TOP_PRODUCTS: TopProductView[] = [
  {
    id: "p1",
    name: "Boucles Baobab",
    quantity: 12,
    revenue: 144000,
    imageUrl: null,
  },
  {
    id: "p2",
    name: "Collier Teranga",
    quantity: 8,
    revenue: 148000,
    imageUrl: null,
  },
  {
    id: "p3",
    name: "Bracelet Nuit de Gorée",
    quantity: 6,
    revenue: 132000,
    imageUrl: null,
  },
  {
    id: "p4",
    name: "Parure Dioula",
    quantity: 4,
    revenue: 152000,
    imageUrl: null,
  },
  {
    id: "p5",
    name: "Chaîne de Cheville Casamance",
    quantity: 3,
    revenue: 60000,
    imageUrl: null,
  },
];

const MOCK_TOP_CUSTOMERS: TopCustomerRow[] = [
  {
    phone: "+221770000001",
    name: "Fatou Diop",
    orderCount: 4,
    totalSpent: 89500,
  },
  {
    phone: "+221770000002",
    name: "Aïcha Sarr",
    orderCount: 3,
    totalSpent: 67200,
  },
  {
    phone: "+221770000003",
    name: "Mariama Ndiaye",
    orderCount: 3,
    totalSpent: 54000,
  },
  {
    phone: "+221770000004",
    name: "Khady Ba",
    orderCount: 2,
    totalSpent: 41000,
  },
  {
    phone: "+221770000005",
    name: "Awa Sow",
    orderCount: 2,
    totalSpent: 38500,
  },
];

const MOCK_LOW_STOCK: NonNullable<HomeClientProps["lowStockProducts"]> = [
  { id: "ls1", name: "Boucles Baobab", stock: 2, price: 12000, imageUrl: null },
  { id: "ls2", name: "Collier Teranga", stock: 1, price: 18500, imageUrl: null },
  { id: "ls3", name: "Parure Dioula", stock: 3, price: 38000, imageUrl: null },
];

const MOCK_FUNNEL: ConversionFunnel = {
  visits: 342,
  carts: 64,
  orders: 23,
  cartRate: 19,
  orderRate: 36,
  globalRate: 6.7,
};

const MOCK_RECENT: RecentRow[] = [
  {
    id: "a1",
    type: "order",
    customerName: "Fatou Diop",
    orderNumber: "SEL-A4B2K9",
    amount: 18500,
    time: "Il y a 8min",
  },
  {
    id: "a2",
    type: "pending",
    customerName: "Aïcha Sarr",
    orderNumber: "SEL-X9N3P1",
    amount: 12000,
    time: "Il y a 23min",
  },
  {
    id: "a3",
    type: "order",
    customerName: "Mariama Ndiaye",
    orderNumber: "SEL-K2J7M4",
    amount: 22000,
    time: "Il y a 1h",
  },
  {
    id: "a4",
    type: "new_customer",
    customerName: "Khady Ba",
    orderNumber: "",
    amount: 0,
    time: "Il y a 2h",
  },
  {
    id: "a5",
    type: "order",
    customerName: "Awa Sow",
    orderNumber: "SEL-D7H8L2",
    amount: 38000,
    time: "Il y a 3h",
  },
];

const MOCK_INSIGHTS: MockInsight[] = [
  {
    type: "growth",
    title: "Vos ventes augmentent",
    desc: "+34% vs 7j précédents. Continuez sur cette lancée.",
    icon: "trending-up",
  },
  {
    type: "tip",
    title: "Produits sans description",
    desc: "3 produits manquent de description détaillée. Cela augmente le taux d'achat de 15%.",
    icon: "alert",
    action: "Compléter",
    href: "/dashboard/produits",
  },
  {
    type: "opportunity",
    title: "Promo flash recommandée",
    desc: "Vos visites pic le vendredi soir. Lancez une promo de 20% sur 24h.",
    icon: "zap",
    action: "Créer",
    href: "/dashboard/promotions",
  },
];

type KpiWithSpark = KPI & { sparkPath: string };

const MOCK_KPIS: KpiWithSpark[] = [
  {
    label: "Revenu",
    value: "418 200",
    unit: "FCFA",
    trend: 34,
    trendType: "up",
    period: "vs 7j précédents",
    sparkPath: "M0,28 L20,24 L40,20 L60,15 L80,18 L100,12 L120,8",
  },
  {
    label: "Commandes",
    value: "23",
    unit: "",
    trend: 12,
    trendType: "up",
    period: "vs 7j précédents",
    sparkPath: "M0,25 L20,22 L40,20 L60,16 L80,18 L100,14 L120,10",
  },
  {
    label: "Clients uniques",
    value: "18",
    unit: "",
    trend: 8,
    trendType: "up",
    period: "vs 7j précédents",
    sparkPath: "M0,26 L20,23 L40,21 L60,18 L80,20 L100,16 L120,12",
  },
  {
    label: "Visites / jour",
    value: "49",
    unit: "",
    trend: -3,
    trendType: "down",
    period: "moyenne 7j",
    sparkPath: "M0,15 L20,18 L40,16 L60,20 L80,18 L100,22 L120,20",
  },
];

const SPARK_FALLBACK = [
  "M0,28 L20,24 L40,20 L60,15 L80,18 L100,12 L120,8",
  "M0,25 L20,22 L40,20 L60,16 L80,18 L100,14 L120,10",
  "M0,26 L20,23 L40,21 L60,18 L80,20 L100,16 L120,12",
  "M0,15 L20,18 L40,16 L60,20 L80,18 L100,22 L120,20",
];

function normalizeRecentRows(acts: ActivityItem[] | undefined): RecentRow[] {
  if (!acts?.length) return MOCK_RECENT;
  return acts.map((act) => {
    const m = act.text.match(
      /<strong>([^<]*)<\/strong>\s*[—\-]\s*commande\s+([^<]+)/i
    );
    const orderNum = (m?.[2] ?? "").replace(/<[^>]+>/g, "").trim();
    return {
      id: act.id,
      type: act.type,
      customerName: m?.[1]?.trim() || "Client",
      orderNumber: orderNum,
      amount: act.amount ?? 0,
      time: act.meta,
    };
  });
}

function normalizeTopProducts(
  rows: TopProductRow[] | undefined
): TopProductView[] {
  if (!rows?.length) return MOCK_TOP_PRODUCTS;
  return rows.map((p) => ({
    id: p.productId,
    name: p.realName || p.productName,
    quantity: p.quantity,
    revenue: p.revenue,
    imageUrl: p.imageUrl,
  }));
}

export default function HomeClient({
  firstName,
  shop: _shop,
  kpis,
  recentActivities,
  setupSteps,
  topProducts,
  topCustomers,
  conversionFunnel,
  lowStockProducts,
}: HomeClientProps) {
  const uid = useId().replace(/:/g, "");
  const [salesPeriod, setSalesPeriod] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");

  const displayTopProducts = useMemo(
    () => normalizeTopProducts(topProducts ?? undefined),
    [topProducts]
  );
  const displayTopCustomers = useMemo(
    () =>
      topCustomers && topCustomers.length > 0
        ? topCustomers
        : MOCK_TOP_CUSTOMERS,
    [topCustomers]
  );
  const displayLowStock = useMemo(
    () =>
      lowStockProducts && lowStockProducts.length > 0
        ? lowStockProducts
        : MOCK_LOW_STOCK,
    [lowStockProducts]
  );
  const displayFunnel = conversionFunnel ?? MOCK_FUNNEL;
  const displayRecent = useMemo(
    () => normalizeRecentRows(recentActivities),
    [recentActivities]
  );

  const resolvedKpis = useMemo((): KpiWithSpark[] => {
    if (kpis && kpis.length > 0) {
      return kpis.map((k, i) => ({
        ...k,
        sparkPath: SPARK_FALLBACK[i % SPARK_FALLBACK.length],
      }));
    }
    return MOCK_KPIS;
  }, [kpis]);

  const steps = setupSteps ?? [];
  const stepsDone = steps.filter((s) => s.done).length;
  const stepsTotal = steps.length;
  const progressPercent =
    stepsTotal > 0 ? (stepsDone / stepsTotal) * 100 : 0;
  const allDone = stepsDone === stepsTotal && stepsTotal > 0;
  const setupCirc = 125.66;
  const setupDashOffset =
    setupCirc - (setupCirc * progressPercent) / 100;
  const donutCirc = 427.04;
  const donutDashOffset =
    donutCirc - (donutCirc * displayFunnel.globalRate) / 100;

  return (
    <>
      <div className="dash-str-page-header">
        <div className="dash-page-header-left">
          <div className="dash-str-page-eyebrow">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <h1 className="dash-str-page-title">
            {firstName ? `Bonjour ${firstName}` : "Bonjour"}
          </h1>
          <p className="dash-str-page-subtitle">
            Voici un aperçu de votre activité aujourd&apos;hui.
          </p>
        </div>
        <div className="dash-str-page-actions">
          <button type="button" className="dash-str-btn dash-str-btn-secondary">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exporter
          </button>
          <Link
            href="/dashboard/produits/nouveau"
            className="dash-str-btn dash-str-btn-ember"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter un produit
          </Link>
        </div>
      </div>

      {allDone && (
        <div className="dash-str-setup-card" style={{ marginBottom: 20 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 13,
              color: "#166534",
            }}
          >
            Boutique configurée — toutes les étapes sont validées.
          </p>
        </div>
      )}

      {steps.length > 0 && !allDone && (
        <div className="dash-str-setup-card">
          <div className="dash-str-setup-header">
            <div>
              <div className="dash-str-setup-eyebrow">
                <span className="dash-str-setup-pulse" />
                Configuration
              </div>
              <h2 className="dash-str-setup-title">
                Votre boutique en {stepsTotal} étapes
              </h2>
              <p className="dash-str-setup-subtitle">
                {stepsDone === stepsTotal - 1
                  ? "Plus qu'une étape pour finaliser votre boutique !"
                  : `${stepsTotal - stepsDone} étape${stepsTotal - stepsDone > 1 ? "s" : ""} pour finaliser`}
              </p>
            </div>
            <div className="dash-str-setup-progress">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#F2F0EA"
                  strokeWidth="4"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#E84B1F"
                  strokeWidth="4"
                  strokeDasharray={setupCirc}
                  strokeDashoffset={setupDashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
              </svg>
              <span className="dash-str-setup-progress-text">
                {stepsDone}/{stepsTotal}
              </span>
            </div>
          </div>
          <div className="dash-str-setup-steps">
            {steps.map((step, idx) => (
              <a
                key={step.id}
                href={step.href}
                className={`dash-str-setup-step ${step.done ? "is-done" : ""}`}
              >
                <div className="dash-str-setup-step-check">
                  {step.done ? (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{String(idx + 1).padStart(2, "0")}</span>
                  )}
                </div>
                <div className="dash-str-setup-step-text">
                  <div className="dash-str-setup-step-label">{step.label}</div>
                  <div className="dash-str-setup-step-desc">
                    {step.description}
                  </div>
                </div>
                {!step.done && (
                  <svg
                    className="dash-str-setup-step-arrow"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="dash-str-kpi-grid">
        {resolvedKpis.map((kpi, i) => (
          <div key={i} className="dash-str-kpi-card">
            <div className="dash-str-kpi-top">
              <span className="dash-str-kpi-label">{kpi.label}</span>
              <span
                className={`dash-str-kpi-trend dash-str-kpi-trend-${kpi.trendType || "up"}`}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  {kpi.trendType === "down" ? (
                    <polyline points="6 9 12 15 18 9" />
                  ) : (
                    <polyline points="18 15 12 9 6 15" />
                  )}
                </svg>
                {kpi.trend > 0 ? "+" : ""}
                {kpi.trend}%
              </span>
            </div>
            <div className="dash-str-kpi-value">
              {kpi.value}
              {kpi.unit ? (
                <span className="dash-str-kpi-unit"> {kpi.unit}</span>
              ) : null}
            </div>
            <div className="dash-str-kpi-period">{kpi.period}</div>
            <svg
              className="dash-str-kpi-spark"
              viewBox="0 0 120 32"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id={`${uid}-sparkGrad${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      kpi.trendType === "down" ? "#dc2626" : "#22c55e"
                    }
                    stopOpacity="0.15"
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      kpi.trendType === "down" ? "#dc2626" : "#22c55e"
                    }
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path
                d={`${kpi.sparkPath} L120,32 L0,32 Z`}
                fill={`url(#${uid}-sparkGrad${i})`}
              />
              <path
                d={kpi.sparkPath}
                fill="none"
                stroke={kpi.trendType === "down" ? "#dc2626" : "#22c55e"}
                strokeWidth="1.5"
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="dash-str-row-2-1">
        <div className="dash-str-card">
          <div className="dash-str-card-head">
            <div>
              <h3 className="dash-str-card-title">Évolution des ventes</h3>
              <p className="dash-str-card-desc">
                Revenu sur la période sélectionnée
              </p>
            </div>
            <div className="dash-str-tab-group">
              {(["7d", "30d", "90d", "1y"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`dash-str-tab ${salesPeriod === p ? "is-active" : ""}`}
                  onClick={() => setSalesPeriod(p)}
                >
                  {p === "7d"
                    ? "7J"
                    : p === "30d"
                      ? "30J"
                      : p === "90d"
                        ? "90J"
                        : "1A"}
                </button>
              ))}
            </div>
          </div>
          <div className="dash-str-card-body">
            <div className="dash-str-chart-area">
              <svg
                viewBox="0 0 800 240"
                preserveAspectRatio="none"
                style={{ width: "100%", height: "100%" }}
              >
                <defs>
                  <linearGradient
                    id={`${uid}-chartGrad`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#E84B1F"
                      stopOpacity="0.2"
                    />
                    <stop
                      offset="100%"
                      stopColor="#E84B1F"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <line
                  x1="0"
                  y1="48"
                  x2="800"
                  y2="48"
                  stroke="#F2F0EA"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="96"
                  x2="800"
                  y2="96"
                  stroke="#F2F0EA"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="144"
                  x2="800"
                  y2="144"
                  stroke="#F2F0EA"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="192"
                  x2="800"
                  y2="192"
                  stroke="#F2F0EA"
                  strokeDasharray="3 3"
                />
                <path
                  d="M 0 180 C 60 175, 100 160, 140 162 S 220 145, 280 130 S 360 115, 420 110 S 500 95, 560 85 S 640 70, 700 60 S 760 45, 800 35 L 800 240 L 0 240 Z"
                  fill={`url(#${uid}-chartGrad)`}
                />
                <path
                  d="M 0 180 C 60 175, 100 160, 140 162 S 220 145, 280 130 S 360 115, 420 110 S 500 95, 560 85 S 640 70, 700 60 S 760 45, 800 35"
                  fill="none"
                  stroke="#E84B1F"
                  strokeWidth="2"
                />
                <circle cx="700" cy="60" r="5" fill="#E84B1F" />
                <circle
                  cx="700"
                  cy="60"
                  r="10"
                  fill="#E84B1F"
                  opacity="0.2"
                />
                <rect
                  x="645"
                  y="0"
                  width="110"
                  height="44"
                  rx="6"
                  fill="#0E1116"
                />
                <text
                  x="700"
                  y="18"
                  fill="#FAFAF7"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9"
                  textAnchor="middle"
                  letterSpacing="0.5"
                >
                  11 MAI
                </text>
                <text
                  x="700"
                  y="34"
                  fill="#FAFAF7"
                  fontFamily="Inter, sans-serif"
                  fontSize="13"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  62 400 FCFA
                </text>
              </svg>
            </div>
            <div className="dash-str-chart-footer">
              <div className="dash-str-chart-stat">
                <span className="dash-str-chart-stat-label">
                  Total période
                </span>
                <span className="dash-str-chart-stat-value">
                  418 200 <em>FCFA</em>
                </span>
              </div>
              <div className="dash-str-chart-stat">
                <span className="dash-str-chart-stat-label">
                  Moyenne / jour
                </span>
                <span className="dash-str-chart-stat-value">
                  13 940 <em>FCFA</em>
                </span>
              </div>
              <div className="dash-str-chart-stat">
                <span className="dash-str-chart-stat-label">
                  Meilleur jour
                </span>
                <span className="dash-str-chart-stat-value">
                  62 400 <em>FCFA</em>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-str-card">
          <div className="dash-str-card-head">
            <div>
              <h3 className="dash-str-card-title">Activité récente</h3>
              <p className="dash-str-card-desc">5 derniers événements</p>
            </div>
            <Link href="/dashboard/commandes" className="dash-str-link-sm">
              Voir tout →
            </Link>
          </div>
          <div className="dash-str-card-body dash-str-card-body-flush">
            <div className="dash-str-activity-list">
              {displayRecent.map((act) => (
                <div key={act.id} className="dash-str-activity-row">
                  <div
                    className={`dash-str-activity-icon dash-str-activity-icon-${act.type}`}
                  >
                    {act.type === "order" && (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {act.type === "pending" && (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    )}
                    {act.type === "new_customer" && (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                    )}
                    {act.type === "stock_alert" && (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    )}
                  </div>
                  <div className="dash-str-activity-content">
                    <div className="dash-str-activity-title">
                      {act.type === "order" && (
                        <>
                          <strong>{act.customerName}</strong> a commandé{" "}
                          <span className="dash-str-mono">{act.orderNumber}</span>
                        </>
                      )}
                      {act.type === "pending" && (
                        <>
                          <strong>{act.customerName}</strong> attend
                          confirmation{" "}
                          <span className="dash-str-mono">{act.orderNumber}</span>
                        </>
                      )}
                      {act.type === "new_customer" && (
                        <>
                          <strong>{act.customerName}</strong> est un nouveau
                          client
                        </>
                      )}
                      {act.type === "stock_alert" && (
                        <>
                          Alerte stock — <strong>{act.customerName}</strong>
                        </>
                      )}
                    </div>
                    <div className="dash-str-activity-meta">{act.time}</div>
                  </div>
                  {act.amount > 0 && (
                    <div className="dash-str-activity-amount">
                      +{act.amount.toLocaleString("fr-FR")}
                      <em>FCFA</em>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dash-str-row-3">
        <div className="dash-str-card">
          <div className="dash-str-card-head">
            <div>
              <h3 className="dash-str-card-title">Top produits</h3>
              <p className="dash-str-card-desc">7 derniers jours</p>
            </div>
            <Link href="/dashboard/produits" className="dash-str-link-sm">
              Voir tout →
            </Link>
          </div>
          <div className="dash-str-card-body dash-str-card-body-flush">
            <div className="dash-str-list">
              {displayTopProducts.slice(0, 5).map((p, idx) => (
                <div key={p.id} className="dash-str-list-row">
                  <div className="dash-str-list-rank">{idx + 1}</div>
                  <div className="dash-str-list-thumb">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} />
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>
                  <div className="dash-str-list-info">
                    <div className="dash-str-list-name">{p.name}</div>
                    <div className="dash-str-list-meta">
                      {p.quantity} vente{p.quantity > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="dash-str-list-value">
                    {p.revenue.toLocaleString("fr-FR")}
                    <em>FCFA</em>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-str-card">
          <div className="dash-str-card-head">
            <div>
              <h3 className="dash-str-card-title">Top clients</h3>
              <p className="dash-str-card-desc">7 derniers jours</p>
            </div>
            <Link href="/dashboard/clients" className="dash-str-link-sm">
              Voir tout →
            </Link>
          </div>
          <div className="dash-str-card-body dash-str-card-body-flush">
            <div className="dash-str-list">
              {displayTopCustomers.slice(0, 5).map((c, idx) => (
                <div key={c.phone} className="dash-str-list-row">
                  <div className="dash-str-list-rank">{idx + 1}</div>
                  <div className="dash-str-list-avatar">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="dash-str-list-info">
                    <div className="dash-str-list-name">{c.name}</div>
                    <div className="dash-str-list-meta">
                      {c.orderCount} commande{c.orderCount > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="dash-str-list-value">
                    {c.totalSpent.toLocaleString("fr-FR")}
                    <em>FCFA</em>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-str-card">
          <div className="dash-str-card-head">
            <div>
              <h3 className="dash-str-card-title">Tunnel de conversion</h3>
              <p className="dash-str-card-desc">7 derniers jours</p>
            </div>
          </div>
          <div className="dash-str-card-body">
            <div className="dash-str-donut-wrap">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle
                  cx="90"
                  cy="90"
                  r="68"
                  fill="none"
                  stroke="#F2F0EA"
                  strokeWidth="14"
                />
                <circle
                  cx="90"
                  cy="90"
                  r="68"
                  fill="none"
                  stroke="#E84B1F"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={donutCirc}
                  strokeDashoffset={donutDashOffset}
                  transform="rotate(-90 90 90)"
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div className="dash-str-donut-center">
                <span className="dash-str-donut-value">
                  {displayFunnel.globalRate}%
                </span>
                <span className="dash-str-donut-label">Conversion</span>
              </div>
            </div>
            <div className="dash-str-funnel-stats">
              <div className="dash-str-funnel-stat">
                <span className="dash-str-funnel-stat-dot dash-str-funnel-stat-dot-1" />
                <span className="dash-str-funnel-stat-label">Visites</span>
                <span className="dash-str-funnel-stat-value">
                  {displayFunnel.visits}
                </span>
              </div>
              <div className="dash-str-funnel-stat">
                <span className="dash-str-funnel-stat-dot dash-str-funnel-stat-dot-2" />
                <span className="dash-str-funnel-stat-label">Paniers</span>
                <span className="dash-str-funnel-stat-value">
                  {displayFunnel.carts}
                </span>
              </div>
              <div className="dash-str-funnel-stat">
                <span className="dash-str-funnel-stat-dot dash-str-funnel-stat-dot-3" />
                <span className="dash-str-funnel-stat-label">Commandes</span>
                <span className="dash-str-funnel-stat-value">
                  {displayFunnel.orders}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-str-row-2-equal">
        <div className="dash-str-card">
          <div className="dash-str-card-head">
            <div>
              <h3 className="dash-str-card-title">
                <span className="dash-str-title-badge dash-str-title-badge-warn">
                  !
                </span>
                Stock à réapprovisionner
              </h3>
              <p className="dash-str-card-desc">
                Produits avec moins de 5 unités
              </p>
            </div>
            <Link href="/dashboard/produits" className="dash-str-link-sm">
              Voir tout →
            </Link>
          </div>
          <div className="dash-str-card-body dash-str-card-body-flush">
            <div className="dash-str-list">
              {displayLowStock.map((p) => (
                <div key={p.id} className="dash-str-list-row">
                  <div className="dash-str-list-thumb">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} />
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>
                  <div className="dash-str-list-info">
                    <div className="dash-str-list-name">{p.name}</div>
                    <div className="dash-str-list-meta">
                      {p.price.toLocaleString("fr-FR")} FCFA
                    </div>
                  </div>
                  <div
                    className={`dash-str-stock-pill ${p.stock <= 1 ? "is-critical" : ""}`}
                  >
                    {p.stock} restant{p.stock > 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-str-card">
          <div className="dash-str-card-head">
            <div>
              <h3 className="dash-str-card-title">
                <span className="dash-str-title-badge dash-str-title-badge-ai">
                  AI
                </span>
                Suggestions intelligentes
              </h3>
              <p className="dash-str-card-desc">
                Recommandations personnalisées
              </p>
            </div>
          </div>
          <div className="dash-str-card-body dash-str-card-body-flush">
            <div className="dash-str-list">
              {MOCK_INSIGHTS.map((ins, idx) => (
                <div key={idx} className="dash-str-insight-row">
                  <div
                    className={`dash-str-insight-icon dash-str-insight-icon-${ins.type}`}
                  >
                    {ins.icon === "trending-up" && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                      </svg>
                    )}
                    {ins.icon === "alert" && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    )}
                    {ins.icon === "zap" && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    )}
                  </div>
                  <div className="dash-str-insight-content">
                    <div className="dash-str-insight-title">{ins.title}</div>
                    <div className="dash-str-insight-desc">{ins.desc}</div>
                  </div>
                  {ins.action && ins.href ? (
                    <Link href={ins.href} className="dash-str-insight-action">
                      {ins.action}
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
