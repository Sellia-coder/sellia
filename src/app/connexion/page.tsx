"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!isValidEmail) newErrors.email = "Veuillez entrer une adresse email valide";
    if (!password) newErrors.password = "Veuillez entrer votre mot de passe";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setErrors({ form: "Email ou mot de passe incorrect" });
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="auth-page">
      {/* Panneau gauche - Editorial (variante connexion) */}
      <aside className="auth-editorial">
        <div className="auth-editorial-inner">
          <Link href="/" className="auth-logo" aria-label="Sellia">
            <svg width="148" height="40" viewBox="0 0 220 60" fill="none">
              <path d="M 8 8 L 38 8 L 54 24 L 54 54 L 8 54 Z" fill="#FAFAF7" />
              <circle cx="16" cy="16" r="2.4" fill="#0E1116" />
              <path d="M 38 30 L 24 30 L 24 36 L 38 36 L 38 44 L 24 44" stroke="#E84B1F" strokeWidth="2.6" fill="none" strokeLinecap="square" />
              <text x="68" y="44" fontFamily="Inter, system-ui, sans-serif" fontSize="32" fontWeight="600" fill="#FAFAF7" letterSpacing="-1.2">sellia</text>
            </svg>
          </Link>

          <div className="auth-editorial-quote">
            <span className="auth-editorial-tag">— De retour</span>
            <h2 className="auth-editorial-headline">
              Bienvenue. <em>Vos ventes vous attendent.</em>
            </h2>
            <p className="auth-editorial-sub">
              Connectez-vous pour accéder à votre tableau de bord, gérer vos commandes et optimiser votre boutique.
            </p>
          </div>

          {/* Stats live mockup */}
          <div className="auth-stats-grid">
            <div className="auth-stat-card">
              <span className="auth-stat-label">Ventes ce mois</span>
              <span className="auth-stat-value">2,4M <span className="auth-stat-unit">FCFA</span></span>
              <div className="auth-stat-trend auth-stat-trend-up">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                <span>+18%</span>
              </div>
            </div>
            <div className="auth-stat-card">
              <span className="auth-stat-label">Commandes</span>
              <span className="auth-stat-value">142</span>
              <div className="auth-stat-trend auth-stat-trend-up">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                <span>+24</span>
              </div>
            </div>
            <div className="auth-stat-card">
              <span className="auth-stat-label">Taux de conversion</span>
              <span className="auth-stat-value">3.8<span className="auth-stat-unit">%</span></span>
              <div className="auth-stat-trend auth-stat-trend-up">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                <span>+0.4</span>
              </div>
            </div>
            <div className="auth-stat-card">
              <span className="auth-stat-label">Visiteurs uniques</span>
              <span className="auth-stat-value">3,7<span className="auth-stat-unit">k</span></span>
              <div className="auth-stat-trend auth-stat-trend-up">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                <span>+12%</span>
              </div>
            </div>
          </div>

          <div className="auth-payments">
            <span className="auth-payments-label">Compatible avec</span>
            <div className="auth-payments-logos">
              <span className="auth-payment-pill auth-payment-mtn">MTN MoMo</span>
              <span className="auth-payment-pill auth-payment-orange">Orange Money</span>
              <span className="auth-payment-pill auth-payment-wave">Wave</span>
              <span className="auth-payment-pill auth-payment-card">Visa · Mastercard</span>
            </div>
          </div>

          <div className="auth-security">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Sécurisé par Cloudflare · SSL TLS 1.3 · AES-256</span>
          </div>
        </div>
      </aside>

      {/* Panneau droit - Formulaire */}
      <main className="auth-form-panel">
        <Link href="/" className="auth-logo-mobile" aria-label="Sellia">
          <svg width="120" height="32" viewBox="0 0 220 60" fill="none">
            <path d="M 8 8 L 38 8 L 54 24 L 54 54 L 8 54 Z" fill="#0E1116" />
            <circle cx="16" cy="16" r="2.4" fill="#FAFAF7" />
            <path d="M 38 30 L 24 30 L 24 36 L 38 36 L 38 44 L 24 44" stroke="#E84B1F" strokeWidth="2.6" fill="none" strokeLinecap="square" />
            <text x="68" y="44" fontFamily="Inter, system-ui, sans-serif" fontSize="32" fontWeight="600" fill="#0E1116" letterSpacing="-1.2">sellia</text>
          </svg>
        </Link>

        <div className="auth-form-container">
          <div className="auth-form-header">
            <span className="auth-form-eyebrow">Connexion</span>
            <h1 className="auth-form-title">Content de vous <em>revoir</em>.</h1>
            <p className="auth-form-subtitle">
              Connectez-vous pour accéder à votre tableau de bord.
            </p>
          </div>

          {/* Bouton Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="auth-google-btn"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            <span>Continuer avec Google</span>
          </button>

          <div className="auth-divider">
            <span>ou avec votre email</span>
          </div>

          {/* Erreur globale */}
          {errors.form && (
            <div className="auth-form-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className={`auth-field ${errors.email ? "auth-field-error" : ""}`}>
              <label htmlFor="email">Email</label>
              <div className="auth-input-wrapper">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  placeholder="vous@entreprise.com"
                  autoComplete="email"
                  autoFocus
                />
                {isValidEmail && (
                  <span className="auth-input-icon-success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                )}
              </div>
              {errors.email && <span className="auth-field-message">{errors.email}</span>}
            </div>

            <div className={`auth-field ${errors.password ? "auth-field-error" : ""}`}>
              <div className="auth-field-label-row">
                <label htmlFor="password">Mot de passe</label>
                <Link href="/mot-de-passe-oublie" className="auth-link auth-link-small">
                  Oublié ?
                </Link>
              </div>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-input-toggle"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="auth-field-message">{errors.password}</span>}
            </div>

            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="auth-checkbox-mark"></span>
              <span className="auth-checkbox-text auth-checkbox-text-muted">
                Rester connecté pendant 30 jours
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
            >
              {isLoading ? (
                <>
                  <span className="auth-spinner"></span>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </>
              )}
            </button>
          </form>

          <p className="auth-alt-link">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="auth-link auth-link-strong">
              Créer un compte
            </Link>
          </p>
        </div>

        <div className="auth-form-footer">
          <Link href="/conditions">Conditions</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </main>
    </div>
  );
}
