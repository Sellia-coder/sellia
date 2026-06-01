"use client";

import { useState, useTransition } from "react";
import { confirmDeliveryAction } from "@/app/actions/delivery";

interface Props {
  orderNumber: string;
  shopSlug: string;
  signature: string;
  primaryColor: string;
}

export default function LivraisonClient({
  orderNumber,
  shopSlug,
  signature,
  primaryColor,
}: Props) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = (i: number, val: string) => {
    if (val && !/^\d$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    setError(null);
    if (val && i < 5) {
      document.getElementById(`dcode-${i + 1}`)?.focus();
    }
  };

  const handleSubmit = () => {
    const full = code.join("");
    if (full.length !== 6) {
      setError("Entrez les 6 chiffres du code de confirmation");
      return;
    }
    startTransition(async () => {
      const res = await confirmDeliveryAction({
        orderNumber,
        shopSlug,
        signature,
        code: full,
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(res.error || "Erreur");
        setCode(["", "", "", "", "", ""]);
      }
    });
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#DCFCE7",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#15803D"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontSize: "20px", color: "#15803D", margin: "0 0 8px" }}>
          Livraison confirmée
        </h2>
        <p style={{ fontSize: "14px", color: "#4B5563", margin: 0 }}>
          Le paiement a été libéré au marchand. Merci de votre confiance.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <div
        style={{
          padding: "14px 16px",
          background: "rgba(232,75,31,0.06)",
          border: "1px solid rgba(232,75,31,0.18)",
          borderRadius: "12px",
          marginBottom: "16px",
        }}
      >
        <strong style={{ fontSize: "14px", color: "#0E1116" }}>
          Confirmation de réception
        </strong>
        <p
          style={{
            fontSize: "12.5px",
            color: "#4B5563",
            margin: "4px 0 0",
            lineHeight: 1.5,
          }}
        >
          Le client saisit le code à 6 chiffres reçu par email pour confirmer la
          réception du colis. Les fonds seront libérés au marchand.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        {code.map((d, i) => (
          <input
            key={i}
            id={`dcode-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !code[i] && i > 0) {
                document.getElementById(`dcode-${i - 1}`)?.focus();
              }
            }}
            style={{
              width: "44px",
              height: "52px",
              textAlign: "center",
              fontSize: "22px",
              fontWeight: 600,
              border: `1.5px solid ${error ? "#dc2626" : "#E5E5E0"}`,
              borderRadius: "10px",
              outline: "none",
            }}
          />
        ))}
      </div>

      {error && (
        <div
          style={{
            textAlign: "center",
            color: "#dc2626",
            fontSize: "12.5px",
            marginBottom: "12px",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || code.join("").length !== 6}
        style={{
          width: "100%",
          padding: "13px",
          background: primaryColor,
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          opacity: isPending || code.join("").length !== 6 ? 0.6 : 1,
        }}
      >
        {isPending ? "Vérification..." : "Confirmer la réception"}
      </button>
    </div>
  );
}
