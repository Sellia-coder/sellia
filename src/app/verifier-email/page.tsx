"use client";

import { useState, useEffect, useRef, Suspense, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { verifyOTPAction, resendOTPAction } from "@/app/actions/auth";
import AuthPostOtpTransition from "@/components/auth/AuthPostOtpTransition";

function VerifierEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const flowParam = searchParams.get("flow");
  let flow: "EMAIL_VERIFICATION" | "LOGIN" | "PASSWORD_RESET" = "EMAIL_VERIFICATION";
  if (flowParam === "login") flow = "LOGIN";
  else if (flowParam === "password_reset") flow = "PASSWORD_RESET";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCount, setResendCount] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus premier input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Accepter uniquement chiffres
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace : retour au précédent si vide
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // ArrowLeft / ArrowRight pour navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    } else if (pasted.length > 0) {
      const newCode = [...code];
      pasted.split("").forEach((char, i) => {
        if (i < 6) newCode[i] = char;
      });
      setCode(newCode);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Entrez les 6 chiffres.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("code", fullCode);

    if (flow === "PASSWORD_RESET") {
      const { verifyPasswordResetCodeAction } = await import("@/app/actions/auth");
      const result = await verifyPasswordResetCodeAction(formData);
      if (result.success && "resetToken" in result && result.resetToken) {
        router.push(`/reinitialiser-mot-de-passe?token=${encodeURIComponent(result.resetToken)}`);
      } else {
        setError((result as { error?: string }).error || "Code invalide.");
        setIsVerifying(false);
      }
      return;
    }

    formData.append("flow", flow);
    const result = await verifyOTPAction(formData);

    if (result.success) {
      const fallbackRedirect = flow === "LOGIN"
        ? "/dashboard"
        : "/personnaliser-ma-boutique";
      const redirectTo =
        "redirectTo" in result && result.redirectTo
          ? result.redirectTo
          : fallbackRedirect;

      if (flow === "EMAIL_VERIFICATION") {
        setTransitioning(true);
        await new Promise((r) => setTimeout(r, 600));
      }
      router.push(redirectTo);
    } else {
      setError(result.error || "Code invalide.");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError("");

    if (flow === "PASSWORD_RESET") {
      const { forgotPasswordAction } = await import("@/app/actions/auth");
      const formData = new FormData();
      formData.append("email", email);
      const result = await forgotPasswordAction(formData);
      if (!result.success) {
        setError(result.error || "Impossible de renvoyer le code.");
      } else {
        setResendCount(resendCount + 1);
        setResendCooldown(60);
        setError(null);
      }
      setIsResending(false);
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("flow", flow === "LOGIN" ? "LOGIN" : "EMAIL_VERIFICATION");

    const result = await resendOTPAction(formData);

    if (result.success) {
      setResendCount(resendCount + 1);
      setResendCooldown(60);
      setError(null);
    } else {
      setError(result.error || "Impossible de renvoyer le code.");
    }

    setIsResending(false);
  };

  const codeFilled = code.every(c => c !== "");

  const stepsConfig = (() => {
    if (flow === "LOGIN") {
      return {
        title: "Vérification de connexion",
        steps: [
          { title: "Identifiants validés", desc: "Email et mot de passe corrects", done: true },
          { title: "Vérification de sécurité", desc: "Code envoyé à votre email", active: true },
          { title: "Accès au dashboard", desc: "Reprenez là où vous êtes resté", done: false },
        ],
      };
    }
    if (flow === "PASSWORD_RESET") {
      return {
        title: "Réinitialisation sécurisée",
        steps: [
          { title: "Demande envoyée", desc: "Email de vérification reçu", done: true },
          { title: "Vérification du code", desc: "Saisissez le code à 6 chiffres", active: true },
          { title: "Nouveau mot de passe", desc: "Choisissez un mot de passe fort", done: false },
        ],
      };
    }
    return {
      title: "Bienvenue sur Sellia",
      steps: [
        { title: "Compte créé", desc: "Vos identifiants sont enregistrés", done: true },
        { title: "Vérification email", desc: "Saisissez le code reçu", active: true },
        { title: "Création boutique", desc: "Décrivez ce que vous vendez", done: false },
      ],
    };
  })();

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
              Vérifiez votre identité. <em>Et c&apos;est parti.</em>
            </h2>
            <p className="auth-editorial-sub">
              Nous protégeons votre compte dès le premier instant. Saisissez le code à 6 chiffres reçu par email pour activer votre boutique Sellia.
            </p>
          </div>
          <div className="auth-steps">
            {stepsConfig.steps.map((step, i) => (
              <Fragment key={i}>
                <div className={`auth-step ${step.done ? "auth-step-done" : ""} ${step.active ? "auth-step-active" : ""}`}>
                  <div className="auth-step-marker">
                    {step.done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : step.active ? (
                      <>
                        <span className="auth-step-pulse"></span>
                        {i + 1}
                      </>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="auth-step-content">
                    <span className="auth-step-title">{step.title}</span>
                    <span className="auth-step-desc">{step.desc}</span>
                  </div>
                </div>
                {i < stepsConfig.steps.length - 1 && <div className="auth-step-line"></div>}
              </Fragment>
            ))}
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="auth-verify-pulse"></span>
          </div>

          <div className="auth-form-header">
            <span className="auth-form-eyebrow">Étape 2 sur 4</span>
            <h1 className="auth-form-title">
              {flow === "PASSWORD_RESET"
                ? "Réinitialisation du mot de passe"
                : flow === "LOGIN"
                ? "Vérification de connexion"
                : "Vérifiez votre email"
              }
            </h1>
            <p className="auth-form-subtitle">
              {flow === "PASSWORD_RESET"
                ? "Entrez le code à 6 chiffres reçu par email pour valider votre identité et choisir un nouveau mot de passe."
                : flow === "LOGIN"
                ? <>Pour votre sécurité, nous avons envoyé un code à 6 chiffres à <strong>{email || "votre adresse email"}</strong>. Entrez-le ci-dessous pour finaliser la connexion.</>
                : <>Nous avons envoyé un code à 6 chiffres à <strong>{email || "votre adresse email"}</strong>. Entrez-le ci-dessous pour activer votre compte.</>
              }
            </p>
          </div>

          {/* Code input 6 chiffres */}
          <div className="auth-code-wrap">
            <label className="auth-code-label">Code de vérification</label>
            <div className="auth-code-inputs">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`auth-code-input ${error ? "has-error" : ""} ${digit ? "filled" : ""}`}
                  aria-label={`Chiffre ${index + 1}`}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                />
              ))}
            </div>
            {error && (
              <div className="auth-code-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{error}</span>
              </div>
            )}
            <p className="auth-code-help">
              Vous pouvez coller le code en entier dans le premier champ.
            </p>
          </div>

          {resendCount > 0 && (
            <div className="auth-success-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Email renvoyé avec succès</span>
            </div>
          )}

          <div className="auth-actions-stack">
            <button
              onClick={handleVerify}
              disabled={!codeFilled || isVerifying}
              className="auth-submit-btn"
            >
              {isVerifying ? (
                <>
                  <span className="auth-spinner"></span>
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <span>Vérifier mon email</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </>
              )}
            </button>

            <button
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className="auth-secondary-btn"
            >
              {isResending ? (
                <>
                  <span className="auth-spinner-sm"></span>
                  <span>Envoi en cours...</span>
                </>
              ) : resendCooldown > 0 ? (
                <span>Renvoyer le code dans {resendCooldown}s</span>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                  <span>Renvoyer le code</span>
                </>
              )}
            </button>
          </div>

          {/* Tips minimaliste */}
          <div className="auth-code-tips">
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

          <p className="auth-alt-link">
            <Link href="/inscription" className="auth-link">Modifier mon adresse email</Link>
            {" · "}
            <a href="mailto:support@getsellia.com" className="auth-link auth-link-strong">
              Contacter le support
            </a>
          </p>
        </div>

        <div className="auth-form-footer">
          <Link href="/conditions">Conditions</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </main>

      {transitioning && <AuthPostOtpTransition />}
    </div>
  );
}

export default function VerifierEmail() {
  return (
    <Suspense fallback={<div className="auth-page"><div className="auth-spinner" /></div>}>
      <VerifierEmailContent />
    </Suspense>
  );
}
