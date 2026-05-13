"use client";

import Link from "next/link";
import { useMemo } from "react";

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

function buildSalesChartPaths(values: number[]) {
  const n = 7;
  const vals =
    values.length === n
      ? [...values]
      : Array.from({ length: n }, (_, i) => values[i] ?? 0);
  const max = Math.max(...vals, 1);
  const w = 800;
  const bottom = 260;
  const top = 40;
  const xs = vals.map((_, i) => (i / (n - 1)) * w);
  const ys = vals.map((v) => bottom - (v / max) * (bottom - top));
  let line = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < n; i++) line += ` L ${xs[i]} ${ys[i]}`;
  const area = `${line} L ${xs[n - 1]} ${bottom} L ${xs[0]} ${bottom} Z`;
  return { line, area };
}

export default function HomeClient({
  firstName,
  shop,
  kpis,
  recentActivities,
  setupSteps,
  topProducts,
  topCustomers,
  conversionFunnel,
  lowStockProducts,
  salesSeries,
}: HomeClientProps) {
  const steps = setupSteps ?? [];
  const stepsDone = steps.filter((s) => s.done).length;
  const stepsTotal = steps.length;
  const progressPercent =
    stepsTotal > 0 ? (stepsDone / stepsTotal) * 100 : 0;
  const dashOffset = 150.79 - (150.79 * progressPercent) / 100;
  const allDone = stepsDone === stepsTotal && stepsTotal > 0;

  const displayKpis = kpis ?? [];
  const displayActivities = recentActivities ?? [];

  const chartPaths = useMemo(
    () => buildSalesChartPaths(salesSeries ?? [0, 0, 0, 0, 0, 0, 0]),
    [salesSeries]
  );

  const todayStr = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— {todayStr}</div>
          <h1 className="dash-page-title">
            {firstName ? `Bonjour ${firstName} 👋` : "Bonjour 👋"}
          </h1>
          <p className="dash-page-subtitle">
            Voici l&apos;état de votre boutique aujourd&apos;hui.
          </p>
        </div>
        <div className="dash-page-actions">
          <button type="button" className="dash-btn dash-btn-secondary">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter
          </button>
          <Link href="/dashboard/produits/nouveau" className="dash-btn dash-btn-ember">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter un produit
          </Link>
        </div>
      </div>

      {steps.length > 0 && !allDone && (
        <div className="dash-checklist-card dash-animate-fade-up dash-animate-delay-1">
          <div className="dash-checklist-header">
            <div className="dash-checklist-header-left">
              <div className="dash-checklist-eyebrow">
                <span className="dash-checklist-eyebrow-pulse"></span>
                <span>Configuration</span>
              </div>
              <h2 className="dash-checklist-title">
                Votre boutique en <em>{stepsTotal} étapes</em>
              </h2>
              <p className="dash-checklist-subtitle">
                {stepsDone === 0
                  ? "Complétez ces étapes pour ouvrir votre boutique au public."
                  : stepsDone === stepsTotal - 1
                    ? "Plus qu'une étape pour finaliser votre boutique !"
                    : `Encore ${stepsTotal - stepsDone} étape${stepsTotal - stepsDone > 1 ? "s" : ""} pour finaliser votre boutique.`}
              </p>
            </div>
            <div className="dash-checklist-progress-circle">
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="rgba(14,17,22,0.06)"
                  strokeWidth="4"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="#E84B1F"
                  strokeWidth="4"
                  strokeDasharray="150.79"
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
              </svg>
              <div className="dash-checklist-progress-text">
                {stepsDone}/{stepsTotal}
              </div>
            </div>
          </div>
          <div className="dash-checklist-items">
            {steps.map((step, idx) => (
              <Link
                key={step.id}
                href={step.href}
                className={`dash-checklist-item ${step.done ? "is-done" : ""}`}
              >
                <div className="dash-checklist-item-top">
                  <div className="dash-checklist-icon">
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
                      String(idx + 1).padStart(2, "0")
                    )}
                  </div>
                  <div className="dash-checklist-item-label">{step.label}</div>
                  {!step.done && (
                    <svg
                      className="dash-checklist-item-arrow"
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
                </div>
                <div className="dash-checklist-item-desc">{step.description}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {allDone && (
        <div className="dash-all-done-card dash-animate-fade-up dash-animate-delay-1">
          <div className="dash-all-done-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h2 className="dash-all-done-title">🎉 Boutique 100% configurée</h2>
            <p className="dash-all-done-desc">
              Toutes les étapes sont validées. Vous pouvez maintenant promouvoir
              votre boutique sur WhatsApp, Instagram et TikTok.
            </p>
          </div>
        </div>
      )}

      <div className="dash-stats-grid">
        {displayKpis.map((kpi, i) => {
          const sparkColor = kpi.trendType === "up" ? "#22c55e" : "#dc2626";
          const paths = [
            "M 0 30 L 25 25 L 50 28 L 75 18 L 100 22 L 125 12 L 150 15 L 175 8 L 200 10",
            "M 0 32 L 25 30 L 50 25 L 75 28 L 100 22 L 125 18 L 150 14 L 175 12 L 200 8",
            "M 0 35 L 25 30 L 50 32 L 75 25 L 100 22 L 125 16 L 150 18 L 175 10 L 200 6",
            "M 0 18 L 25 14 L 50 20 L 75 16 L 100 22 L 125 26 L 150 24 L 175 28 L 200 26",
          ];
          return (
            <div
              key={i}
              className={`dash-stat-card dash-animate-fade-up dash-animate-delay-${Math.min(i + 2, 4)}`}
            >
              <div className="dash-stat-header">
                <span className="dash-stat-label">{kpi.label}</span>
                <span className="dash-stat-period">{kpi.period}</span>
              </div>
              <div className="dash-stat-value">
                {kpi.value}
                {kpi.unit && <span className="dash-stat-unit">{kpi.unit}</span>}
              </div>
              <div className={`dash-stat-trend dash-stat-trend-${kpi.trendType}`}>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline
                    points={
                      kpi.trendType === "up"
                        ? "18 15 12 9 6 15"
                        : "6 9 12 15 18 9"
                    }
                  />
                </svg>
                {kpi.trend > 0 ? "+" : ""}
                {kpi.trend}%
              </div>
              <svg
                className="dash-stat-chart"
                viewBox="0 0 200 40"
                preserveAspectRatio="none"
              >
                <path
                  d={paths[i % paths.length]}
                  fill="none"
                  stroke={sparkColor}
                  strokeWidth="2"
                />
              </svg>
            </div>
          );
        })}
      </div>

      <div className="dash-grid-2">
        <div className="dash-card dash-animate-fade-up dash-animate-delay-4">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Évolution des ventes</div>
              <div className="dash-card-subtitle">7 DERNIERS JOURS</div>
            </div>
          </div>
          <div className="dash-card-body">
            <div className="dash-chart-area">
              <svg
                viewBox="0 0 800 280"
                preserveAspectRatio="none"
                style={{ width: "100%", height: "100%" }}
              >
                <defs>
                  <linearGradient id="chartGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E84B1F" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#E84B1F" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line
                  x1="0"
                  y1="56"
                  x2="800"
                  y2="56"
                  stroke="rgba(14,17,22,0.05)"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="112"
                  x2="800"
                  y2="112"
                  stroke="rgba(14,17,22,0.05)"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="168"
                  x2="800"
                  y2="168"
                  stroke="rgba(14,17,22,0.05)"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="224"
                  x2="800"
                  y2="224"
                  stroke="rgba(14,17,22,0.05)"
                  strokeDasharray="3 3"
                />
                <path d={chartPaths.area} fill="url(#chartGrad1)" />
                <path
                  d={chartPaths.line}
                  fill="none"
                  stroke="#E84B1F"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="dash-card dash-animate-fade-up dash-animate-delay-4">
          <div className="dash-card-header">
            <div className="dash-card-title">Activité récente</div>
            <Link
              href="/dashboard/commandes"
              className="dash-btn dash-btn-ghost dash-btn-sm"
            >
              Tout voir
            </Link>
          </div>
          <div className="dash-card-body" style={{ padding: "0 20px" }}>
            <div className="dash-activity-list">
              {displayActivities.length === 0 && (
                <div
                  style={{
                    padding: "32px 0",
                    textAlign: "center",
                    color: "#8A8D95",
                    fontSize: 13,
                  }}
                >
                  Aucune commande pour le moment.
                </div>
              )}
              {displayActivities.map((act) => {
                const iconClass =
                  act.type === "order"
                    ? "success"
                    : act.type === "pending"
                      ? "info"
                      : act.type === "new_customer"
                        ? "ember"
                        : "info";
                return (
                  <div key={act.id} className="dash-activity-item">
                    <div
                      className={`dash-activity-icon dash-activity-icon-${iconClass}`}
                    >
                      {act.type === "order" && (
                        <svg
                          width="14"
                          height="14"
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
                          width="14"
                          height="14"
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
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                      {act.type === "stock_alert" && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                        </svg>
                      )}
                    </div>
                    <div className="dash-activity-content">
                      <div
                        className="dash-activity-text"
                        dangerouslySetInnerHTML={{ __html: act.text }}
                      ></div>
                      <div className="dash-activity-meta">{act.meta}</div>
                    </div>
                    {act.amount != null && (
                      <div
                        className={`dash-activity-amount ${act.amountType === "positive" ? "is-positive" : ""}`}
                      >
                        {act.amountType === "positive" ? "+" : ""}
                        {act.amount.toLocaleString("fr-FR")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="dash-grid-2 dash-grid-2-follow">
        <div className="dash-card dash-animate-fade-up dash-animate-delay-5">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">🔥 Top produits</div>
              <div className="dash-card-subtitle">7 DERNIERS JOURS</div>
            </div>
            <Link
              href="/dashboard/produits"
              className="dash-btn dash-btn-ghost dash-btn-sm"
            >
              Tout voir
            </Link>
          </div>
          <div className="dash-card-body" style={{ padding: "0 20px 20px" }}>
            {!topProducts || topProducts.length === 0 ? (
              <div className="dash-empty-state">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ opacity: 0.4 }}
                >
                  <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p>Aucune vente sur les 7 derniers jours</p>
                <span>Vos meilleurs produits apparaîtront ici</span>
              </div>
            ) : (
              <div className="dash-top-products">
                {topProducts.map((product, idx) => (
                  <div key={product.productId} className="dash-top-product-item">
                    <div className="dash-top-product-rank">{idx + 1}</div>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.realName}
                        className="dash-top-product-image"
                      />
                    ) : (
                      <div className="dash-top-product-image dash-top-product-image-placeholder">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    <div className="dash-top-product-info">
                      <div className="dash-top-product-name">{product.realName}</div>
                      <div className="dash-top-product-meta">
                        {product.quantity} vente{product.quantity > 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="dash-top-product-revenue">
                      {product.revenue.toLocaleString("fr-FR")}
                      <span> FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dash-card dash-animate-fade-up dash-animate-delay-5">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">⭐ Top clients</div>
              <div className="dash-card-subtitle">7 DERNIERS JOURS</div>
            </div>
            <Link
              href="/dashboard/clients"
              className="dash-btn dash-btn-ghost dash-btn-sm"
            >
              Tout voir
            </Link>
          </div>
          <div className="dash-card-body" style={{ padding: "0 20px 20px" }}>
            {!topCustomers || topCustomers.length === 0 ? (
              <div className="dash-empty-state">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ opacity: 0.4 }}
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p>Aucun client sur les 7 derniers jours</p>
                <span>Vos meilleurs clients apparaîtront ici</span>
              </div>
            ) : (
              <div className="dash-top-customers">
                {topCustomers.map((customer) => (
                  <div key={customer.phone} className="dash-top-customer-item">
                    <div className="dash-top-customer-avatar">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="dash-top-customer-info">
                      <div className="dash-top-customer-name">{customer.name}</div>
                      <div className="dash-top-customer-meta">
                        {customer.orderCount} commande
                        {customer.orderCount > 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="dash-top-customer-spent">
                      {customer.totalSpent.toLocaleString("fr-FR")}
                      <span> FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dash-grid-2 dash-grid-2-follow">
        <div className="dash-card dash-animate-fade-up dash-animate-delay-5">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">📊 Tunnel de conversion</div>
              <div className="dash-card-subtitle">7 DERNIERS JOURS</div>
            </div>
          </div>
          <div className="dash-card-body" style={{ padding: "0 20px 20px" }}>
            <div className="dash-funnel">
              <div className="dash-funnel-step dash-funnel-step-1">
                <div className="dash-funnel-step-bar" style={{ width: "100%" }}>
                  <span className="dash-funnel-step-label">👁 Visites</span>
                  <span className="dash-funnel-step-value">
                    {conversionFunnel?.visits ?? 0}
                  </span>
                </div>
              </div>
              <div className="dash-funnel-rate">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span>{conversionFunnel?.cartRate ?? 0}% mettent au panier</span>
              </div>

              <div className="dash-funnel-step dash-funnel-step-2">
                <div
                  className="dash-funnel-step-bar"
                  style={{
                    width: `${Math.max(conversionFunnel?.cartRate ?? 0, 10)}%`,
                  }}
                >
                  <span className="dash-funnel-step-label">🛒 Paniers</span>
                  <span className="dash-funnel-step-value">
                    {conversionFunnel?.carts ?? 0}
                  </span>
                </div>
              </div>
              <div className="dash-funnel-rate">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span>{conversionFunnel?.orderRate ?? 0}% achètent</span>
              </div>

              <div className="dash-funnel-step dash-funnel-step-3">
                <div
                  className="dash-funnel-step-bar"
                  style={{
                    width: `${Math.max(
                      ((conversionFunnel?.cartRate ?? 0) *
                        (conversionFunnel?.orderRate ?? 0)) /
                        100,
                      5
                    )}%`,
                  }}
                >
                  <span className="dash-funnel-step-label">💳 Commandes</span>
                  <span className="dash-funnel-step-value">
                    {conversionFunnel?.orders ?? 0}
                  </span>
                </div>
              </div>

              <div className="dash-funnel-summary">
                <span className="dash-funnel-summary-label">
                  Taux de conversion global
                </span>
                <span className="dash-funnel-summary-value">
                  {conversionFunnel?.globalRate ?? 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-card dash-animate-fade-up dash-animate-delay-5">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">⚠️ Stock faible</div>
              <div className="dash-card-subtitle">PRODUITS À RÉAPPROVISIONNER</div>
            </div>
            <Link
              href="/dashboard/produits"
              className="dash-btn dash-btn-ghost dash-btn-sm"
            >
              Tout voir
            </Link>
          </div>
          <div className="dash-card-body" style={{ padding: "0 20px 20px" }}>
            {!lowStockProducts || lowStockProducts.length === 0 ? (
              <div className="dash-empty-state dash-empty-state-success">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p>Tous vos stocks sont OK</p>
                <span>Aucun produit ne nécessite de réapprovisionnement</span>
              </div>
            ) : (
              <div className="dash-low-stock-list">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="dash-low-stock-item">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="dash-low-stock-image"
                      />
                    ) : (
                      <div className="dash-low-stock-image dash-low-stock-image-placeholder">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                      </div>
                    )}
                    <div className="dash-low-stock-info">
                      <div className="dash-low-stock-name">{product.name}</div>
                      <div className="dash-low-stock-price">
                        {product.price.toLocaleString("fr-FR")} FCFA
                      </div>
                    </div>
                    <div
                      className={`dash-low-stock-badge ${product.stock === 1 ? "is-critical" : ""}`}
                    >
                      {product.stock} restant{product.stock > 1 ? "s" : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
