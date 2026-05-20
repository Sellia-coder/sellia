"use client";

import { useState } from "react";
import { Check, Crown, Zap } from "lucide-react";
import type { SelliaPlanConfig } from "@/lib/cartevo/pricing";

interface Props {
  shopId: string;
  plan: SelliaPlanConfig;
  isCurrent: boolean;
  isUpgrade: boolean;
}

export default function PlanCard({
  shopId,
  plan,
  isCurrent,
  isUpgrade,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (plan.id === "free") return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/shops/${shopId}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlan: plan.id }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="dash-card"
      style={{
        position: "relative",
        border: plan.highlighted ? "2px solid #E84B1F" : undefined,
      }}
    >
      {plan.highlighted && (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: 16,
            background: "#E84B1F",
            color: "#FFFFFF",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: 100,
          }}
        >
          Le plus populaire
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {plan.id === "pro" && <Zap size={16} color="#E84B1F" />}
        {plan.id === "business" && <Crown size={16} color="#7C3AED" />}
        <h3
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: 22,
            fontWeight: 500,
            color: "#0A0E13",
            margin: 0,
          }}
        >
          {plan.name}
        </h3>
      </div>

      <div style={{ marginBottom: 18 }}>
        <span
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: 36,
            fontWeight: 500,
            color: "#0A0E13",
            letterSpacing: "-1px",
          }}
        >
          {plan.monthlyFee === 0 ? "0" : plan.monthlyFee.toLocaleString("fr-FR")}
        </span>
        <span style={{ fontSize: 14, color: "#6B6E76", marginLeft: 4 }}>
          FCFA{plan.monthlyFee > 0 ? "/mois" : ""}
        </span>
      </div>

      <div style={{ fontSize: 14, color: "#6B6E76", marginBottom: 18 }}>
        + <strong style={{ color: "#0A0E13" }}>{plan.commissionRate}%</strong> de
        commission par vente
      </div>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {plan.features.map((f) => (
          <li
            key={f}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 13.5,
              color: "#0A0E13",
            }}
          >
            <Check size={14} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div
          style={{
            width: "100%",
            padding: "12px 20px",
            background: "#F0FDF4",
            color: "#16A34A",
            textAlign: "center",
            fontWeight: 600,
            fontSize: 13.5,
            borderRadius: 12,
            border: "1px solid #BBF7D0",
          }}
        >
          Votre plan actuel
        </div>
      ) : isUpgrade ? (
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={loading}
          className="dash-btn dash-btn-primary"
          style={{
            width: "100%",
            background: plan.highlighted ? "#E84B1F" : undefined,
          }}
        >
          {loading ? "Chargement..." : `Passer à ${plan.name}`}
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="dash-btn dash-btn-secondary"
          style={{ width: "100%", opacity: 0.6 }}
        >
          Rétrograder via support
        </button>
      )}
    </div>
  );
}
