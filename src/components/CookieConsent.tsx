"use client";

import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_NAME,
  COOKIE_PREFS_EVENT,
  parseConsent,
  serializeConsentCookie,
  type CookieConsentValue,
} from "@/lib/cookie-consent";

function readClientConsent(): CookieConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_CONSENT_NAME}=`));
  if (!match) return null;
  return parseConsent(match.slice(COOKIE_CONSENT_NAME.length + 1));
}

const INK = "#0E1116";
const IVORY = "#FAFAF7";
const EMBER = "#E84B1F";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    // Affiche la bannière uniquement si aucun consentement enregistré.
    if (!readClientConsent()) setOpen(true);

    // Permet de rouvrir le panneau depuis le footer ("Gérer les cookies").
    const reopen = () => {
      const existing = readClientConsent();
      setAnalytics(existing ? existing.analytics : true);
      setMarketing(existing ? existing.marketing : true);
      setCustomize(true);
      setOpen(true);
    };
    window.addEventListener(COOKIE_PREFS_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_PREFS_EVENT, reopen);
  }, []);

  const persist = (value: CookieConsentValue) => {
    document.cookie = serializeConsentCookie(value);
    setOpen(false);
    // Reload : le layout serveur re-évalue le consentement et (dé)monte les
    // trackers en conséquence. Simple et fiable (cf. RGPD : pas de hot-load).
    if (typeof window !== "undefined") window.location.reload();
  };

  const acceptAll = () =>
    persist({ essential: true, analytics: true, marketing: true, ts: Date.now() });
  const rejectAll = () =>
    persist({ essential: true, analytics: false, marketing: false, ts: Date.now() });
  const saveChoices = () =>
    persist({ essential: true, analytics, marketing, ts: Date.now() });

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Préférences de cookies"
      aria-modal="false"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 2147483000,
        maxWidth: 480,
        margin: "0 auto",
        background: "#FFFFFF",
        color: INK,
        border: "1px solid #E5E2DA",
        borderRadius: 16,
        boxShadow: "0 12px 40px rgba(14,17,22,0.18)",
        padding: 20,
        fontFamily:
          "var(--font-sans), Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span aria-hidden style={{ fontSize: 18 }}>🍪</span>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: INK }}>
          Vos préférences de cookies
        </h2>
      </div>

      <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.55, color: "#4B5563" }}>
        Nous utilisons des cookies essentiels au fonctionnement du site. Avec votre
        accord, nous utilisons aussi des cookies de mesure d&apos;audience et
        marketing.{" "}
        <a
          href="/cookies"
          style={{ color: EMBER, fontWeight: 600, textDecoration: "none" }}
        >
          En savoir plus
        </a>
        .
      </p>

      {customize && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <CategoryRow
            title="Essentiels"
            desc="Session, sécurité, panier. Toujours actifs."
            checked
            disabled
          />
          <CategoryRow
            title="Mesure d'audience"
            desc="Statistiques de visite anonymisées."
            checked={analytics}
            onChange={setAnalytics}
          />
          <CategoryRow
            title="Marketing"
            desc="Pixels Meta, TikTok, Snap, Google."
            checked={marketing}
            onChange={setMarketing}
          />
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {!customize ? (
          <>
            <button type="button" onClick={acceptAll} style={btnPrimary}>
              Tout accepter
            </button>
            <button type="button" onClick={rejectAll} style={btnSecondary}>
              Refuser
            </button>
            <button
              type="button"
              onClick={() => setCustomize(true)}
              style={btnGhost}
            >
              Personnaliser
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={saveChoices} style={btnPrimary}>
              Enregistrer mes choix
            </button>
            <button type="button" onClick={acceptAll} style={btnSecondary}>
              Tout accepter
            </button>
            <button type="button" onClick={rejectAll} style={btnGhost}>
              Refuser
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  border: "1px solid transparent",
  flex: "1 1 auto",
};
const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: EMBER,
  color: "#FFFFFF",
};
const btnSecondary: React.CSSProperties = {
  ...btnBase,
  background: IVORY,
  color: INK,
  border: "1px solid #E5E2DA",
};
const btnGhost: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: "#6B7280",
};

function CategoryRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 12px",
        background: IVORY,
        border: "1px solid #E5E2DA",
        borderRadius: 10,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.8 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ marginTop: 2, accentColor: EMBER }}
      />
      <span>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: INK }}>
          {title}
        </span>
        <span style={{ fontSize: 11.5, color: "#6B7280" }}>{desc}</span>
      </span>
    </label>
  );
}
