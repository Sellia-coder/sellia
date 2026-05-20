"use client";

import { useState } from "react";
import { RotateCw, ArrowDownToLine, Info } from "lucide-react";
import type { PayoutBreakdown } from "@/lib/cartevo/pricing";

interface Props {
  shopId: string;
  title: string;
  subtitle: string;
  amount: number;
  color: string;
  balanceKey: "payin" | "payout";
  projection?: PayoutBreakdown;
  country: string;
}

export default function BalanceCard({
  shopId,
  title,
  subtitle,
  amount,
  color,
  balanceKey,
  projection,
  country,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(amount);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/dashboard/shops/${shopId}/balance`);
      const data = await res.json();
      if (data.ok) {
        setCurrentAmount(balanceKey === "payin" ? data.payin : data.payout);
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="dash-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            className="dash-text-muted"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 13, color: "#6B6E76", marginTop: 4 }}>
            {subtitle}
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="dash-btn-icon"
          title="Synchroniser"
        >
          <RotateCw
            size={14}
            className={refreshing ? "dash-spin" : ""}
          />
        </button>
      </div>

      <div
        style={{
          marginTop: 18,
          fontFamily: "Fraunces, serif",
          fontSize: 38,
          fontWeight: 500,
          color,
          letterSpacing: "-1px",
        }}
      >
        {currentAmount.toLocaleString("fr-FR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}{" "}
        <span style={{ fontSize: 18, color: "#6B6E76" }}>FCFA</span>
      </div>

      {projection && balanceKey === "payin" && currentAmount > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            background: "#FAFAF7",
            borderRadius: 10,
            fontSize: 12.5,
            color: "#6B6E76",
            lineHeight: 1.55,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
              color: "#0A0E13",
              fontWeight: 500,
            }}
          >
            <Info size={12} /> Projection retrait MTN ({country})
          </div>
          Si vous retirez tout :{" "}
          <strong style={{ color: "#0A0E13" }}>
            {projection.merchantReceives.toLocaleString("fr-FR")} FCFA
          </strong>
          <br />
          (Frais opérateur {projection.cartevoRate}% : -
          {projection.cartevoFee.toLocaleString("fr-FR")} FCFA)
        </div>
      )}

      {balanceKey === "payin" && currentAmount > 0 && (
        <button
          type="button"
          className="dash-btn dash-btn-primary"
          style={{ marginTop: 14, width: "100%", background: color }}
          disabled
        >
          <ArrowDownToLine size={14} />
          Retirer (bientôt)
        </button>
      )}
    </div>
  );
}
