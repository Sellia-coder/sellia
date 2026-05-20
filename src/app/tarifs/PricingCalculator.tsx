"use client";

import { useState, useMemo } from "react";
import {
  SELLIA_PLANS,
  COUNTRY_LABELS,
  computeCollectFees,
} from "@/lib/cartevo/pricing";

const OPERATORS_BY_COUNTRY: Record<string, string[]> = {
  CM: ["mtn", "orange"],
  CI: ["mtn", "orange", "wave", "moov"],
  SN: ["orange", "wave", "free"],
  BJ: ["mtn", "moov"],
  BF: ["orange", "moov"],
  ML: ["orange", "moov"],
  GA: ["airtel"],
  TG: ["tmoney", "flooz"],
  CD: ["vodacom", "orange", "airtel"],
  NE: ["airtel", "moov"],
  TD: ["airtel"],
  CG: ["mtn", "airtel"],
  GN: ["mtn", "orange"],
};

export default function PricingCalculator() {
  const [amount, setAmount] = useState(10000);
  const [country, setCountry] = useState("CM");
  const [operator, setOperator] = useState("mtn");
  const [plan, setPlan] = useState<"free" | "pro" | "business">("free");
  const [feeMode, setFeeMode] = useState<
    "merchant_absorbs" | "customer_pays" | "split_50_50"
  >("merchant_absorbs");

  const fees = useMemo(() => {
    try {
      return computeCollectFees({
        baseAmount: amount,
        country,
        operator,
        shopPlan: plan,
        feeMode,
      });
    } catch {
      return null;
    }
  }, [amount, country, operator, plan, feeMode]);

  const availableOperators = OPERATORS_BY_COUNTRY[country] || ["mtn"];

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #ECE9E2",
        borderRadius: 24,
        padding: 32,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 32,
      }}
    >
      <div>
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "#6B6E76",
              marginBottom: 8,
            }}
          >
            MONTANT DE LA VENTE
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "14px 18px",
              fontSize: 20,
              border: "1px solid #ECE9E2",
              borderRadius: 12,
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "#6B6E76",
              marginBottom: 8,
            }}
          >
            PAYS
          </label>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setOperator((OPERATORS_BY_COUNTRY[e.target.value] || ["mtn"])[0]);
            }}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #ECE9E2",
              borderRadius: 12,
            }}
          >
            {Object.entries(COUNTRY_LABELS).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "#6B6E76",
              marginBottom: 8,
            }}
          >
            OPÉRATEUR
          </label>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #ECE9E2",
              borderRadius: 12,
            }}
          >
            {availableOperators.map((op) => (
              <option key={op} value={op}>
                {op.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "#6B6E76",
              marginBottom: 8,
            }}
          >
            PLAN
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {(["free", "pro", "business"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPlan(id)}
                style={{
                  padding: "10px 8px",
                  fontSize: 13,
                  fontWeight: 600,
                  background: plan === id ? "#0A0E13" : "#FFFFFF",
                  color: plan === id ? "#FFFFFF" : "#0A0E13",
                  border: `1px solid ${plan === id ? "#0A0E13" : "#ECE9E2"}`,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                {SELLIA_PLANS[id].name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "#6B6E76",
              marginBottom: 8,
            }}
          >
            QUI PAIE LES FRAIS
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { v: "merchant_absorbs" as const, l: "J'absorbe" },
              { v: "customer_pays" as const, l: "Le client paie" },
              { v: "split_50_50" as const, l: "Partage 50/50" },
            ].map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setFeeMode(opt.v)}
                style={{
                  padding: "10px 14px",
                  fontSize: 13,
                  textAlign: "left",
                  background: feeMode === opt.v ? "#E84B1F" : "#FFFFFF",
                  color: feeMode === opt.v ? "#FFFFFF" : "#0A0E13",
                  border: `1px solid ${feeMode === opt.v ? "#E84B1F" : "#ECE9E2"}`,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {fees && (
        <div
          style={{
            background: "#FAFAF7",
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#6B6E76",
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            RÉSULTAT
          </div>

          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #ECE9E2" }}>
            <div style={{ fontSize: 12, color: "#6B6E76", marginBottom: 4 }}>
              Le client paie
            </div>
            <div
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: 38,
                fontWeight: 500,
                color: "#0A0E13",
              }}
            >
              {fees.customerPays.toLocaleString("fr-FR")}{" "}
              <span style={{ fontSize: 16, color: "#6B6E76" }}>FCFA</span>
            </div>
          </div>

          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #ECE9E2" }}>
            <div style={{ fontSize: 12, color: "#6B6E76", marginBottom: 4 }}>
              Vous recevez
            </div>
            <div
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: 38,
                fontWeight: 500,
                color: "#16A34A",
              }}
            >
              {fees.merchantReceives.toLocaleString("fr-FR")}{" "}
              <span style={{ fontSize: 16, color: "#6B6E76" }}>FCFA</span>
            </div>
          </div>

          <div style={{ fontSize: 13, color: "#6B6E76", lineHeight: 1.7 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Frais opérateur ({fees.cartevoRate}%)</span>
              <span>-{fees.cartevoFee.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Commission Sellia ({fees.selliaRate}%)</span>
              <span>-{fees.selliaFee.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
