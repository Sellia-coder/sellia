/**
 * Consentement cookies (RGPD-like) — helpers purs (sans next/headers ni document),
 * partagés entre le composant client (lecture/écriture document.cookie) et le
 * layout serveur (gating SSR des trackers via next/headers).
 */

export const COOKIE_CONSENT_NAME = "sellia_cookie_consent";

/** Évènement window pour rouvrir le panneau de préférences (lien footer). */
export const COOKIE_PREFS_EVENT = "sellia:open-cookie-preferences";

/** Durée de vie du consentement : 6 mois. */
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

export interface CookieConsentValue {
  /** Toujours true — cookies essentiels non désactivables. */
  essential: true;
  /** Mesure d'audience (Analytics). */
  analytics: boolean;
  /** Pixels marketing (Meta, TikTok, Snap, GA4). */
  marketing: boolean;
  /** Timestamp (ms) du choix. */
  ts: number;
}

/** Parse une valeur de cookie (string JSON, éventuellement URL-encodée). */
export function parseConsent(
  raw: string | undefined | null
): CookieConsentValue | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const v = JSON.parse(decoded) as Record<string, unknown>;
    if (!v || typeof v !== "object") return null;
    return {
      essential: true,
      analytics: v.analytics === true,
      marketing: v.marketing === true,
      ts: typeof v.ts === "number" ? v.ts : Date.now(),
    };
  } catch {
    return null;
  }
}

/** Sérialise une chaîne `document.cookie` complète (client). */
export function serializeConsentCookie(value: CookieConsentValue): string {
  const json = encodeURIComponent(JSON.stringify(value));
  return `${COOKIE_CONSENT_NAME}=${json}; Max-Age=${COOKIE_CONSENT_MAX_AGE}; Path=/; SameSite=Lax`;
}
