"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function VerifierEmail() {
  const [resendCount, setResendCount] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setResendCount(resendCount + 1);
      setResendCooldown(60);
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
            <span className="auth-editorial-tag">— Une dernière étape</span>
            <h2 className="auth-editorial-headline">
              Vérifiez votre boîte mail. <em>Et c&apos;est parti.</em>
            </h2>
            <p className="auth-editorial-sub">
              Nous protégeons votre compte dès le premier instant. Confirmez votre email pour activer votre boutique Sellia.
            </p>
          </div>

          {/* Steps progression */}
          <div className="auth-steps">
            <div className="auth-step auth-step-done">
              <div className="auth-step-marker">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div className="auth-step-content">
                <span className="auth-step-title">Compte créé</span>
                <span className="auth-step-desc">Vos identifiants sont enregistrés</span>
              </div>
            </div>
            <div className="auth-step-line"></div>
            <div className="auth-step auth-step-active">
              <div className="auth-step-marker">
                <span className="auth-step-pulse"></span>
                2
              </div>
              <div className="auth-step-content">
                <span className="auth-step-title">Vérification email</span>
                <span className="auth-step-desc">Confirmez votre adresse</span>
              </div>
            </div>
            <div className="auth-step-line"></div>
            <div className="auth-step">
              <div className="auth-step-marker">3</div>
              <div className="auth-step-content">
                <span className="auth-step-title">Création boutique</span>
                <span className="auth-step-desc">Décrivez ce que vous vendez</span>
              </div>
            </div>
            <div className="auth-step-line"></div>
            <div className="auth-step">
              <div className="auth-step-marker">4</div>
              <div className="auth-step-content">
                <span className="auth-step-title">Configuration paiements</span>
                <span className="auth-step-desc">MTN, Orange, Wave, cartes</span>
              </div>
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
          <div className="auth-verify-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span className="auth-verify-pulse"></span>
          </div>

          <div className="auth-form-header">
            <span className="auth-form-eyebrow">Étape 2 sur 4</span>
            <h1 className="auth-form-title">Vérifiez votre <em>email</em>.</h1>
            <p className="auth-form-subtitle">
              Nous venons de vous envoyer un lien de confirmation. Cliquez dessus pour activer votre compte.
            </p>
          </div>

          {/* Tips */}
          <div className="auth-tips">
            <h3 className="auth-tips-title">L&apos;email n&apos;arrive pas ?</h3>
            <ul className="auth-tips-list">
              <li>
                <span className="auth-tips-bullet">01</span>
                <span>Vérifiez votre dossier <strong>Spams</strong> ou <strong>Promotions</strong></span>
              </li>
              <li>
                <span className="auth-tips-bullet">02</span>
                <span>Patientez quelques minutes — l&apos;envoi peut prendre jusqu&apos;à 5 min</span>
              </li>
              <li>
                <span className="auth-tips-bullet">03</span>
                <span>Ajoutez <strong>noreply@getsellia.com</strong> à vos contacts</span>
              </li>
            </ul>
          </div>

          {resendCount > 0 && (
            <div className="auth-success-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Email renvoyé avec succès</span>
            </div>
          )}

          <div className="auth-actions-stack">
            <button
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className="auth-submit-btn"
            >
              {isResending ? (
                <>
                  <span className="auth-spinner"></span>
                  <span>Envoi en cours...</span>
                </>
              ) : resendCooldown > 0 ? (
                <span>Renvoyer dans {resendCooldown}s</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                  <span>Renvoyer l&apos;email</span>
                </>
              )}
            </button>

            <Link href="/inscription" className="auth-secondary-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              <span>Modifier mon adresse email</span>
            </Link>
          </div>

          <p className="auth-alt-link">
            Besoin d&apos;aide ?{" "}
            <a href="mailto:support@getsellia.com" className="auth-link auth-link-strong">
              Contactez le support
            </a>
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
