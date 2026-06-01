"use client";

import { useState, useTransition } from "react";
import { Sparkle, Lightbulb, ArrowClockwise } from "@phosphor-icons/react";
import { generateMerchantAdviceAction } from "@/app/actions/ai-advice";

interface Advice {
  titre: string;
  conseil: string;
  priorite: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  haute: "#dc2626",
  moyenne: "#E84B1F",
  basse: "#16a34a",
};

export default function AiAdviceCard() {
  const [advice, setAdvice] = useState<Advice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const res = await generateMerchantAdviceAction();
      if (res.ok) {
        setAdvice(res.advice);
      } else {
        setError(res.error || "Erreur");
      }
    });
  };

  return (
    <div
      className="dash-settings-card"
      style={{
        background:
          "linear-gradient(135deg, var(--dash-bg-active), rgba(232, 75, 31, 0.03))",
        borderColor: "rgba(232, 75, 31, 0.15)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: advice ? "16px" : "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #E84B1F, #ff6b3d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <Sparkle size={20} weight="duotone" />
          </div>
          <div>
            <h3 className="dash-settings-card-title" style={{ margin: 0 }}>
              Conseils personnalisés
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "var(--dash-text-secondary)",
              }}
            >
              Boostés par l&apos;IA, basés sur votre activité
            </p>
          </div>
        </div>
        {advice && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            className="dash-btn dash-btn-ghost dash-btn-sm"
            title="Régénérer"
          >
            <ArrowClockwise size={14} weight="bold" />
          </button>
        )}
      </div>

      {!advice && !isPending && (
        <button
          type="button"
          onClick={handleGenerate}
          className="dash-btn dash-btn-ember dash-btn-sm"
        >
          <Lightbulb size={14} weight="duotone" style={{ marginRight: "6px" }} />
          Obtenir mes conseils
        </button>
      )}

      {isPending && (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "var(--dash-text-secondary)",
            fontSize: "13px",
          }}
        >
          L&apos;IA analyse votre activité...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(220,38,38,0.06)",
            borderRadius: "8px",
            color: "var(--dash-danger)",
            fontSize: "12.5px",
          }}
        >
          {error}
        </div>
      )}

      {advice && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {advice.map((a, i) => (
            <div
              key={i}
              style={{
                padding: "12px 14px",
                background: "white",
                border: "1px solid var(--dash-border)",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: PRIORITY_COLORS[a.priorite] || "#E84B1F",
                    flexShrink: 0,
                  }}
                />
                <strong
                  style={{ fontSize: "13px", color: "var(--dash-text-primary)" }}
                >
                  {a.titre}
                </strong>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12.5px",
                  color: "var(--dash-text-secondary)",
                  lineHeight: 1.5,
                  paddingLeft: "14px",
                }}
              >
                {a.conseil}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
