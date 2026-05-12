"use client";

import { checklistItems } from "@/lib/mock-data";

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

interface HomeClientProps {
  firstName: string;
  shop?: { slug: string; name: string } | null;
  kpis?: KPI[] | null;
  recentActivities?: ActivityItem[];
}

export default function HomeClient({ firstName, shop, kpis, recentActivities }: HomeClientProps) {
  const checklistDone = checklistItems.filter(i => i.done).length;
  const checklistTotal = checklistItems.length;
  const progressPercent = (checklistDone / checklistTotal) * 100;
  const dashOffset = 150.79 - (150.79 * progressPercent) / 100;

  const displayKpis = kpis ?? [];
  const displayActivities = recentActivities ?? [];

  const shopUrl = shop ? `https://${shop.slug}.getsellia.com` : null;

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
          <h1 className="dash-page-title">{firstName ? `Bonjour ${firstName} 👋` : "Bonjour 👋"}</h1>
          <p className="dash-page-subtitle">
            Voici l&apos;état de votre boutique aujourd&apos;hui.
          </p>

          {shop && shopUrl && (
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-shop-url"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>{shop.slug}.getsellia.com</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          )}
        </div>
        <div className="dash-page-actions">
          {shop && shopUrl && (
            <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="dash-btn dash-btn-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Voir ma boutique
            </a>
          )}
          <button className="dash-btn dash-btn-ember">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Ajouter un produit
          </button>
        </div>
      </div>

      <div className="dash-checklist-card dash-animate-fade-up dash-animate-delay-1">
        <div className="dash-checklist-header">
          <div className="dash-checklist-header-left">
            <div className="dash-checklist-eyebrow">
              <span className="dash-checklist-eyebrow-pulse"></span>
              <span>Configuration</span>
            </div>
            <h2 className="dash-checklist-title">Votre boutique en <em>5 étapes</em></h2>
            <p className="dash-checklist-subtitle">
              Complétez ces étapes pour ouvrir votre boutique au public et accepter vos premières commandes.
            </p>
          </div>
          <div className="dash-checklist-progress-circle">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(14,17,22,0.06)" strokeWidth="4"/>
              <circle
                cx="28" cy="28" r="24"
                fill="none" stroke="#E84B1F"
                strokeWidth="4"
                strokeDasharray="150.79"
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="dash-checklist-progress-text">{checklistDone}/{checklistTotal}</div>
          </div>
        </div>
        <div className="dash-checklist-items">
          {checklistItems.map((item, idx) => (
            <div key={item.id} className={`dash-checklist-item ${item.done ? "is-done" : ""}`}>
              <div className="dash-checklist-item-top">
                <div className="dash-checklist-icon">
                  {item.done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : String(idx + 1).padStart(2, "0")}
                </div>
                <div className="dash-checklist-item-label">{item.label}</div>
                {!item.done && (
                  <svg className="dash-checklist-item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
              </div>
              <div className="dash-checklist-item-desc">{item.description}</div>
            </div>
          ))}
        </div>
      </div>

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
            <div key={i} className={`dash-stat-card dash-animate-fade-up dash-animate-delay-${Math.min(i + 2, 4)}`}>
              <div className="dash-stat-header">
                <span className="dash-stat-label">{kpi.label}</span>
                <span className="dash-stat-period">{kpi.period}</span>
              </div>
              <div className="dash-stat-value">
                {kpi.value}
                {kpi.unit && <span className="dash-stat-unit">{kpi.unit}</span>}
              </div>
              <div className={`dash-stat-trend dash-stat-trend-${kpi.trendType}`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points={kpi.trendType === "up" ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
                </svg>
                {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
              </div>
              <svg className="dash-stat-chart" viewBox="0 0 200 40" preserveAspectRatio="none">
                <path d={paths[i % paths.length]} fill="none" stroke={sparkColor} strokeWidth="2"/>
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
              <svg viewBox="0 0 800 280" preserveAspectRatio="none" style={{width:"100%", height:"100%"}}>
                <defs>
                  <linearGradient id="chartGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E84B1F" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#E84B1F" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <line x1="0" y1="56" x2="800" y2="56" stroke="rgba(14,17,22,0.05)" strokeDasharray="3 3"/>
                <line x1="0" y1="112" x2="800" y2="112" stroke="rgba(14,17,22,0.05)" strokeDasharray="3 3"/>
                <line x1="0" y1="168" x2="800" y2="168" stroke="rgba(14,17,22,0.05)" strokeDasharray="3 3"/>
                <line x1="0" y1="224" x2="800" y2="224" stroke="rgba(14,17,22,0.05)" strokeDasharray="3 3"/>
                <path d="M 0 200 C 80 180, 120 160, 160 165 S 240 140, 280 130 S 360 110, 400 115 S 480 90, 520 75 S 600 55, 640 60 S 720 35, 800 25 L 800 280 L 0 280 Z" fill="url(#chartGrad1)"/>
                <path d="M 0 200 C 80 180, 120 160, 160 165 S 240 140, 280 130 S 360 110, 400 115 S 480 90, 520 75 S 600 55, 640 60 S 720 35, 800 25" fill="none" stroke="#E84B1F" strokeWidth="2.5"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="dash-card dash-animate-fade-up dash-animate-delay-4">
          <div className="dash-card-header">
            <div className="dash-card-title">Activité récente</div>
            <button className="dash-btn dash-btn-ghost dash-btn-sm">Tout voir</button>
          </div>
          <div className="dash-card-body" style={{padding: "0 20px"}}>
            <div className="dash-activity-list">
              {displayActivities.length === 0 && (
                <div style={{ padding: "32px 0", textAlign: "center", color: "#8A8D95", fontSize: 13 }}>
                  Aucune commande pour le moment.
                </div>
              )}
              {displayActivities.map(act => {
                const iconClass = act.type === "order" ? "success" : act.type === "pending" ? "info" : act.type === "new_customer" ? "ember" : "info";
                return (
                  <div key={act.id} className="dash-activity-item">
                    <div className={`dash-activity-icon dash-activity-icon-${iconClass}`}>
                      {act.type === "order" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                      {act.type === "pending" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                      {act.type === "new_customer" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
                      {act.type === "stock_alert" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>}
                    </div>
                    <div className="dash-activity-content">
                      <div className="dash-activity-text" dangerouslySetInnerHTML={{__html: act.text}}></div>
                      <div className="dash-activity-meta">{act.meta}</div>
                    </div>
                    {act.amount != null && (
                      <div className={`dash-activity-amount ${act.amountType === "positive" ? "is-positive" : ""}`}>
                        {act.amountType === "positive" ? "+" : ""}{act.amount.toLocaleString("fr-FR")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
