"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendUp,
  TrendDown,
  ShoppingCart,
  Users,
  Receipt,
  ChartLineUp,
} from "@phosphor-icons/react";
import type { DateRange } from "@/lib/analytics";
import styles from "./stats.module.css";

interface Kpi {
  current: number;
  previous: number;
  delta: number;
}

interface Props {
  currency: string;
  range: DateRange;
  kpis: {
    revenue: Kpi;
    orders: Kpi;
    customers: Kpi;
    avgBasket: Kpi;
  };
  revenueSeries: Array<{ date: string; revenue: number; label: string }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  paymentBreakdown: Array<{ method: string; count: number; revenue: number }>;
  productTypeBreakdown: Array<{
    date: string;
    physical: number;
    digital: number;
    service: number;
    label: string;
  }>;
  heatmap: number[][];
}

const formatPrice = (n: number) => n.toLocaleString("fr-FR");

function displayCurrency(currency: string) {
  return currency === "XAF" ? "FCFA" : currency;
}

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
};

const RANGES: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
  { value: "365d", label: "1 an" },
  { value: "all", label: "Tout" },
];

const PIE_COLORS = [
  "#E84B1F",
  "#0A0E13",
  "#7C3AED",
  "#1D4ED8",
  "#15803D",
  "#C2410C",
];

