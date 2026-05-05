"use client";

import type { FormEvent } from "react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { signInAction } from "@/app/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";

function ConnexionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const googleError = searchParams.get("error");
  const googleErrorMessage = googleError === "google_cancelled" ? "Connexion Google annulée."
    : googleError === "google_init_failed" ? "Impossible de démarrer la connexion Google. Réessayez."
    : googleError === "google_invalid_state" ? "Session expirée. Réessayez."
    : googleError === "google_exchange_failed" ? "Erreur de connexion Google. Réessayez."
    : null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setErrors((prev) => ({ ...prev, form: "Email invalide." }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, form: "Mot de passe requis." }));
      return;
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, form: "" }));

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await signInAction(formData);

    if (result.success) {
      router.push("/dashboard");
    } else if ("requiresVerification" in result && result.requiresVerification && result.email) {
      router.push(`/verifier-email?email=${encodeURIComponent(result.email)}&flow=verification`);
    } else if ("requiresLoginOTP" in result && result.requiresLoginOTP && result.email) {
      router.push(`/verifier-email?email=${encodeURIComponent(result.email)}&flow=login`);
    } else {
      setErrors((prev) => ({
        ...prev,
        form: "error" in result && result.error ? result.error : "Connexion impossible.",
      }));
      setIsLoading(false);
    }
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

          {googleErrorMessage && (
            <div style={{padding:"12px 16px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"8px",color:"#dc2626",fontSize:"13px",marginBottom:"16px"}}>
              {googleErrorMessage}
            </div>
          )}

          <a href="/api/auth/google/start?intent=signin" className="auth-google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </a>

          <div className="auth-divider">
            <span className="auth-divider-text">ou</span>
          </div>

          {resetSuccess && (
            <div style={{padding:"12px 16px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"8px",color:"#15803d",fontSize:"13px",marginBottom:"16px"}}>
              ✓ Mot de passe modifié avec succès. Connectez-vous avec votre nouveau mot de passe.
            </div>
          )}

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

            <div style={{textAlign:"right",marginTop:"-8px",marginBottom:"4px"}}>
              <Link href="/mot-de-passe-oublie" style={{fontSize:"13px",color:"#8B8E94",textDecoration:"none",fontWeight:500}}>
                Mot de passe oublié ?
              </Link>
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

export default function Connexion() {
  return (
    <Suspense fallback={<div className="auth-page" />}>
      <ConnexionContent />
    </Suspense>
  );
}
