"use client";

import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function Inscription() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shopName, setShopName] = useState<string | null>(null);

  // Récupère le nom de la boutique générée pour personnaliser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sellia_generated_shop");
      if (stored) {
        try {
          const shop = JSON.parse(stored);
          setShopName(shop.name);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const passwordLabel =
    passwordStrength === 0 ? "" :
    passwordStrength === 1 ? "Faible" :
    passwordStrength === 2 ? "Moyen" :
    passwordStrength === 3 ? "Bon" :
    "Excellent";

  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!firstName || firstName.length < 2) newErrors.form = "Veuillez entrer votre prénom.";
    if (!isValidEmail) newErrors.email = "Veuillez entrer une adresse email valide";
    if (passwordStrength < 2) newErrors.password = "Mot de passe trop faible (8 caractères, majuscule, chiffre)";
    if (!acceptTerms) newErrors.terms = "Veuillez accepter les conditions";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, form: "" }));

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("email", email);
    formData.append("password", password);

    const result = await signUpAction(formData);

    if (result.success) {
      router.push(`/verifier-email?email=${encodeURIComponent(result.email!)}`);
    } else {
      setErrors((prev) => ({
        ...prev,
        form: result.error || "Une erreur est survenue.",
      }));
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="auth-page auth-page-v2">
      {/* Panneau gauche - 3 avantages */}
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

          {/* Si boutique générée, on personnalise */}
          {shopName ? (
            <div className="auth-editorial-quote">
              <span className="auth-editorial-tag">— Une dernière étape</span>
              <h2 className="auth-editorial-headline">
                Sauvegardez <em>{shopName}</em>.
              </h2>
              <p className="auth-editorial-sub">
                Votre boutique est prête. Créez votre compte pour la conserver, la personnaliser et commencer à vendre dès aujourd&apos;hui.
              </p>
            </div>
          ) : (
            <div className="auth-editorial-quote">
              <span className="auth-editorial-tag">— Inscription gratuite</span>
              <h2 className="auth-editorial-headline">
                Créez votre boutique en <em>30 secondes</em>.
              </h2>
              <p className="auth-editorial-sub">
                Plus de 200 entrepreneurs africains ont déjà rejoint Sellia ce mois-ci.
              </p>
            </div>
          )}

          {/* 3 avantages clés */}
          <div className="auth-benefits">
            <div className="auth-benefit">
              <div className="auth-benefit-num">01</div>
              <div className="auth-benefit-content">
                <h3>Sans carte bancaire</h3>
                <p>Aucun engagement. Aucun frais caché. Commencez gratuitement et passez à un plan payant uniquement si Sellia répond à vos besoins.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <div className="auth-benefit-num">02</div>
              <div className="auth-benefit-content">
                <h3>Vos paiements en moins de 5 minutes</h3>
                <p>Mobile Money (MTN, Orange, Wave, Moov), cartes Visa et Mastercard, virements bancaires — tout est préconfiguré pour vous.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <div className="auth-benefit-num">03</div>
              <div className="auth-benefit-content">
                <h3>Conçu pour l&apos;Afrique</h3>
                <p>Optimisé pour les connexions mobiles, les devises locales (FCFA), les modes de paiement régionaux et les pratiques commerciales africaines.</p>
              </div>
            </div>
          </div>

          {/* Footer security */}
          <div className="auth-security">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Sécurisé par Cloudflare · SSL TLS 1.3 · AES-256</span>
          </div>
        </div>
      </aside>

      {/* Panneau droit - Formulaire minimaliste */}
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
            <span className="auth-form-eyebrow">
              {shopName ? "Étape finale" : "Inscription"}
            </span>
            <h1 className="auth-form-title">
              {shopName ? <>Sauvegardez votre <em>boutique</em>.</> : <>Créez votre <em>compte</em>.</>}
            </h1>
            <p className="auth-form-subtitle">
              {shopName
                ? "Une seule étape avant de pouvoir publier votre boutique."
                : "Pas de carte bancaire. Pas de configuration. Juste votre email."}
            </p>
          </div>

          {/* Bouton Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignup}
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

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className={`auth-field ${errors.form ? "auth-field-error" : ""}`}>
              <label htmlFor="firstName">Prénom</label>
              <div className="auth-input-wrapper">
                <input
                  id="firstName"
                  type="text"
                  placeholder="Votre prénom"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.form) setErrors({ ...errors, form: "" });
                  }}
                  autoComplete="given-name"
                  required
                  autoFocus
                />
              </div>
            </div>

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
              <label htmlFor="password">Mot de passe</label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  placeholder="Minimum 8 caractères"
                  autoComplete="new-password"
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
              {password && (
                <div className="auth-password-strength">
                  <div className="auth-strength-bars">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`auth-strength-bar ${
                          i <= passwordStrength ? `auth-strength-${passwordStrength}` : ""
                        }`}
                      ></div>
                    ))}
                  </div>
                  <span className={`auth-strength-label auth-strength-label-${passwordStrength}`}>
                    {passwordLabel}
                  </span>
                </div>
              )}
              {errors.password && <span className="auth-field-message">{errors.password}</span>}
            </div>

            <label className={`auth-checkbox ${errors.terms ? "auth-checkbox-error" : ""}`}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (errors.terms) setErrors({ ...errors, terms: "" });
                }}
              />
              <span className="auth-checkbox-mark"></span>
              <span className="auth-checkbox-text">
                J&apos;accepte les <Link href="/conditions" className="auth-link">conditions</Link> et la <Link href="/confidentialite" className="auth-link">politique de confidentialité</Link>
              </span>
            </label>
            {errors.terms && <span className="auth-field-message">{errors.terms}</span>}
            {errors.form && <span className="auth-field-message">{errors.form}</span>}

            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
            >
              {isLoading ? (
                <>
                  <span className="auth-spinner"></span>
                  <span>Création du compte...</span>
                </>
              ) : (
                <>
                  <span>{shopName ? "Sauvegarder ma boutique" : "Créer mon compte"}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </>
              )}
            </button>
          </form>

          <p className="auth-alt-link">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="auth-link auth-link-strong">
              Se connecter
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
