"use client";

import { useState } from "react";

type Tab = "general" | "shop" | "notifications" | "team" | "plan" | "security" | "api" | "advanced";

export default function ReglagesPage() {
  const [tab, setTab] = useState<Tab>("general");

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Paramètres</div>
          <h1 className="dash-page-title">Réglages</h1>
          <p className="dash-page-subtitle">Configuration globale de votre boutique Sellia.</p>
        </div>
      </div>

      <div className="dash-tabs-bar dash-animate-fade-up dash-animate-delay-1">
        <button type="button" className={`dash-tab ${tab === "general" ? "active" : ""}`} onClick={() => setTab("general")}>Général</button>
        <button type="button" className={`dash-tab ${tab === "shop" ? "active" : ""}`} onClick={() => setTab("shop")}>Boutique</button>
        <button type="button" className={`dash-tab ${tab === "notifications" ? "active" : ""}`} onClick={() => setTab("notifications")}>Notifications</button>
        <button type="button" className={`dash-tab ${tab === "team" ? "active" : ""}`} onClick={() => setTab("team")}>Équipe</button>
        <button type="button" className={`dash-tab ${tab === "plan" ? "active" : ""}`} onClick={() => setTab("plan")}>Plan & Facturation</button>
        <button type="button" className={`dash-tab ${tab === "security" ? "active" : ""}`} onClick={() => setTab("security")}>Sécurité</button>
        <button type="button" className={`dash-tab ${tab === "api" ? "active" : ""}`} onClick={() => setTab("api")}>API & Webhooks</button>
        <button type="button" className={`dash-tab ${tab === "advanced" ? "active" : ""}`} onClick={() => setTab("advanced")}>Avancé</button>
      </div>

      {tab === "general" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div><h3 className="dash-settings-card-title">Informations générales</h3></div>
            </div>
            <div className="dash-form-row"><label className="dash-form-label">Langue de l&apos;interface</label>
              <select className="dash-form-select" defaultValue="fr">
                <option value="fr">Français</option><option value="en">English</option>
              </select>
            </div>
            <div className="dash-form-row"><label className="dash-form-label">Fuseau horaire</label>
              <select className="dash-form-select" defaultValue="GMT">
                <option value="GMT">(GMT+0) Dakar, Abidjan, Bamako</option>
                <option value="WAT">(GMT+1) Yaoundé, Douala, Kinshasa</option>
                <option value="EAT">(GMT+3) Nairobi, Addis-Abeba</option>
              </select>
            </div>
            <div className="dash-form-row"><label className="dash-form-label">Format de date</label>
              <select className="dash-form-select" defaultValue="dmy">
                <option value="dmy">JJ/MM/AAAA (03/05/2026)</option>
                <option value="ymd">AAAA-MM-JJ (2026-05-03)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {tab === "shop" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div><h3 className="dash-settings-card-title">Identité de la boutique</h3></div>
            </div>
            <div className="dash-form-row"><label className="dash-form-label">Nom de la boutique</label>
              <input type="text" className="dash-form-input" defaultValue="Maison Aïda" />
            </div>
            <div className="dash-form-row"><label className="dash-form-label">Tagline / Slogan</label>
              <input type="text" className="dash-form-input" defaultValue="Mode féminine africaine moderne" />
            </div>
            <div className="dash-form-row"><label className="dash-form-label">Description</label>
              <textarea className="dash-form-textarea" rows={3} defaultValue="Boutique en ligne de vêtements et accessoires africains contemporains, fabriqués au Sénégal." />
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div><h3 className="dash-settings-card-title">Coordonnées</h3></div>
            </div>
            <div className="dash-form-row-split">
              <div className="dash-form-row"><label className="dash-form-label">Email</label>
                <input type="email" className="dash-form-input" defaultValue="contact@maison-aida.com" />
              </div>
              <div className="dash-form-row"><label className="dash-form-label">Téléphone</label>
                <input type="tel" className="dash-form-input" defaultValue="+221 77 123 45 67" />
              </div>
            </div>
            <div className="dash-form-row"><label className="dash-form-label">Adresse</label>
              <textarea className="dash-form-textarea" rows={2} defaultValue="Avenue Pompidou, Plateau, Dakar, Sénégal" />
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div><h3 className="dash-settings-card-title">Statut de la boutique</h3></div>
            </div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Boutique en ligne</div>
                <div className="dash-toggle-info-desc">Vos clients peuvent visiter et acheter sur votre boutique.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Mode maintenance</div>
                <div className="dash-toggle-info-desc">Affiche une page &quot;Bientôt de retour&quot; sans bloquer les commandes existantes.</div>
              </div>
              <button type="button" className="dash-switch"></button>
            </div>
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div><h3 className="dash-settings-card-title">Notifications par email</h3></div>
            </div>
            {[
              { name: "Nouvelle commande", desc: "Recevez un email à chaque vente" },
              { name: "Stock faible", desc: "Alerte quand un produit a moins de 5 unités" },
              { name: "Avis client", desc: "Quand un client laisse un avis" },
              { name: "Paiement reçu", desc: "Confirmation de paiement Mobile Money" },
              { name: "Rapport hebdomadaire", desc: "Tous les lundis matin avec vos stats" },
            ].map((n, i) => (
              <div key={n.name} className="dash-toggle-row">
                <div className="dash-toggle-info">
                  <div className="dash-toggle-info-title">{n.name}</div>
                  <div className="dash-toggle-info-desc">{n.desc}</div>
                </div>
                <button type="button" className={`dash-switch ${i < 4 ? "active" : ""}`}></button>
              </div>
            ))}
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div><h3 className="dash-settings-card-title">Notifications WhatsApp</h3></div>
            </div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Activer notifications WhatsApp</div>
                <div className="dash-toggle-info-desc">Recevez les nouvelles commandes directement sur votre WhatsApp Business.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>
            <div className="dash-form-row" style={{marginTop:"12px"}}>
              <label className="dash-form-label">Numéro WhatsApp</label>
              <input type="tel" className="dash-form-input" defaultValue="+221 77 123 45 67" />
            </div>
          </div>
        </div>
      )}

      {tab === "team" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Membres de l&apos;équipe</h3>
                <p className="dash-settings-card-desc">Invitez des collaborateurs avec des permissions précises.</p>
              </div>
              <button type="button" className="dash-btn dash-btn-ember dash-btn-sm">+ Inviter un membre</button>
            </div>

            <div className="dash-team-row">
              <div className="dash-cell-customer-avatar" style={{background:"linear-gradient(135deg, #6B5B47, #8B6F47)", width:"40px", height:"40px", fontSize:"14px"}}>K</div>
              <div className="dash-team-info">
                <div className="dash-team-name">KONO Christian (vous)</div>
                <div className="dash-team-email">kono@example.com</div>
              </div>
              <span className="dash-badge dash-badge-warning"><span className="dash-badge-dot"></span>Propriétaire</span>
            </div>

            <div className="dash-team-row">
              <div className="dash-cell-customer-avatar" style={{background:"linear-gradient(135deg, #E84B1F, #ff7849)", width:"40px", height:"40px", fontSize:"14px"}}>F</div>
              <div className="dash-team-info">
                <div className="dash-team-name">Fatou Diop</div>
                <div className="dash-team-email">fatou@maison-aida.com</div>
              </div>
              <span className="dash-badge dash-badge-info"><span className="dash-badge-dot"></span>Manager</span>
            </div>

            <div className="dash-team-row">
              <div className="dash-cell-customer-avatar" style={{background:"linear-gradient(135deg, #4B0082, #6A0DAD)", width:"40px", height:"40px", fontSize:"14px"}}>A</div>
              <div className="dash-team-info">
                <div className="dash-team-name">Awa Konaté</div>
                <div className="dash-team-email">awa@maison-aida.com (en attente)</div>
              </div>
              <span className="dash-badge dash-badge-neutral"><span className="dash-badge-dot"></span>Vendeur</span>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Rôles disponibles</h3>
              </div>
            </div>
            <div className="dash-role-card">
              <div className="dash-role-name">Propriétaire</div>
              <div className="dash-role-desc">Accès total · Gestion équipe · Facturation</div>
            </div>
            <div className="dash-role-card">
              <div className="dash-role-name">Manager</div>
              <div className="dash-role-desc">Tous les paramètres sauf facturation et suppression</div>
            </div>
            <div className="dash-role-card">
              <div className="dash-role-name">Vendeur</div>
              <div className="dash-role-desc">Produits, commandes, clients (pas de paramètres)</div>
            </div>
            <div className="dash-role-card">
              <div className="dash-role-name">Comptable</div>
              <div className="dash-role-desc">Lecture seule sur paiements et rapports</div>
            </div>
          </div>
        </div>
      )}

      {tab === "plan" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card" style={{background:"linear-gradient(135deg, var(--dash-bg-active), rgba(232, 75, 31, 0.02))", borderColor:"rgba(232, 75, 31, 0.2)"}}>
            <div className="dash-settings-card-header">
              <div>
                <div className="dash-settings-card-eyebrow">Plan actuel</div>
                <h3 className="dash-settings-card-title" style={{fontFamily:"'Fraunces', serif", fontSize:"32px", fontWeight:400, marginBottom:"4px"}}>Pro</h3>
                <p className="dash-settings-card-desc">29 900 FCFA/mois · Renouvellement le 15 mai 2026</p>
              </div>
              <button type="button" className="dash-btn dash-btn-secondary">Gérer l&apos;abonnement</button>
            </div>
            <div className="dash-plan-features">
              <div className="dash-plan-feature">✓ Produits illimités</div>
              <div className="dash-plan-feature">✓ Domaine personnalisé</div>
              <div className="dash-plan-feature">✓ 5 membres d&apos;équipe</div>
              <div className="dash-plan-feature">✓ Support prioritaire 24/7</div>
              <div className="dash-plan-feature">✓ Frais de transaction 1.5%</div>
              <div className="dash-plan-feature">✓ Toutes les intégrations</div>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div><h3 className="dash-settings-card-title">Méthode de paiement</h3></div>
            </div>
            <div className="dash-payment-method-row">
              <div className="dash-payment-method-logo" style={{background:"#1A1F36", color:"white"}}>VISA</div>
              <div className="dash-payment-method-info">
                <div className="dash-payment-method-name">Visa •••• 4242</div>
                <div className="dash-payment-method-desc">Expire 12/2027 · Christian KONO</div>
              </div>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Modifier</button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div><h3 className="dash-settings-card-title">Historique de facturation</h3></div>
            </div>
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead><tr><th>Date</th><th>Description</th><th>Montant</th><th>Statut</th><th></th></tr></thead>
                <tbody>
                  <tr><td><span className="dash-cell-mono">15 avr. 2026</span></td><td>Plan Pro · Mensuel</td><td><span className="dash-cell-price">29 900 FCFA</span></td><td><span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Payé</span></td><td><button type="button" className="dash-icon-btn" aria-label="Télécharger"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></button></td></tr>
                  <tr><td><span className="dash-cell-mono">15 mars 2026</span></td><td>Plan Pro · Mensuel</td><td><span className="dash-cell-price">29 900 FCFA</span></td><td><span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Payé</span></td><td><button type="button" className="dash-icon-btn" aria-label="Télécharger"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></button></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Mot de passe</h3></div></div>
            <div className="dash-form-row"><label className="dash-form-label">Mot de passe actuel</label><input type="password" className="dash-form-input" /></div>
            <div className="dash-form-row"><label className="dash-form-label">Nouveau mot de passe</label><input type="password" className="dash-form-input" /></div>
            <div className="dash-form-row"><label className="dash-form-label">Confirmer</label><input type="password" className="dash-form-input" /></div>
            <button type="button" className="dash-btn dash-btn-ember dash-btn-sm">Mettre à jour</button>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Authentification à deux facteurs (2FA)</h3></div></div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Activer le 2FA via SMS</div>
                <div className="dash-toggle-info-desc">Code à 6 chiffres envoyé sur votre téléphone à chaque connexion.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">2FA via app authenticator</div>
                <div className="dash-toggle-info-desc">Google Authenticator, Authy, 1Password.</div>
              </div>
              <button type="button" className="dash-switch"></button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Sessions actives</h3></div></div>
            <div className="dash-session-row">
              <div className="dash-session-icon">💻</div>
              <div className="dash-session-info">
                <div className="dash-session-device">MacBook Pro · Chrome 120</div>
                <div className="dash-session-meta">Douala, Cameroun · Session actuelle</div>
              </div>
              <span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Actif</span>
            </div>
            <div className="dash-session-row">
              <div className="dash-session-icon">📱</div>
              <div className="dash-session-info">
                <div className="dash-session-device">iPhone 15 · Safari</div>
                <div className="dash-session-meta">Yaoundé, Cameroun · Il y a 3h</div>
              </div>
              <button type="button" className="dash-btn dash-btn-ghost dash-btn-sm">Déconnecter</button>
            </div>
          </div>
        </div>
      )}

      {tab === "api" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Clés API</h3>
                <p className="dash-settings-card-desc">Pour intégrer Sellia avec vos outils tiers (Zapier, Make, n8n, scripts custom).</p>
              </div>
              <button type="button" className="dash-btn dash-btn-ember dash-btn-sm">Générer une clé</button>
            </div>

            <div className="dash-api-key-row">
              <div className="dash-api-key-info">
                <div className="dash-api-key-name">Production</div>
                <div className="dash-api-key-value">
                  <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:"12px"}}>sk_live_4Eo••••••••••••••••••••••••</span>
                  <button type="button" className="dash-btn dash-btn-ghost dash-btn-sm">Copier</button>
                </div>
                <div className="dash-api-key-meta">Créée le 12 mars 2026 · Dernière utilisation il y a 12 min</div>
              </div>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Révoquer</button>
            </div>

            <div className="dash-api-key-row">
              <div className="dash-api-key-info">
                <div className="dash-api-key-name">Test (Sandbox)</div>
                <div className="dash-api-key-value">
                  <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:"12px"}}>sk_test_zX9••••••••••••••••••••••••</span>
                  <button type="button" className="dash-btn dash-btn-ghost dash-btn-sm">Copier</button>
                </div>
                <div className="dash-api-key-meta">Créée le 12 mars 2026 · Mode test sans paiements réels</div>
              </div>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Révoquer</button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Webhooks</h3>
                <p className="dash-settings-card-desc">Recevez des notifications HTTP en temps réel pour les événements (commandes, paiements, stock).</p>
              </div>
              <button type="button" className="dash-btn dash-btn-ember dash-btn-sm">+ Ajouter un endpoint</button>
            </div>

            <div className="dash-webhook-row">
              <div className="dash-webhook-status dash-webhook-status-ok">●</div>
              <div className="dash-webhook-info">
                <div className="dash-webhook-url">https://hooks.zapier.com/hooks/catch/12345/abcdef/</div>
                <div className="dash-webhook-meta">order.created, order.paid · 247 envois · 100% réussis</div>
              </div>
              <button type="button" className="dash-btn dash-btn-ghost dash-btn-sm">Configurer</button>
            </div>
          </div>
        </div>
      )}

      {tab === "advanced" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Export des données</h3></div></div>
            <p style={{fontSize:"13px", color:"var(--dash-text-secondary)", marginBottom:"16px"}}>Exportez toutes vos données (produits, commandes, clients) au format CSV ou JSON.</p>
            <div style={{display:"flex", gap:"8px", flexWrap:"wrap"}}>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Exporter produits (CSV)</button>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Exporter commandes (CSV)</button>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Exporter clients (CSV)</button>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Tout exporter (JSON)</button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Import des données</h3></div></div>
            <p style={{fontSize:"13px", color:"var(--dash-text-secondary)", marginBottom:"16px"}}>Importez vos produits depuis Shopify, WooCommerce, ou un CSV custom.</p>
            <div style={{display:"flex", gap:"8px", flexWrap:"wrap"}}>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Importer depuis Shopify</button>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Importer depuis WooCommerce</button>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Importer CSV</button>
            </div>
          </div>

          <div className="dash-settings-card" style={{borderColor:"rgba(220, 38, 38, 0.2)"}}>
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title" style={{color:"var(--dash-danger)"}}>Zone dangereuse</h3>
                <p className="dash-settings-card-desc">Ces actions sont irréversibles. Procédez avec précaution.</p>
              </div>
            </div>
            <div className="dash-toggle-row" style={{borderTop:"1px solid var(--dash-border)", paddingTop:"16px"}}>
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title" style={{color:"var(--dash-danger)"}}>Supprimer toutes les données</div>
                <div className="dash-toggle-info-desc">Supprime produits, commandes, clients. Le compte est conservé.</div>
              </div>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" style={{color:"var(--dash-danger)", borderColor:"rgba(220, 38, 38, 0.3)"}}>Supprimer</button>
            </div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title" style={{color:"var(--dash-danger)"}}>Fermer mon compte Sellia</div>
                <div className="dash-toggle-info-desc">Suppression définitive du compte et de toutes les données après 30 jours.</div>
              </div>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" style={{color:"var(--dash-danger)", borderColor:"rgba(220, 38, 38, 0.3)"}}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
