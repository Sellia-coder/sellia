"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState<"info" | "activity" | "preferences">("info");

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <Link href="/dashboard" className="dash-back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Retour au dashboard
          </Link>
          <div className="dash-page-eyebrow">— Compte</div>
          <h1 className="dash-page-title">Mon profil</h1>
          <p className="dash-page-subtitle">Vos informations personnelles et votre activité sur Sellia.</p>
        </div>
      </div>

      <div className="dash-profile-header dash-animate-fade-up dash-animate-delay-1">
        <div className="dash-profile-avatar">K</div>
        <div className="dash-profile-info">
          <h2 className="dash-profile-name">KONO Christian</h2>
          <div className="dash-profile-email">kono@example.com</div>
          <div className="dash-profile-badges">
            <span className="dash-badge dash-badge-warning"><span className="dash-badge-dot"></span>Plan Pro</span>
            <span className="dash-badge dash-badge-info"><span className="dash-badge-dot"></span>Propriétaire</span>
            <span className="dash-cell-mono" style={{color:"var(--dash-text-tertiary)"}}>Membre depuis mars 2026</span>
          </div>
        </div>
        <button type="button" className="dash-btn dash-btn-secondary">Changer la photo</button>
      </div>

      <div className="dash-tabs-bar dash-animate-fade-up dash-animate-delay-2">
        <button type="button" className={`dash-tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>Informations</button>
        <button type="button" className={`dash-tab ${activeTab === "activity" ? "active" : ""}`} onClick={() => setActiveTab("activity")}>Activité récente</button>
        <button type="button" className={`dash-tab ${activeTab === "preferences" ? "active" : ""}`} onClick={() => setActiveTab("preferences")}>Préférences</button>
      </div>

      {activeTab === "info" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Informations personnelles</h3></div></div>
            <div className="dash-form-row-split">
              <div className="dash-form-row"><label className="dash-form-label">Prénom</label><input type="text" className="dash-form-input" defaultValue="Christian" /></div>
              <div className="dash-form-row"><label className="dash-form-label">Nom</label><input type="text" className="dash-form-input" defaultValue="KONO" /></div>
            </div>
            <div className="dash-form-row"><label className="dash-form-label">Email</label><input type="email" className="dash-form-input" defaultValue="kono@example.com" /></div>
            <div className="dash-form-row"><label className="dash-form-label">Téléphone</label><input type="tel" className="dash-form-input" defaultValue="+237 6 78 12 34 56" /></div>
            <div className="dash-form-row-split">
              <div className="dash-form-row"><label className="dash-form-label">Pays</label>
                <select className="dash-form-select" defaultValue="CM">
                  <option value="CM">Cameroun</option><option value="SN">Sénégal</option><option value="CI">Côte d&apos;Ivoire</option><option value="CD">RDC</option>
                </select>
              </div>
              <div className="dash-form-row"><label className="dash-form-label">Ville</label><input type="text" className="dash-form-input" defaultValue="Douala" /></div>
            </div>
            <button type="button" className="dash-btn dash-btn-ember dash-btn-sm">Enregistrer</button>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Bio</h3></div></div>
            <div className="dash-form-row">
              <textarea className="dash-form-textarea" rows={4} placeholder="Parlez de vous en quelques mots..." defaultValue="Entrepreneur tech basé à Douala. Fondateur de Sellia, plateforme e-commerce pour l'Afrique francophone." />
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Activité récente</h3></div></div>
            <div className="dash-activity-list">
              {[
                { type: "order", text: "Commande <strong>#1247</strong> confirmée", meta: "Il y a 12 min" },
                { type: "info", text: "Connexion depuis MacBook Pro · Chrome", meta: "Il y a 2h · Douala" },
                { type: "ember", text: "Nouveau produit ajouté · <strong>Robe wax Aïda</strong>", meta: "Hier" },
                { type: "success", text: "Paiement reçu · <strong>34 500 FCFA</strong>", meta: "Hier" },
                { type: "info", text: "Code promo <strong>BIENVENUE10</strong> créé", meta: "Il y a 3 jours" },
              ].map((a, i) => (
                <div key={i} className="dash-activity-item">
                  <div className={`dash-activity-icon dash-activity-icon-${a.type}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className="dash-activity-content">
                    <div className="dash-activity-text" dangerouslySetInnerHTML={{__html: a.text}}></div>
                    <div className="dash-activity-meta">{a.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Préférences d&apos;affichage</h3></div></div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Mode sombre</div>
                <div className="dash-toggle-info-desc">Interface en noir, plus reposante pour les yeux le soir.</div>
              </div>
              <button type="button" className="dash-switch"></button>
            </div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Animations réduites</div>
                <div className="dash-toggle-info-desc">Désactive les transitions et animations.</div>
              </div>
              <button type="button" className="dash-switch"></button>
            </div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Mode compact</div>
                <div className="dash-toggle-info-desc">Affiche plus d&apos;informations à l&apos;écran (densité accrue).</div>
              </div>
              <button type="button" className="dash-switch"></button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Communication</h3></div></div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Newsletter Sellia</div>
                <div className="dash-toggle-info-desc">Conseils, nouveautés produit, success stories.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Tips et tutoriels</div>
                <div className="dash-toggle-info-desc">Astuces personnalisées selon votre activité.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