const DAYS_OF_WEEK = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function StatsClient({
  currency,
  range,
  kpis,
  revenueSeries,
  topProducts,
  paymentBreakdown,
  productTypeBreakdown,
  heatmap,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currencyLabel = displayCurrency(currency);

  const setRange = (newRange: DateRange) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", newRange);
    router.push(`/dashboard/stats?${params.toString()}`);
  };

  const heatmapMax = Math.max(...heatmap.flatMap((row) => row), 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>— ANALYTICS</span>
          <h1 className={styles.title}>Statistiques</h1>
          <p className={styles.subtitle}>
            Analysez votre performance, identifiez les tendances et optimisez vos
            ventes.
          </p>
        </div>
        <div className={styles.rangeSelector}>
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={`${styles.rangeBtn} ${range === r.value ? styles.rangeBtnActive : ""}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.kpisGrid}>
        <StatsKpi
          label="REVENUS"
          value={formatPrice(kpis.revenue.current)}
          unit={currencyLabel}
          delta={kpis.revenue.delta}
          icon={<ChartLineUp size={16} weight="duotone" />}
        />
        <StatsKpi
          label="COMMANDES"
          value={kpis.orders.current.toString()}
          delta={kpis.orders.delta}
          icon={<ShoppingCart size={16} weight="duotone" />}
        />
        <StatsKpi
          label="CLIENTS"
          value={kpis.customers.current.toString()}
          delta={kpis.customers.delta}
          icon={<Users size={16} weight="duotone" />}
        />
        <StatsKpi
          label="PANIER MOYEN"
          value={formatPrice(kpis.avgBasket.current)}
          unit={currencyLabel}
          delta={kpis.avgBasket.delta}
          icon={<Receipt size={16} weight="duotone" />}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Évolution des revenus</h2>
          <p className={styles.sectionSubtitle}>Période sélectionnée</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={revenueSeries}
            margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="statsRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E84B1F" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#E84B1F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F0EDE5" vertical={false} />
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
              tickFormatter={(v) => formatCompact(v)}
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
              labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}
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
              fill="url(#statsRevenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.grid2}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Top produits</h2>
            <p className={styles.sectionSubtitle}>Par chiffre d&apos;affaires</p>
          </div>
          {topProducts.length === 0 ? (
            <div className={styles.miniEmpty}>Aucune donnée sur la période</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topProducts.slice(0, 8)}
                layout="vertical"
                margin={{ top: 4, right: 24, bottom: 0, left: 110 }}
              >
                <CartesianGrid stroke="#F0EDE5" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#8A8D95" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCompact(v)}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: "#0A0E13" }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
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
                  formatter={(value) => [
                    `${formatPrice(Number(value))} ${currencyLabel}`,
                    "Revenus",
                  ]}
                  cursor={{ fill: "rgba(232, 75, 31, 0.05)" }}
                />
                <Bar dataKey="revenue" fill="#E84B1F" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Méthodes de paiement</h2>
            <p className={styles.sectionSubtitle}>
              Répartition des transactions
            </p>
          </div>
          {paymentBreakdown.length === 0 ? (
            <div className={styles.miniEmpty}>Aucune donnée sur la période</div>
          ) : (
            <div className={styles.pieWrap}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    dataKey="revenue"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {paymentBreakdown.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0A0E13",
                      border: "none",
                      borderRadius: 10,
                      color: "#FFFFFF",
                      fontSize: 12,
                      padding: "10px 14px",
                    }}
                    formatter={(value) => [
                      `${formatPrice(Number(value))} ${currencyLabel}`,
                      "Revenus",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.pieLegend}>
                {paymentBreakdown.map((p, idx) => (
                  <div key={p.method} className={styles.pieLegendItem}>
                    <span
                      className={styles.pieLegendDot}
                      style={{
                        background: PIE_COLORS[idx % PIE_COLORS.length],
                      }}
                    />
                    <span className={styles.pieLegendLabel}>{p.method}</span>
                    <span className={styles.pieLegendValue}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Digital · Physique · Service</h2>
          <p className={styles.sectionSubtitle}>Évolution par type de produit</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={productTypeBreakdown}
            margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
          >
            <CartesianGrid stroke="#F0EDE5" vertical={false} />
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
              tickFormatter={(v) => formatCompact(v)}
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
              formatter={(value, name) => [
                `${formatPrice(Number(value))} ${currencyLabel}`,
                String(name),
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Area
              type="monotone"
              dataKey="physical"
              name="Physique"
              stackId="1"
              stroke="#E84B1F"
              fill="#E84B1F"
              fillOpacity={0.85}
            />
            <Area
              type="monotone"
              dataKey="digital"
              name="Digital"
              stackId="1"
              stroke="#7C3AED"
              fill="#7C3AED"
              fillOpacity={0.85}
            />
            <Area
              type="monotone"
              dataKey="service"
              name="Service"
              stackId="1"
              stroke="#1D4ED8"
              fill="#1D4ED8"
              fillOpacity={0.85}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Heures de vente</h2>
          <p className={styles.sectionSubtitle}>
            Quand vos clients achètent le plus
          </p>
        </div>
        <div className={styles.heatmap}>
          <div className={styles.heatmapHours}>
            <div className={styles.heatmapCornerCell} />
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className={styles.heatmapHourLabel}>
                {h % 3 === 0 ? `${h}h` : ""}
              </div>
            ))}
          </div>
          {heatmap.map((dayRow, dayIdx) => (
            <div key={dayIdx} className={styles.heatmapRow}>
              <div className={styles.heatmapDayLabel}>
                {DAYS_OF_WEEK[dayIdx]}
              </div>
              {dayRow.map((value, hourIdx) => {
                const intensity = heatmapMax > 0 ? value / heatmapMax : 0;
                return (
                  <div
                    key={hourIdx}
                    className={styles.heatmapCell}
                    style={{
                      background:
                        value > 0
                          ? `rgba(232, 75, 31, ${0.1 + intensity * 0.9})`
                          : "#FAFAF7",
                    }}
                    title={
                      value > 0
                        ? `${DAYS_OF_WEEK[dayIdx]} ${hourIdx}h : ${formatPrice(value)} ${currencyLabel}`
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className={styles.heatmapLegend}>
          <span>Moins</span>
          <div className={styles.heatmapLegendBar}>
            {[0.1, 0.3, 0.5, 0.7, 1].map((alpha, idx) => (
              <div
                key={idx}
                className={styles.heatmapLegendDot}
                style={{ background: `rgba(232, 75, 31, ${alpha})` }}
              />
            ))}
          </div>
          <span>Plus</span>
        </div>
      </div>
    </div>
  );
}

function StatsKpi({
  label,
  value,
  unit,
  delta,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  delta: number;
  icon: React.ReactNode;
}) {
  const isPositive = delta >= 0;
  return (
    <div className={styles.statsKpiCard}>
      <div className={styles.statsKpiHeader}>
        <span className={styles.statsKpiLabel}>{label}</span>
        <div className={styles.statsKpiIcon}>{icon}</div>
      </div>
      <div className={styles.statsKpiValue}>
        {value}
        {unit && <span className={styles.statsKpiUnit}>{unit}</span>}
      </div>
      <div className={styles.statsKpiDelta}>
        <span
          className={`${styles.statsKpiDeltaPill} ${isPositive ? styles.up : styles.down}`}
        >
          {isPositive ? (
            <TrendUp size={11} weight="bold" />
          ) : (
            <TrendDown size={11} weight="bold" />
          )}
          {Math.abs(delta)}%
        </span>
        <span className={styles.statsKpiPeriod}>vs période précédente</span>
      </div>
    </div>
  );
}
