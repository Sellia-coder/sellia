"use client";

import { useState } from "react";
import { statsKPIs, topProducts, topCustomers, paymentMethods, topCities, additionalStats } from "@/lib/mock-data";

export default function DashboardStatsPage() {
  const [period, setPeriod] = useState("30J");

  const kpiIcons = ["revenue", "orders", "avg", "conversion"];
  const kpiSparkColors = ["#22c55e", "#3b82f6", "#E84B1F", "rgb(126, 34, 206)"];
  const kpiSparkPaths = [
    "M 0 18 L 8 16 L 16 14 L 24 12 L 32 10 L 40 8 L 48 7 L 60 4",
    "M 0 16 L 8 18 L 16 14 L 24 16 L 32 12 L 40 10 L 48 8 L 60 6",
    "M 0 14 L 8 12 L 16 13 L 24 11 L 32 12 L 40 10 L 48 9 L 60 8",
    "M 0 8 L 8 10 L 16 9 L 24 12 L 32 11 L 40 14 L 48 13 L 60 16",
  ];
  const kpiCompares = ["VS 6 612 000", "VS 158", "VS 41 800", "VS 3.24%"];

  // Donut calculations
  const circumference = 2 * Math.PI * 70;
  let donutOffset = 0;
  const donutSegments = paymentMethods.map(method => {
    const length = (method.percentage / 100) * circumference;
    const segment = { ...method, length, offset: donutOffset };
    donutOffset -= length;
    return segment;
  });

  // Heatmap data
  const heatmapData = [
    [0,0,0,0,0,0,0,1,1,2,2,3,3,4,4,3,3,2,2,3,4,3,1,0],
    [0,0,0,0,0,0,1,1,2,2,3,3,4,4,4,3,3,3,3,4,4,3,2,1],
    [0,0,0,0,0,0,0,1,2,3,3,4,4,3,3,3,4,4,4,4,4,3,2,0],
    [0,0,0,0,0,1,1,2,2,3,3,4,4,4,3,3,3,4,4,4,4,3,2,1],
    [0,0,0,0,0,1,1,2,3,3,4,4,4,4,4,4,4,4,4,4,4,3,3,2],
    [1,0,0,0,0,0,1,2,3,4,4,4,4,4,4,4,4,3,3,4,4,4,3,2],
    [1,0,0,0,0,0,0,1,2,3,3,3,3,4,3,3,3,3,3,3,3,2,1,0],
  ];
  const days = ["LUN","MAR","MER","JEU","VEN","SAM","DIM"];

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Analytics</div>
          <h1 className="dash-page-title">Statistiques</h1>
          <p className="dash-page-subtitle">
            Performances détaillées de votre boutique. Suivez vos ventes, vos clients et identifiez les tendances.
          </p>
        </div>
        <div className="dash-page-actions">
          <button className="dash-btn dash-btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exporter PDF
          </button>
        </div>
      </div>

      <div className="dash-period-bar">
        <div className="dash-period-selector">
          {["AUJOURD'HUI","7J","30J","3M","1A","PERSONNALISÉ"].map(p => (
            <button
              key={p}
              className={`dash-period-btn ${period === p ? "active" : ""}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="dash-compare-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
          Comparer à la période précédente
        </div>
      </div>

      <div className="dash-kpi-grid">
        {statsKPIs.map((kpi, i) => (
          <div key={i} className={`dash-kpi-card dash-animate-fade-up dash-animate-delay-${Math.min(i + 1, 4)}`}>
            <div className={`dash-kpi-icon dash-kpi-icon-${kpiIcons[i]}`}>
              {i === 0 && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
              {i === 1 && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>}
              {i === 2 && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>}
              {i === 3 && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
            </div>
            <div className="dash-kpi-label">{kpi.label}</div>
            <div className="dash-kpi-value">
              {kpi.value}
              {kpi.unit && <span className="dash-kpi-unit">{kpi.unit}</span>}
            </div>
            <div className={`dash-stat-trend dash-stat-trend-${kpi.trendType}`} style={{fontSize:"11px"}}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points={kpi.trendType === "up" ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
              </svg>
              {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
            </div>
            <div className="dash-kpi-bottom">
              <div className="dash-kpi-compare">{kpiCompares[i]}</div>
              <svg className="dash-kpi-spark" viewBox="0 0 60 24" preserveAspectRatio="none">
                <path d={kpiSparkPaths[i]} fill="none" stroke={kpiSparkColors[i]} strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-card dash-animate-fade-up dash-animate-delay-3" style={{marginBottom:"16px"}}>
        <div className="dash-chart-toolbar">
          <div>
            <div className="dash-card-title">Évolution du chiffre d&apos;affaires</div>
            <div className="dash-card-subtitle">DU 4 AVRIL AU 3 MAI 2026 · 30 JOURS</div>
          </div>
          <div className="dash-chart-tabs">
            <span className="dash-chart-tab active">CA</span>
            <span className="dash-chart-tab">Commandes</span>
            <span className="dash-chart-tab">Visiteurs</span>
            <span className="dash-chart-tab">Conversion</span>
          </div>
        </div>
        <div className="dash-chart-summary">
          <div className="dash-chart-summary-item">
            <span className="dash-chart-summary-label">Total période</span>
            <span className="dash-chart-summary-value">8 247 500 FCFA</span>
          </div>
          <div className="dash-chart-summary-item">
            <span className="dash-chart-summary-label">Moyenne quotidienne</span>
            <span className="dash-chart-summary-value">274 916 FCFA</span>
          </div>
          <div className="dash-chart-summary-item">
            <span className="dash-chart-summary-label">Meilleur jour</span>
            <span className="dash-chart-summary-value">412 800 FCFA</span>
          </div>
        </div>
        <div className="dash-card-body" style={{paddingTop:0}}>
          <div className="dash-chart-area" style={{height:"320px"}}>
            <svg viewBox="0 0 800 320" preserveAspectRatio="none" style={{width:"100%", height:"100%"}}>
              <defs>
                <linearGradient id="chartGradStats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E84B1F" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#E84B1F" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="64" x2="800" y2="64" stroke="rgba(14,17,22,0.05)" strokeDasharray="3 3"/>
              <line x1="0" y1="128" x2="800" y2="128" stroke="rgba(14,17,22,0.05)" strokeDasharray="3 3"/>
              <line x1="0" y1="192" x2="800" y2="192" stroke="rgba(14,17,22,0.05)" strokeDasharray="3 3"/>
              <line x1="0" y1="256" x2="800" y2="256" stroke="rgba(14,17,22,0.05)" strokeDasharray="3 3"/>
              <text x="10" y="68" fill="rgba(14,17,22,0.4)" fontFamily="JetBrains Mono" fontSize="9">500K</text>
              <text x="10" y="132" fill="rgba(14,17,22,0.4)" fontFamily="JetBrains Mono" fontSize="9">375K</text>
              <text x="10" y="196" fill="rgba(14,17,22,0.4)" fontFamily="JetBrains Mono" fontSize="9">250K</text>
              <text x="10" y="260" fill="rgba(14,17,22,0.4)" fontFamily="JetBrains Mono" fontSize="9">125K</text>
              <path d="M 50 240 C 100 230, 150 220, 200 215 S 300 200, 350 195 S 450 180, 500 170 S 600 160, 650 155 S 750 145, 790 140" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5"/>
              <path d="M 50 230 C 100 215, 150 195, 200 200 S 300 175, 350 160 S 450 130, 500 110 S 600 80, 650 90 S 750 50, 790 30 L 790 320 L 50 320 Z" fill="url(#chartGradStats)"/>
              <path d="M 50 230 C 100 215, 150 195, 200 200 S 300 175, 350 160 S 450 130, 500 110 S 600 80, 650 90 S 750 50, 790 30" fill="none" stroke="#E84B1F" strokeWidth="2.5"/>
              <circle cx="650" cy="90" r="6" fill="#E84B1F"/>
              <circle cx="650" cy="90" r="14" fill="#E84B1F" opacity="0.15"/>
              <rect x="585" y="20" width="135" height="50" rx="8" fill="#0E1116"/>
              <text x="652" y="38" fill="rgba(250,250,247,0.6)" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" letterSpacing="0.8">28 AVRIL 2026</text>
              <text x="652" y="56" fill="#FAFAF7" fontFamily="Fraunces" fontSize="14" textAnchor="middle" fontWeight="500">340 200 FCFA</text>
            </svg>
          </div>
        </div>
      </div>

      <div className="dash-split-grid">
        {/* Top produits */}
        <div className="dash-card dash-animate-fade-up dash-animate-delay-3">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Top produits</div>
              <div className="dash-card-subtitle">PAR CHIFFRE D&apos;AFFAIRES · 30J</div>
            </div>
            <button className="dash-btn dash-btn-ghost dash-btn-sm">Tout voir</button>
          </div>
          <div className="dash-top-list">
            {topProducts.map(p => (
              <div key={p.rank} className="dash-top-item">
                <div className={`dash-top-rank ${p.rank <= 3 ? `is-${p.rank}` : ""}`}>{p.rank}</div>
                <div className="dash-top-thumb" style={{background: p.gradient}}></div>
                <div className="dash-top-info">
                  <div className="dash-top-name">{p.name}</div>
                  <div className="dash-top-meta">{p.sales} ventes · {p.price.toLocaleString("fr-FR")} FCFA</div>
                </div>
                <div>
                  <div className="dash-top-amount">{p.total.toLocaleString("fr-FR")}</div>
                  <div className="dash-top-bar-wrap"><div className="dash-top-bar-fill" style={{width: `${p.barWidth}%`}}></div></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top clients */}
        <div className="dash-card dash-animate-fade-up dash-animate-delay-4">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Top clients</div>
              <div className="dash-card-subtitle">CA CUMULÉ · 30J</div>
            </div>
            <button className="dash-btn dash-btn-ghost dash-btn-sm">Tout voir</button>
          </div>
          <div className="dash-top-list">
            {topCustomers.map(c => (
              <div key={c.rank} className="dash-top-item">
                <div className={`dash-top-rank ${c.rank <= 3 ? `is-${c.rank}` : ""}`}>{c.rank}</div>
                <div className="dash-top-customer-avatar" style={{background: c.gradient}}>{c.initial}</div>
                <div className="dash-top-info">
                  <div className="dash-top-name">{c.name}</div>
                  <div className="dash-top-meta">{c.city} · {c.orders} commandes</div>
                </div>
                <div className="dash-top-amount">{c.total.toLocaleString("fr-FR")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-split-grid-3">
        {/* Donut */}
        <div className="dash-card dash-animate-fade-up dash-animate-delay-4">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Méthodes de paiement</div>
              <div className="dash-card-subtitle">RÉPARTITION DU CA · 30J</div>
            </div>
          </div>
          <div className="dash-donut-card">
            <div className="dash-donut-center">
              <svg className="dash-donut-svg" width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(14,17,22,0.04)" strokeWidth="22"/>
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="90" cy="90" r="70"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="22"
                    strokeDasharray={`${seg.length} ${circumference}`}
                    strokeDashoffset={seg.offset}
                  />
                ))}
              </svg>
              <div className="dash-donut-label">
                <div className="dash-donut-total">8.2M</div>
                <div className="dash-donut-total-label">FCFA total</div>
              </div>
            </div>
            <div className="dash-donut-legend">
              {paymentMethods.map(m => (
                <div key={m.name} className="dash-donut-legend-item">
                  <span className="dash-donut-legend-dot" style={{background: m.color}}></span>
                  <span className="dash-donut-legend-name">{m.name}</span>
                  <span className="dash-donut-legend-value">{m.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geo */}
        <div className="dash-card dash-animate-fade-up dash-animate-delay-4">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Top villes</div>
              <div className="dash-card-subtitle">CA PAR LOCALISATION</div>
            </div>
          </div>
          <div className="dash-card-body">
            {topCities.map(c => (
              <div key={c.city} className="dash-geo-item">
                <div className="dash-geo-flag" style={{background: c.flag}}></div>
                <div className="dash-geo-info">
                  <div className="dash-geo-city">{c.city}</div>
                  <div className="dash-geo-bar"><div className="dash-geo-bar-fill" style={{width: `${c.barWidth}%`}}></div></div>
                </div>
                <div className="dash-geo-stats">
                  <div className="dash-geo-amount">{c.amount}</div>
                  <div className="dash-geo-percent">{c.percent}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats annexes */}
        <div className="dash-card dash-animate-fade-up dash-animate-delay-4">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Indicateurs</div>
              <div className="dash-card-subtitle">PERFORMANCES CLÉS · 30J</div>
            </div>
          </div>
          <div className="dash-card-body" style={{padding:"0 20px"}}>
            {additionalStats.map((s, i) => (
              <div key={i} className="dash-additional-stat">
                <div className="dash-additional-label">{s.label}</div>
                <div
                  className="dash-additional-value"
                  style={(s as { warning?: boolean }).warning ? { color: "rgb(180, 83, 9)" } : undefined}
                >
                  {s.value}
                  {s.unit && <span className="dash-additional-unit">{s.unit}</span>}
                </div>
                <div className="dash-additional-change">{s.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HEATMAP */}
      <div className="dash-card dash-animate-fade-up dash-animate-delay-4" style={{marginTop:"16px"}}>
        <div className="dash-card-header">
          <div>
            <div className="dash-card-title">Activité par heure</div>
            <div className="dash-card-subtitle">QUAND VOS CLIENTS COMMANDENT LE PLUS</div>
          </div>
          <div className="dash-heatmap-legend">
            <span>MOINS</span>
            <div className="dash-heatmap-legend-cells">
              <div className="dash-heatmap-cell"></div>
              <div className="dash-heatmap-cell l1"></div>
              <div className="dash-heatmap-cell l2"></div>
              <div className="dash-heatmap-cell l3"></div>
              <div className="dash-heatmap-cell l4"></div>
            </div>
            <span>PLUS</span>
          </div>
        </div>
        <div className="dash-heatmap-wrapper">
          <div className="dash-heatmap">
            {heatmapData.map((row, i) => (
              <div key={i} className="dash-heatmap-row">
                <div className="dash-heatmap-day-label">{days[i]}</div>
                {row.map((level, j) => (
                  <div key={j} className={`dash-heatmap-cell ${level > 0 ? `l${level}` : ""}`}></div>
                ))}
              </div>
            ))}
          </div>
          <div className="dash-heatmap-hours">
            <span>00H</span><span>03H</span><span>06H</span><span>09H</span><span>12H</span><span>15H</span><span>18H</span><span>21H</span>
          </div>
        </div>
      </div>
    </>
  );
}
