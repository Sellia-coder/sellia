"use client";

import { useEffect, useState } from "react";

interface Props {
  endsAt: string | Date;
  /** Couleur de marque de la boutique (--shop-primary). */
  primaryColor?: string;
}

const BLOCKS: { key: "d" | "h" | "m" | "s"; label: string }[] = [
  { key: "d", label: "Jours" },
  { key: "h", label: "Heures" },
  { key: "m", label: "Min" },
  { key: "s", label: "Sec" },
];

export default function PromoCountdown({ endsAt, primaryColor }: Props) {
  // ⚠️ Hydratation : `now` démarre à `null` (déterministe côté serveur ET au
  // premier render client) → aucun appel à Date.now() au render initial, donc
  // aucun mismatch SSR/CSR (cause de l'intermittence + du « 1 Issue » en dev).
  // On ne calcule le temps restant qu'APRÈS le montage, dans l'effet.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Avant le montage : rien (identique SSR/CSR → hydratation propre).
  if (now === null) return null;

  const target = new Date(endsAt).getTime();
  if (Number.isNaN(target)) return null;

  const diff = target - now;
  if (diff <= 0) return null; // Offre terminée → rien.

  const primary = primaryColor || "#E84B1F";
  const values = {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };

  return (
    <div
      style={{
        margin: "4px 0 8px",
        padding: "14px 16px",
        borderRadius: 16,
        background: `linear-gradient(135deg, ${primary}14, ${primary}08)`,
        border: `1px solid ${primary}26`,
      }}
    >
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: 0.2,
          color: primary,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span aria-hidden>⏳</span>
        Offre limitée — se termine dans :
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {BLOCKS.map((b) => (
          <div
            key={b.key}
            style={{
              flex: 1,
              minWidth: 0,
              background: "#FFFFFF",
              borderRadius: 12,
              padding: "10px 4px",
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(14,17,22,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                lineHeight: 1,
                color: "#0E1116",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(values[b.key]).padStart(2, "0")}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                color: "#8B8E94",
                marginTop: 5,
              }}
            >
              {b.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
