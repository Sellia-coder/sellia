"use client";

import Link from "next/link";

export default function ParametresPage() {
  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <Link href="/dashboard" className="dash-back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Retour au dashboard
          </Link>
          <div className="dash-page-eyebrow">— Compte</div>
          <h1 className="dash-page-title">Paramètres compte</h1>
          <p className="dash-page-subtitle">Sécurité, notifications et préférences de votre compte Sellia.</p>
        </div>
      </div>

      <div className="dash-settings-section dash-animate-fade-up dash-animate-delay-1">
        <div className="dash-settings-card">
          <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Identifiants de connexion</h3></div></div>
          <div className="dash-form-row"><label className="dash-form-label">Email principal</label><input type="email" className="dash-form-input" defaultValue="kono@example.com" /></div>
          <div className="dash-form-row"><label className="dash-form-label">Mot de passe</label><div style={{display:"flex", gap:"8px", alignItems:"center"}}><input type="password" className="dash-form-input" defaultValue="••••••••••••" disabled style={{flex:1}} /><button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Changer</button></div></div>
        </div>

        <div className="dash-settings-card">
          <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Authentification à deux facteurs</h3></div></div>
          <div className="dash-toggle-row">
            <div className="dash-toggle-info">
              <div className="dash-toggle-info-title">2FA par SMS</div>
              <div className="dash-toggle-info-desc">Code à 6 chiffres envoyé par SMS à chaque connexion.</div>
            </div>
            <button type="button" className="dash-switch active"></button>
          </div>
          <div className="dash-toggle-row">
            <div className="dash-toggle-info">
              <div className="dash-toggle-info-title">App authenticator</div>
              <div className="dash-toggle-info-desc">Google Authenticator, Authy, 1Password.</div>
            </div>
            <button type="button" className="dash-switch"></button>
          </div>
        </div>

        <div className="dash-settings-card">
          <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title">Notifications</h3></div></div>
          {[
            { name: "Emails de vente", desc: "Reçus à chaque commande" },
            { name: "Alertes sécurité", desc: "Connexions inhabituelles, changements" },
            { name: "Mises à jour produit Sellia", desc: "Nouvelles fonctionnalités" },
            { name: "Conseils marketing", desc: "Optimisations boutique" },
          ].map((n, i) => (
            <div key={n.name} className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">{n.name}</div>
                <div className="dash-toggle-info-desc">{n.desc}</div>
              </div>
              <button type="button" className={`dash-switch ${i < 3 ? "active" : ""}`}></button>
            </div>
          ))}
        </div>

        <div className="dash-settings-card" style={{borderColor:"rgba(220, 38, 38, 0.2)"}}>
          <div className="dash-settings-card-header"><div><h3 className="dash-settings-card-title" style={{color:"var(--dash-danger)"}}>Supprimer mon compte</h3></div></div>
          <p style={{fontSize:"13px", color:"var(--dash-text-secondary)", marginBottom:"12px"}}>Suppression définitive après 30 jours. Toutes vos données seront effacées.</p>
          <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" style={{color:"var(--dash-danger)", borderColor:"rgba(220, 38, 38, 0.3)"}}>Demander la suppression</button>
        </div>
      </div>
    </>
  );
}
