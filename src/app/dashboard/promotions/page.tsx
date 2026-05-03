"use client";

import { useState } from "react";

type Tab = "codes" | "auto" | "campaigns" | "giftcards" | "loyalty";

const promoCodes = [
  { code: "BIENVENUE10", type: "percent", value: 10, used: 47, limit: 100, expires: "31 mai 2026", status: "active", description: "10% pour les nouveaux clients" },
  { code: "FETEMERES", type: "percent", value: 20, used: 23, limit: 50, expires: "10 mai 2026", status: "active", description: "Fête des mères 2026" },
  { code: "VIP500", type: "fixed", value: 5000, used: 8, limit: 0, expires: "—", status: "active", description: "Réduction VIP fidèles" },
  { code: "RAMADAN24", type: "percent", value: 15, used: 156, limit: 200, expires: "08 avril 2026", status: "expired", description: "Ramadan 2026" },
];

export default function PromotionsPage() {
  const [tab, setTab] = useState<Tab>("codes");

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Marketing</div>
          <h1 className="dash-page-title">Promotions</h1>
          <p className="dash-page-subtitle">Boostez vos ventes avec des codes promo, des campagnes flash et un programme de fidélité.</p>
        </div>
        <div className="dash-page-actions">
          <button className="dash-btn dash-btn-ember">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Nouvelle promotion
          </button>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Codes actifs</span></div>
          <div className="dash-stat-value">3</div>
          <div className="dash-stat-trend dash-stat-trend-neutral">En cours</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Utilisations 30J</span></div>
          <div className="dash-stat-value" style={{color:"var(--dash-success)"}}>234</div>
          <div className="dash-stat-trend dash-stat-trend-up">+45% vs précédent</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">CA généré</span></div>
          <div className="dash-stat-value">847K<span className="dash-stat-unit">FCFA</span></div>
          <div className="dash-stat-trend dash-stat-trend-up">+18%</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Taux d&apos;utilisation</span></div>
          <div className="dash-stat-value">23<span className="dash-stat-unit">%</span></div>
          <div className="dash-stat-trend dash-stat-trend-up">vs 18% mois dernier</div>
        </div>
      </div>

      <div className="dash-tabs-bar dash-animate-fade-up dash-animate-delay-2">
        <button className={`dash-tab ${tab === "codes" ? "active" : ""}`} onClick={() => setTab("codes")}>
          Codes promo
        </button>
        <button className={`dash-tab ${tab === "auto" ? "active" : ""}`} onClick={() => setTab("auto")}>
          Réductions auto
        </button>
        <button className={`dash-tab ${tab === "campaigns" ? "active" : ""}`} onClick={() => setTab("campaigns")}>
          Campagnes flash
        </button>
        <button className={`dash-tab ${tab === "giftcards" ? "active" : ""}`} onClick={() => setTab("giftcards")}>
          Cartes cadeaux
        </button>
        <button className={`dash-tab ${tab === "loyalty" ? "active" : ""}`} onClick={() => setTab("loyalty")}>
          Programme fidélité
        </button>
      </div>

      {tab === "codes" && (
        <div className="dash-table-container dash-animate-fade-up">
          <div className="dash-table-header">
            <div className="dash-table-filters">
              <button className="dash-filter-pill active">Tous <span className="dash-filter-count">{promoCodes.length}</span></button>
              <button className="dash-filter-pill">Actifs</button>
              <button className="dash-filter-pill">Expirés</button>
              <button className="dash-filter-pill">Désactivés</button>
            </div>
            <button className="dash-btn dash-btn-ember dash-btn-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              Créer un code
            </button>
          </div>
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Réduction</th>
                  <th>Utilisations</th>
                  <th>Expire le</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map(c => (
                  <tr key={c.code}>
                    <td><span className="dash-cell-mono" style={{color:"var(--dash-text-primary)",fontWeight:700, fontSize:"12.5px", background:"var(--dash-bg-active)", padding:"4px 8px", borderRadius:"4px"}}>{c.code}</span></td>
                    <td style={{fontSize:"13px"}}>{c.description}</td>
                    <td><span className="dash-cell-mono">{c.type === "percent" ? "Pourcentage" : "Montant fixe"}</span></td>
                    <td><span className="dash-cell-price">{c.type === "percent" ? `-${c.value}%` : `-${c.value.toLocaleString("fr-FR")} FCFA`}</span></td>
                    <td><span className="dash-cell-mono">{c.used}{c.limit > 0 ? ` / ${c.limit}` : ""}</span></td>
                    <td><span className="dash-cell-mono">{c.expires}</span></td>
                    <td>{c.status === "active" ? <span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Actif</span> : <span className="dash-badge dash-badge-neutral"><span className="dash-badge-dot"></span>Expiré</span>}</td>
                    <td><button className="dash-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "auto" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Réductions automatiques actives</h3>
                <p className="dash-settings-card-desc">Appliquées automatiquement au panier sans code promo.</p>
              </div>
              <button className="dash-btn dash-btn-ember dash-btn-sm">Créer une règle</button>
            </div>

            <div className="dash-rule-card">
              <div className="dash-rule-header">
                <div>
                  <div className="dash-rule-name">10% dès 50 000 FCFA</div>
                  <div className="dash-rule-desc">Sur tous les produits du catalogue</div>
                </div>
                <button type="button" className="dash-switch active"></button>
              </div>
              <div className="dash-rule-stats">
                <div><span className="dash-cell-mono">Utilisée</span><span className="dash-rule-stat-value">87 fois</span></div>
                <div><span className="dash-cell-mono">CA généré</span><span className="dash-rule-stat-value">412K FCFA</span></div>
              </div>
            </div>

            <div className="dash-rule-card">
              <div className="dash-rule-header">
                <div>
                  <div className="dash-rule-name">Livraison offerte dès 35 000 FCFA</div>
                  <div className="dash-rule-desc">Sur Dakar et banlieue uniquement</div>
                </div>
                <button type="button" className="dash-switch active"></button>
              </div>
              <div className="dash-rule-stats">
                <div><span className="dash-cell-mono">Utilisée</span><span className="dash-rule-stat-value">142 fois</span></div>
                <div><span className="dash-cell-mono">Économie clients</span><span className="dash-rule-stat-value">284K FCFA</span></div>
              </div>
            </div>

            <div className="dash-rule-card">
              <div className="dash-rule-header">
                <div>
                  <div className="dash-rule-name">Lot de 3 = -15%</div>
                  <div className="dash-rule-desc">Catégorie Bijoux</div>
                </div>
                <button type="button" className="dash-switch"></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "campaigns" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Ventes flash en cours</h3>
                <p className="dash-settings-card-desc">Créez de l&apos;urgence avec des promotions limitées dans le temps.</p>
              </div>
              <button className="dash-btn dash-btn-ember dash-btn-sm">Lancer une vente flash</button>
            </div>

            <div className="dash-campaign-card">
              <div className="dash-campaign-header">
                <div>
                  <div className="dash-campaign-eyebrow">
                    <span className="dash-campaign-pulse"></span>
                    EN COURS
                  </div>
                  <div className="dash-campaign-name">Soldes Printemps 2026</div>
                  <div className="dash-campaign-desc">-30% sur la collection Robes · Du 1er au 7 mai</div>
                </div>
                <div className="dash-campaign-countdown">
                  <div className="dash-campaign-countdown-label">SE TERMINE DANS</div>
                  <div className="dash-campaign-countdown-value">3j 14h 22m</div>
                </div>
              </div>
              <div className="dash-campaign-stats">
                <div className="dash-campaign-stat"><div className="dash-campaign-stat-label">Ventes</div><div className="dash-campaign-stat-value">42</div></div>
                <div className="dash-campaign-stat"><div className="dash-campaign-stat-label">CA</div><div className="dash-campaign-stat-value">1.2M</div></div>
                <div className="dash-campaign-stat"><div className="dash-campaign-stat-label">Clients</div><div className="dash-campaign-stat-value">38</div></div>
                <div className="dash-campaign-stat"><div className="dash-campaign-stat-label">Conversion</div><div className="dash-campaign-stat-value">4.2%</div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "giftcards" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Cartes cadeaux</h3>
                <p className="dash-settings-card-desc">Vendez des cartes cadeaux à offrir. Activées via code unique.</p>
              </div>
              <button className="dash-btn dash-btn-ember dash-btn-sm">Émettre une carte</button>
            </div>

            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Activer les cartes cadeaux sur ma boutique</div>
                <div className="dash-toggle-info-desc">Les clients peuvent acheter une carte cadeau et l&apos;envoyer par email.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>

            <div className="dash-form-section-divider"></div>

            <h4 className="dash-form-subsection-title">Montants disponibles</h4>
            <div className="dash-giftcard-grid">
              {[5000, 10000, 25000, 50000, 100000].map(amount => (
                <div key={amount} className="dash-giftcard-amount">
                  {amount.toLocaleString("fr-FR")}<span style={{fontSize:"11px",fontFamily:"Inter"}}> FCFA</span>
                </div>
              ))}
              <button className="dash-giftcard-add">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                Ajouter
              </button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Cartes émises</h3>
              </div>
            </div>
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr><th>Code</th><th>Montant</th><th>Acheteur</th><th>Bénéficiaire</th><th>Solde</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="dash-cell-mono" style={{fontWeight:700}}>GIFT-AI-XK29-MM44</span></td>
                    <td><span className="dash-cell-price">25 000 FCFA</span></td>
                    <td>Fatou Diop</td>
                    <td>marie@gmail.com</td>
                    <td><span className="dash-cell-price">25 000 FCFA</span></td>
                    <td><span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Active</span></td>
                  </tr>
                  <tr>
                    <td><span className="dash-cell-mono" style={{fontWeight:700}}>GIFT-BV-LK33-PP90</span></td>
                    <td><span className="dash-cell-price">10 000 FCFA</span></td>
                    <td>Awa Konaté</td>
                    <td>cousin@yahoo.fr</td>
                    <td><span className="dash-cell-price" style={{color:"var(--dash-text-tertiary)"}}>0 FCFA</span></td>
                    <td><span className="dash-badge dash-badge-neutral"><span className="dash-badge-dot"></span>Utilisée</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "loyalty" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Programme de fidélité</h3>
                <p className="dash-settings-card-desc">Récompensez vos meilleurs clients avec un système de points.</p>
              </div>
            </div>

            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Activer le programme fidélité</div>
                <div className="dash-toggle-info-desc">Vos clients gagnent des points à chaque achat et peuvent les échanger contre des réductions.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>

            <div className="dash-form-section-divider"></div>

            <div className="dash-form-row-split">
              <div className="dash-form-row">
                <label className="dash-form-label">Points gagnés par 1000 FCFA dépensés</label>
                <input type="number" className="dash-form-input" defaultValue="10" />
              </div>
              <div className="dash-form-row">
                <label className="dash-form-label">Valeur de 100 points</label>
                <div className="dash-form-input-group">
                  <input type="number" className="dash-form-input" defaultValue="500" />
                  <span className="dash-form-input-suffix">FCFA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Paliers VIP</h3>
                <p className="dash-settings-card-desc">Récompenses spéciales selon le total dépensé.</p>
              </div>
              <button className="dash-btn dash-btn-secondary dash-btn-sm">Ajouter un palier</button>
            </div>

            <div className="dash-tier-card">
              <div className="dash-tier-icon" style={{background:"linear-gradient(135deg, #CD7F32, #8B4513)"}}>🥉</div>
              <div className="dash-tier-info">
                <div className="dash-tier-name">Bronze</div>
                <div className="dash-tier-desc">Dès 50 000 FCFA dépensés · 5% de réduction permanente</div>
              </div>
              <div className="dash-tier-count">12 clients</div>
            </div>

            <div className="dash-tier-card">
              <div className="dash-tier-icon" style={{background:"linear-gradient(135deg, #C0C0C0, #A8A8A8)"}}>🥈</div>
              <div className="dash-tier-info">
                <div className="dash-tier-name">Argent</div>
                <div className="dash-tier-desc">Dès 200 000 FCFA dépensés · 10% + livraison gratuite</div>
              </div>
              <div className="dash-tier-count">5 clients</div>
            </div>

            <div className="dash-tier-card">
              <div className="dash-tier-icon" style={{background:"linear-gradient(135deg, #FFD700, #FFA500)"}}>🥇</div>
              <div className="dash-tier-info">
                <div className="dash-tier-name">Or</div>
                <div className="dash-tier-desc">Dès 500 000 FCFA dépensés · 15% + accès anticipé aux nouveautés</div>
              </div>
              <div className="dash-tier-count">2 clients</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
