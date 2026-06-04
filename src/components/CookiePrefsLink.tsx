"use client";

import { COOKIE_PREFS_EVENT } from "@/lib/cookie-consent";

/**
 * Lien "Gérer les cookies" : ré-ouvre le panneau de préférences (CookieConsent
 * écoute l'évènement window). À placer dans le footer.
 */
export default function CookiePrefsLink({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      className={className}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        font: "inherit",
        color: "inherit",
        ...style,
      }}
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFS_EVENT))}
    >
      Gérer les cookies
    </button>
  );
}
