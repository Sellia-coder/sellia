"use client";

import { useState } from "react";
import { customersList, Customer } from "@/lib/mock-data";

const STATUS_BADGES: Record<string, { label: string; class: string }> = {
  vip: { label: "VIP", class: "warning" },
  regular: { label: "Régulier", class: "info" },
  new: { label: "Nouveau", class: "success" },
  inactive: { label: "Inactif", class: "neutral" },
};

export default function CustomersPage() {
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = filter === "all" ? customersList : customersList.filter(c => c.status === filter);

  const stats = {
    total: customersList.length,
    vip: customersList.filter(c => c.status === "vip").length,
    new: customersList.filter(c => c.status === "new").length,
    avg: Math.round(customersList.reduce((sum, c) => sum + c.totalSpent, 0) / customersList.length),
  };

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— CRM</div>
          <h1 className="dash-page-title">Clients</h1>
          <p className="dash-page-subtitle">Connaissez votre communauté. Identifiez vos meilleurs clients et fidélisez-les.</p>
        </div>
        <div className="dash-page-actions">
          <button className="dash-btn dash-btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Exporter
          </button>
          <button className="dash-btn dash-btn-ember">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M19 8v6M22 11h-6"/></svg>
            Inviter un client
          </button>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Total clients</span></div>
          <div className="dash-stat-value">{stats.total}</div>
          <div className="dash-stat-trend dash-stat-trend-up">+12 ce mois</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Clients VIP</span></div>
          <div className="dash-stat-value" style={{color:"rgb(180, 83, 9)"}}>{stats.vip}</div>
          <div className="dash-stat-trend" style={{background:"var(--dash-warning-bg)",color:"rgb(180, 83, 9)"}}>★ Top revenus</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Nouveaux ce mois</span></div>
          <div className="dash-stat-value" style={{color:"var(--dash-success)"}}>{stats.new}</div>
          <div className="dash-stat-trend dash-stat-trend-up">+34% vs mois dernier</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Panier moyen</span></div>
          <div className="dash-stat-value">{(stats.avg / 1000).toFixed(0)}K<span className="dash-stat-unit">FCFA</span></div>
          <div className="dash-stat-trend dash-stat-trend-up">+5% vs précédent</div>
        </div>
      </div>

      <div className="dash-table-container dash-animate-fade-up dash-animate-delay-2">
        <div className="dash-table-header">
          <div className="dash-table-filters">
            <button className={`dash-filter-pill ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Tous <span className="dash-filter-count">{stats.total}</span></button>
            <button className={`dash-filter-pill ${filter === "vip" ? "active" : ""}`} onClick={() => setFilter("vip")}>VIP <span className="dash-filter-count">{stats.vip}</span></button>
            <button className={`dash-filter-pill ${filter === "regular" ? "active" : ""}`} onClick={() => setFilter("regular")}>Réguliers</button>
            <button className={`dash-filter-pill ${filter === "new" ? "active" : ""}`} onClick={() => setFilter("new")}>Nouveaux <span className="dash-filter-count">{stats.new}</span></button>
            <button className={`dash-filter-pill ${filter === "inactive" ? "active" : ""}`} onClick={() => setFilter("inactive")}>Inactifs</button>
          </div>
        </div>

        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Localisation</th>
                <th>Commandes</th>
                <th>CA total</th>
                <th>Dernière commande</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const badge = STATUS_BADGES[c.status];
                return (
                  <tr key={c.id} onClick={() => setSelected(c)} style={{cursor:"pointer"}}>
                    <td>
                      <div className="dash-cell-customer">
                        <div className="dash-cell-customer-avatar" style={{background: c.gradient}}>{c.initial}</div>
                        <div>
                          <div style={{fontWeight:600, fontSize:"13px"}}>{c.name}</div>
                          <div className="dash-cell-product-sku">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="dash-cell-mono">{c.city}</span></td>
                    <td><span className="dash-cell-mono" style={{color:"var(--dash-text-primary)",fontWeight:500}}>{c.totalOrders}</span></td>
                    <td><span className="dash-cell-price">{c.totalSpent.toLocaleString("fr-FR")} FCFA</span></td>
                    <td><span className="dash-cell-mono">{c.lastOrder}</span></td>
                    <td><span className={`dash-badge dash-badge-${badge.class}`}><span className="dash-badge-dot"></span>{badge.label}</span></td>
                    <td>
                      <button className="dash-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER PROFIL */}
      {selected && (
        <>
          <div className="dash-drawer-overlay" onClick={() => setSelected(null)}></div>
          <div className="dash-drawer">
            <div className="dash-drawer-header">
              <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
                <div className="dash-cell-customer-avatar" style={{background: selected.gradient, width:"48px", height:"48px", fontSize:"18px"}}>{selected.initial}</div>
                <div>
                  <h2 className="dash-drawer-title" style={{fontSize:"20px"}}>{selected.name}</h2>
                  <div className="dash-cell-mono" style={{fontSize:"11px"}}>Membre depuis {selected.joinedAt}</div>
                </div>
              </div>
              <button className="dash-drawer-close" onClick={() => setSelected(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="dash-drawer-body">
              <div className="dash-customer-stats">
                <div className="dash-customer-stat">
                  <div className="dash-customer-stat-label">Commandes</div>
                  <div className="dash-customer-stat-value">{selected.totalOrders}</div>
                </div>
                <div className="dash-customer-stat">
                  <div className="dash-customer-stat-label">CA total</div>
                  <div className="dash-customer-stat-value">{(selected.totalSpent / 1000).toFixed(0)}K</div>
                </div>
                <div className="dash-customer-stat">
                  <div className="dash-customer-stat-label">Panier moyen</div>
                  <div className="dash-customer-stat-value">{selected.totalOrders > 0 ? Math.round(selected.totalSpent / selected.totalOrders / 1000) : 0}K</div>
                </div>
              </div>

              <div className="dash-drawer-section">
                <div className="dash-drawer-section-title">Coordonnées</div>
                <div className="dash-customer-info">
                  <div className="dash-customer-info-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>{selected.email}</span>
                  </div>
                  <div className="dash-customer-info-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                    <span>{selected.phone}</span>
                  </div>
                  <div className="dash-customer-info-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{selected.city}</span>
                  </div>
                </div>
              </div>

              <div className="dash-drawer-section">
                <div className="dash-drawer-section-title">Actions</div>
                <button className="dash-btn dash-btn-ember" style={{width:"100%", marginBottom:"8px"}}>Envoyer un message</button>
                <button className="dash-btn dash-btn-secondary" style={{width:"100%"}}>Voir l&apos;historique des commandes</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
