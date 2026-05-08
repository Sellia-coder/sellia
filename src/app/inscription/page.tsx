"use client";

import type { FormEvent } from "react";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";

function InscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftShopId = searchParams.get("draftShopId");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shopName, setShopName] = useState<string | null>(null);
  const [draftPreview, setDraftPreview] = useState<{
    name: string;
    tagline?: string;
    emoji?: string;
    primaryColor?: string;
  } | null>(null);

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

  useEffect(() => {
    if (!draftShopId) return;

    let isMounted = true;
    fetch(`/api/shop/draft/${draftShopId}`)
      .then((res) => res.json())
      .then((result) => {
        if (!isMounted) return;
        if (result.success && result.data?.generatedData) {
          const data = result.data.generatedData;
          setDraftPreview({
            name: data.name || result.data.shopName,
            tagline: data.tagline,
            emoji: data.products?.[0]?.emoji || "🛍️",
            primaryColor: data.primaryColor,
          });
        }
      })
      .catch(() => {
        // Ignore : la preview est juste cosmétique
      });

    return () => {
      isMounted = false;
    };
  }, [draftShopId]);

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
    if (draftShopId) {
      formData.append("draftShopId", draftShopId);
    }

    const result = await signUpAction(formData);

    if (result.success) {
      const params = new URLSearchParams({
        email: result.email!,
      });
      if (draftShopId) {
        params.append("draftShopId", draftShopId);
      }
      router.push(`/verifier-email?${params.toString()}`);
    } else {
      setErrors((prev) => ({
        ...prev,
        form: result.error || "Une erreur est survenue.",
      }));
      setIsLoading(false);
    }
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

          {draftPreview && (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(232, 75, 31, 0.06), rgba(232, 75, 31, 0.02))",
                border: "1px solid rgba(232, 75, 31, 0.2)",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: draftPreview.primaryColor || "#0E1116",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                {draftPreview.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "10px",
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    color: "#E84B1F",
                    fontWeight: 600,
                    marginBottom: "2px",
                  }}
                >
                  Vous sauvegardez
                </div>
                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#0E1116",
                    lineHeight: 1.2,
                    marginBottom: "2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {draftPreview.name}
                </div>
                {draftPreview.tagline && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6E7178",
                      fontStyle: "italic",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {draftPreview.tagline}
                  </div>
                )}
              </div>
            </div>
          )}

          <a
            href={`/api/auth/google/start?intent=signup${draftShopId ? `&draftShopId=${encodeURIComponent(draftShopId)}` : ""}`}
            className="auth-google-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </a>

          <div className="auth-divider">
            <span className="auth-divider-text">OU AVEC VOTRE EMAIL</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <input type="hidden" name="draftShopId" value={draftShopId || ""} />
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

export default function Inscription() {
  return (
    <Suspense fallback={<div className="auth-page" />}>
      <InscriptionContent />
    </Suspense>
  );
}
