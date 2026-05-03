"use client";

import { useState } from "react";

type Tab = "transactions" | "methods" | "invoices" | "payouts" | "config";

const transactions = [
  { id: "tx_001", date: "Aujourd'hui · 14:32", customer: "Fatou Diop", amount: 34500, method: "MTN MoMo", status: "success", reference: "MM-2604-XX-9876" },
  { id: "tx_002", date: "Aujourd'hui · 13:14", customer: "Awa Konaté", amount: 12000, method: "Wave", status: "pending", reference: "WV-9912-PD-4421" },
  { id: "tx_003", date: "Aujourd'hui · 11:48", customer: "Marie-Claire N.", amount: 28900, method: "Orange Money", status: "success", reference: "OM-7341-XX-1199" },
  { id: "tx_004", date: "Hier · 18:22", customer: "Ibrahim N.", amount: 45000, method: "Carte bancaire", status: "success", reference: "CB-VISA-XX-4242" },
  { id: "tx_005", date: "Hier · 09:15", customer: "Sokhna B.", amount: 56500, method: "MTN MoMo", status: "success", reference: "MM-2603-XX-3344" },
  { id: "tx_006", date: "Il y a 2 jours", customer: "Aminata F.", amount: 8500, method: "Orange Money", status: "refunded", reference: "OM-7340-RF-1199" },
];

const payoutMethods = [
  { name: "MTN MoMo", logo: "MTN", color: "#FFCB05", connected: true, account: "+237 6XX XX 99 12", balance: 1247500 },
  { name: "Orange Money", logo: "OM", color: "#FF7900", connected: true, account: "+221 7X XXX 45 67", balance: 0 },
  { name: "Wave", logo: "W", color: "#1DC8FF", connected: false, account: "", balance: 0 },
  { name: "Cartes bancaires (Stripe)", logo: "CB", color: "#635BFF", connected: true, account: "Compte Pro · ••4242", balance: 0 },
];

