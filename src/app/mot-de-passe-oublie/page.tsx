"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="auth-page">
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
            <span className="auth-editorial-tag">— Sécurité avant tout</span>
            <h2 className="auth-editorial-headline">
              Récupérez l&apos;accès en <em>toute sécurité</em>.
            </h2>
            <p className="auth-editorial-sub">
              Nous vous envoyons un lien sécurisé pour réinitialiser votre mot de passe. Le lien expire dans 30 minutes.
            </p>
          </div>

          {/* Visual : icône cadenas */}
          <div className="auth-illustration">
            <div className="auth-lock-card">
              <div className="auth-lock-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="auth-lock-text">
                <span className="auth-lock-label">Niveau de sécurité</span>
                <span className="auth-lock-value">Maximum</span>
              </div>
              <div className="auth-lock-bars">
                <span className="active"></span>
                <span className="active"></span>
                <span className="active"></span>
                <span className="active"></span>
              </div>
            </div>
            <ul className="auth-security-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                <span>Lien à usage unique</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                <span>Expiration après 30 minutes</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                <span>Chiffrement de bout en bout</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                <span>Notification par email automatique</span>
              </li>
            </ul>
          </div>

          <div className="auth-security">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Sécurisé par Cloudflare · SSL TLS 1.3 · AES-256</span>
          </div>
        </div>
      </aside>

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
          {!submitted ? (
            <>
              <div className="auth-form-header">
                <span className="auth-form-eyebrow">Récupération</span>
                <h1 className="auth-form-title">Mot de passe <em>oublié</em> ?</h1>
                <p className="auth-form-subtitle">
                  Pas de souci. Indiquez votre email et nous vous enverrons un lien pour le réinitialiser.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className={`auth-field ${error ? "auth-field-error" : ""}`}>
                  <label htmlFor="email">Email du compte</label>
                  <div className="auth-input-wrapper">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
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
                  {error && <span className="auth-field-message">{error}</span>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-submit-btn"
                >
                  {isLoading ? (
                    <>
                      <span className="auth-spinner"></span>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Envoyer le lien de récupération</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </>
                  )}
                </button>
              </form>

              <p className="auth-alt-link">
                <Link href="/connexion" className="auth-link-back">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                  <span>Retour à la connexion</span>
                </Link>
              </p>
            </>
          ) : (
            <div className="auth-success">
              <div className="auth-success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="auth-success-title">Email envoyé.</h2>
              <p className="auth-success-text">
                Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="auth-success-hint">
                Pensez à vérifier vos spams. Le lien expire dans 30 minutes.
              </p>
              <div className="auth-success-actions">
                <button onClick={() => setSubmitted(false)} className="auth-secondary-btn">
                  Renvoyer le lien
                </button>
                <Link href="/connexion" className="auth-submit-btn">
                  <span>Retour à la connexion</span>
                </Link>
              </div>
            </div>
          )}
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
