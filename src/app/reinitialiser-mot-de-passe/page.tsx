"use client";

import type { FormEvent } from "react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/app/actions/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenInvalid, setTokenInvalid] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenInvalid(true);
    }
  }, [token]);

  const passwordValid = newPassword.length >= 8;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = passwordValid && passwordsMatch && !isLoading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!passwordValid) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (!passwordsMatch) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("resetToken", token);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    const result = await resetPasswordAction(formData);

    if (result.success) {
      router.push("/connexion?reset=success");
    } else {
      setError(result.error || "Une erreur est survenue.");
      setIsLoading(false);
    }
  };

  if (tokenInvalid) {
    return (
      <div className="auth-page">
        <div className="auth-form-side" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div className="auth-form-card" style={{textAlign:"center",maxWidth:"480px"}}>
            <div style={{fontSize:"48px",marginBottom:"16px"}}>⚠️</div>
            <h1 className="auth-title">Lien invalide</h1>
            <p className="auth-subtitle" style={{marginBottom:"24px"}}>
              Ce lien de réinitialisation est invalide ou a expiré. Veuillez recommencer la procédure.
            </p>
            <Link href="/mot-de-passe-oublie" className="auth-submit" style={{display:"inline-block",textDecoration:"none"}}>
              Recommencer
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="auth-editorial-tag">— Nouveau mot de passe</span>
            <h2 className="auth-editorial-headline">
              Créez un mot de passe <em>solide</em>.
            </h2>
            <p className="auth-editorial-sub">
              Choisissez un mot de passe que vous n&apos;utilisez nulle part ailleurs. Au moins 8 caractères, idéalement avec des chiffres.
            </p>
          </div>

          <div className="auth-illustration">
            <div className="auth-lock-card">
              <div className="auth-lock-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <div className="auth-lock-text">
                <span className="auth-lock-label">Sécurité du compte</span>
                <span className="auth-lock-value">Renouvelée</span>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Toutes les sessions seront déconnectées</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Email de confirmation envoyé</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Reconnexion immédiate possible</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <div className="auth-form-side">
        <div className="auth-form-card">
          <div className="auth-eyebrow">— Réinitialisation</div>
          <h1 className="auth-title">Nouveau mot de passe</h1>
          <p className="auth-subtitle">Choisissez un nouveau mot de passe pour sécuriser votre compte.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="newPassword" className="auth-label">Nouveau mot de passe</label>
              <div className="auth-input-wrap">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Au moins 8 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword" className="auth-label">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Retapez le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <div style={{fontSize:"12px",color:"#dc2626",marginTop:"6px"}}>Les mots de passe ne correspondent pas.</div>
              )}
            </div>

            {error && (
              <div style={{padding:"10px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"8px",color:"#dc2626",fontSize:"13px",marginBottom:"12px"}}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={!canSubmit}
            >
              {isLoading ? "Modification en cours..." : "Modifier le mot de passe"}
            </button>

            <div style={{marginTop:"20px",textAlign:"center",fontSize:"13px",color:"#8B8E94"}}>
              <Link href="/connexion" style={{color:"#E84B1F",textDecoration:"none"}}>← Retour à la connexion</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-page" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