export default function PaymentsPage() {
  const [tab, setTab] = useState<Tab>("transactions");

  const totalToday = transactions.filter(t => t.date.includes("Aujourd'hui") && t.status === "success").reduce((s, t) => s + t.amount, 0);
  const totalMonth = 8247500;
  const pending = transactions.filter(t => t.status === "pending").length;

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Finances</div>
          <h1 className="dash-page-title">Paiements</h1>
          <p className="dash-page-subtitle">Suivez vos transactions, gérez vos méthodes de paiement et configurez vos virements.</p>
        </div>
        <div className="dash-page-actions">
          <button className="dash-btn dash-btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Exporter
          </button>
          <button className="dash-btn dash-btn-ember">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Demander un virement
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Encaissé aujourd&apos;hui</span></div>
          <div className="dash-stat-value">{(totalToday / 1000).toFixed(0)}K<span className="dash-stat-unit">FCFA</span></div>
          <div className="dash-stat-trend dash-stat-trend-up">+12% vs hier</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Encaissé ce mois</span></div>
          <div className="dash-stat-value">{(totalMonth / 1000000).toFixed(2)}M<span className="dash-stat-unit">FCFA</span></div>
          <div className="dash-stat-trend dash-stat-trend-up">+24.8% vs mois dernier</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Solde disponible</span></div>
          <div className="dash-stat-value" style={{color:"var(--dash-success)"}}>1.24M<span className="dash-stat-unit">FCFA</span></div>
          <div className="dash-stat-trend dash-stat-trend-neutral">Prêt à virer</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">En attente</span></div>
          <div className="dash-stat-value" style={{color:"rgb(180, 83, 9)"}}>{pending}</div>
          <div className="dash-stat-trend" style={{background:"var(--dash-warning-bg)",color:"rgb(180, 83, 9)"}}>⏱ Confirmation</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs-bar dash-animate-fade-up dash-animate-delay-2">
        <button className={`dash-tab ${tab === "transactions" ? "active" : ""}`} onClick={() => setTab("transactions")}>
          Transactions
        </button>
        <button className={`dash-tab ${tab === "methods" ? "active" : ""}`} onClick={() => setTab("methods")}>
          Méthodes de paiement
        </button>
        <button className={`dash-tab ${tab === "invoices" ? "active" : ""}`} onClick={() => setTab("invoices")}>
          Factures
        </button>
        <button className={`dash-tab ${tab === "payouts" ? "active" : ""}`} onClick={() => setTab("payouts")}>
          Virements
        </button>
        <button className={`dash-tab ${tab === "config" ? "active" : ""}`} onClick={() => setTab("config")}>
          Configuration
        </button>
      </div>

      {/* TAB CONTENT */}
      {tab === "transactions" && (
        <div className="dash-table-container dash-animate-fade-up">
          <div className="dash-table-header">
            <div className="dash-table-filters">
              <button className="dash-filter-pill active">Toutes <span className="dash-filter-count">{transactions.length}</span></button>
              <button className="dash-filter-pill">Réussies</button>
              <button className="dash-filter-pill">En attente</button>
              <button className="dash-filter-pill">Remboursées</button>
            </div>
          </div>
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Méthode</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => {
                  const statusMap: Record<string, { label: string; class: string }> = {
                    success: { label: "Réussie", class: "success" },
                    pending: { label: "En attente", class: "warning" },
                    refunded: { label: "Remboursée", class: "neutral" },
                  };
                  const badgeMeta = statusMap[t.status];
                  return (
                    <tr key={t.id}>
                      <td><span className="dash-cell-mono" style={{color:"var(--dash-text-primary)",fontWeight:600}}>{t.reference}</span></td>
                      <td><span className="dash-cell-mono">{t.date}</span></td>
                      <td>{t.customer}</td>
                      <td><span className="dash-cell-mono">{t.method}</span></td>
                      <td><span className="dash-cell-price">{t.amount.toLocaleString("fr-FR")} FCFA</span></td>
                      <td><span className={`dash-badge dash-badge-${badgeMeta.class}`}><span className="dash-badge-dot"></span>{badgeMeta.label}</span></td>
                      <td><button className="dash-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "methods" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Méthodes acceptées sur votre boutique</h3>
                <p className="dash-settings-card-desc">Activez les méthodes de paiement disponibles pour vos clients.</p>
              </div>
            </div>
            {payoutMethods.map(m => (
              <div key={m.name} className="dash-payment-method-row">
                <div className="dash-payment-method-logo" style={{background: m.color}}>{m.logo}</div>
                <div className="dash-payment-method-info">
                  <div className="dash-payment-method-name">{m.name}</div>
                  <div className="dash-payment-method-desc">
                    {m.connected ? `Connecté · ${m.account}` : "Non configuré"}
                  </div>
                </div>
                <div className="dash-payment-method-actions">
                  {m.connected && (
                    <span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Actif</span>
                  )}
                  <button className={m.connected ? "dash-btn dash-btn-secondary dash-btn-sm" : "dash-btn dash-btn-ember dash-btn-sm"}>
                    {m.connected ? "Configurer" : "Connecter"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "invoices" && (
        <div className="dash-table-container dash-animate-fade-up">
          <div className="dash-table-header">
            <div className="dash-table-filters">
              <button className="dash-filter-pill active">Toutes</button>
              <button className="dash-filter-pill">Payées</button>
              <button className="dash-filter-pill">En attente</button>
            </div>
            <button className="dash-btn dash-btn-ember dash-btn-sm">Créer une facture</button>
          </div>
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>N° facture</th>
                  <th>Client</th>
                  <th>Émise le</th>
                  <th>Échéance</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="dash-cell-mono" style={{fontWeight:600}}>INV-2026-001</span></td>
                  <td>Fatou Diop</td>
                  <td><span className="dash-cell-mono">02 mai 2026</span></td>
                  <td><span className="dash-cell-mono">02 mai 2026</span></td>
                  <td><span className="dash-cell-price">34 500 FCFA</span></td>
                  <td><span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Payée</span></td>
                  <td><button className="dash-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></button></td>
                </tr>
                <tr>
                  <td><span className="dash-cell-mono" style={{fontWeight:600}}>INV-2026-002</span></td>
                  <td>Awa Konaté</td>
                  <td><span className="dash-cell-mono">02 mai 2026</span></td>
                  <td><span className="dash-cell-mono">09 mai 2026</span></td>
                  <td><span className="dash-cell-price">12 000 FCFA</span></td>
                  <td><span className="dash-badge dash-badge-warning"><span className="dash-badge-dot"></span>En attente</span></td>
                  <td><button className="dash-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "payouts" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card" style={{background:"linear-gradient(135deg, var(--dash-bg-active), rgba(232, 75, 31, 0.02))", borderColor:"rgba(232, 75, 31, 0.2)"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px"}}>
              <div>
                <div className="dash-settings-card-eyebrow">Solde disponible</div>
                <div style={{fontFamily:"'Fraunces', serif", fontSize:"40px", fontWeight:400, letterSpacing:"-1.4px", lineHeight:1}}>1 247 500 <span style={{fontFamily:"Inter", fontSize:"18px", color:"var(--dash-text-tertiary)"}}>FCFA</span></div>
                <div style={{fontSize:"13px", color:"var(--dash-text-secondary)", marginTop:"6px"}}>Disponible pour un virement vers vos comptes connectés.</div>
              </div>
              <button className="dash-btn dash-btn-ember dash-btn-lg">Virer maintenant</button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Cadence des virements automatiques</h3>
                <p className="dash-settings-card-desc">Choisissez la fréquence à laquelle Sellia transfère votre solde.</p>
              </div>
            </div>
            <div className="dash-payout-cadence-grid">
              <button className="dash-payout-cadence active">
                <div className="dash-payout-cadence-name">Hebdomadaire</div>
                <div className="dash-payout-cadence-desc">Tous les vendredis</div>
              </button>
              <button className="dash-payout-cadence">
                <div className="dash-payout-cadence-name">Bi-mensuel</div>
                <div className="dash-payout-cadence-desc">Le 1er et le 15</div>
              </button>
              <button className="dash-payout-cadence">
                <div className="dash-payout-cadence-name">Mensuel</div>
                <div className="dash-payout-cadence-desc">Le 1er de chaque mois</div>
              </button>
              <button className="dash-payout-cadence">
                <div className="dash-payout-cadence-name">Manuel</div>
                <div className="dash-payout-cadence-desc">À votre demande</div>
              </button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Historique des virements</h3>
              </div>
            </div>
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr><th>Date</th><th>Montant</th><th>Vers</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="dash-cell-mono">26 avril 2026</span></td>
                    <td><span className="dash-cell-price">2 450 000 FCFA</span></td>
                    <td><span className="dash-cell-mono">MTN MoMo · +237 6XX XX 99 12</span></td>
                    <td><span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Effectué</span></td>
                  </tr>
                  <tr>
                    <td><span className="dash-cell-mono">19 avril 2026</span></td>
                    <td><span className="dash-cell-price">1 875 000 FCFA</span></td>
                    <td><span className="dash-cell-mono">MTN MoMo · +237 6XX XX 99 12</span></td>
                    <td><span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Effectué</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "config" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Devise et fiscalité</h3>
                <p className="dash-settings-card-desc">Configuration globale appliquée à toutes vos transactions.</p>
              </div>
            </div>
            <div className="dash-form-row-split">
              <div className="dash-form-row">
                <label className="dash-form-label">Devise principale</label>
                <select className="dash-form-select" defaultValue="XOF">
                  <option value="XOF">FCFA (XOF) — Afrique de l&apos;Ouest</option>
                  <option value="XAF">FCFA (XAF) — Afrique Centrale</option>
                  <option value="USD">Dollar US (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div className="dash-form-row">
                <label className="dash-form-label">Format des prix</label>
                <select className="dash-form-select" defaultValue="thousands">
                  <option value="thousands">28 500 FCFA (espaces)</option>
                  <option value="comma">28,500 FCFA (virgules)</option>
                  <option value="dot">28.500 FCFA (points)</option>
                </select>
              </div>
            </div>
            <div className="dash-form-row">
              <label className="dash-form-label">TVA / Taxes (%)</label>
              <div className="dash-form-input-group" style={{maxWidth:"200px"}}>
                <input type="number" className="dash-form-input" defaultValue="0" />
                <span className="dash-form-input-suffix">%</span>
              </div>
              <p className="dash-form-help">0 si vous n&apos;êtes pas assujetti à la TVA.</p>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Mentions sur les factures</h3>
                <p className="dash-settings-card-desc">Informations légales affichées en pied de toutes vos factures.</p>
              </div>
            </div>
            <div className="dash-form-row">
              <label className="dash-form-label">Raison sociale</label>
              <input type="text" className="dash-form-input" defaultValue="Maison Aïda SARL" />
            </div>
            <div className="dash-form-row-split">
              <div className="dash-form-row">
                <label className="dash-form-label">Numéro de registre</label>
                <input type="text" className="dash-form-input" placeholder="RCS Dakar 2025-B-1234" />
              </div>
              <div className="dash-form-row">
                <label className="dash-form-label">Numéro fiscal</label>
                <input type="text" className="dash-form-input" placeholder="NINEA 12345678" />
              </div>
            </div>
            <div className="dash-form-row">
              <label className="dash-form-label">Adresse de facturation</label>
              <textarea className="dash-form-textarea" rows={2} placeholder="Avenue Pompidou, Dakar, Sénégal" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
