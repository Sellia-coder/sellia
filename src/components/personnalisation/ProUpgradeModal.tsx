"use client";

import { useState, useTransition, useEffect } from "react";
import {
  X,
  Truck,
  CheckCircle,
  Lock,
  TrendUp,
  ShieldCheck,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";
import { initiateCodUnlockAction, devUnlockCodAction } from "@/app/actions/feature-unlock";

interface Props {
  open: boolean;
  onClose: () => void;
  onUnlocked?: () => void;
}

const UNLOCK_PRICE = 1900;

const BENEFITS = [
  { Icon: TrendUp, label: "Conversion x2", desc: "Vos clients hésitent moins quand ils peuvent payer à la réception" },
  { Icon: ShieldCheck, label: "Confiance renforcée", desc: "Pratique standard des marchands africains" },
  { Icon: Truck, label: "Livraison + paiement", desc: "Le client règle directement au livreur" },
  { Icon: CheckCircle, label: "Gestion intégrée", desc: "Statut commande et paiement suivis dans le dashboard" },
];

export default function ProUpgradeModal({ open, onClose, onUnlocked }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleUnlock = () => {
    setError(null);
    startTransition(async () => {
      const res = await initiateCodUnlockAction();
      if (res.ok && res.paymentUrl) {
        const dev = await devUnlockCodAction();
        if (dev.ok) {
          onUnlocked?.();
          onClose();
        } else {
          setError(dev.error || "Erreur");
        }
      } else {
        setError(res.error || "Erreur");
      }
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(14, 17, 22, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 9999,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "32px 32px 24px",
            background: "linear-gradient(135deg, #FAFAF7 0%, rgba(232, 75, 31, 0.04) 100%)",
            borderRadius: "20px 20px 0 0",
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "white",
              border: "1px solid var(--dash-border, #E5E5E0)",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#0E1116",
            }}
            aria-label="Fermer"
          >
            <X size={16} weight="bold" />
          </button>

          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #E84B1F, #ff6b3d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 8px 24px rgba(232, 75, 31, 0.3)",
              marginBottom: "16px",
            }}
          >
            <Truck size={28} weight="duotone" />
          </div>

          <div
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: "#E84B1F",
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            Fonctionnalité premium
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontFamily: "'Fraunces', serif",
              fontSize: "28px",
              fontWeight: 500,
              lineHeight: 1.15,
              color: "#0E1116",
              letterSpacing: "-0.5px",
            }}
          >
            Activez le paiement <em style={{ color: "#E84B1F" }}>à la livraison</em>
          </h2>

          <p style={{ margin: 0, fontSize: "14px", color: "#4B5563", lineHeight: 1.5 }}>
            Offrez à vos clients la possibilité de régler en espèces au moment de la livraison — le levier #1 pour booster vos conversions en Afrique.
          </p>
        </div>

        <div style={{ padding: "20px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                style={{
                  padding: "12px",
                  background: "var(--dash-bg-active, #FAFAF7)",
                  border: "1px solid var(--dash-border, #E5E5E0)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <b.Icon size={20} weight="duotone" color="#E84B1F" style={{ flexShrink: 0, marginTop: "1px" }} />
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#0E1116", marginBottom: "2px" }}>{b.label}</div>
                  <div style={{ fontSize: "11px", color: "#6B7280", lineHeight: 1.4 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 32px 24px" }}>
          <div
            style={{
              padding: "20px",
              background: "linear-gradient(135deg, rgba(232, 75, 31, 0.06), rgba(232, 75, 31, 0.02))",
              border: "1.5px solid rgba(232, 75, 31, 0.2)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#E84B1F",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                Activation unique
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: "36px",
                    fontWeight: 500,
                    color: "#0E1116",
                    letterSpacing: "-1px",
                  }}
                >
                  {UNLOCK_PRICE.toLocaleString("fr-FR")}
                </span>
                <span style={{ fontSize: "14px", color: "#4B5563", fontWeight: 500 }}>FCFA</span>
              </div>
              <div style={{ fontSize: "11.5px", color: "#6B7280", marginTop: "4px" }}>
                Sans engagement · Sans abonnement · Activé à vie
              </div>
            </div>
            <Lock size={32} weight="duotone" color="#E84B1F" style={{ flexShrink: 0 }} />
          </div>

          {error && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                background: "rgba(220, 38, 38, 0.06)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                borderRadius: "10px",
                color: "#dc2626",
                fontSize: "12.5px",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div
          style={{
            padding: "16px 32px 24px",
            borderTop: "1px solid var(--dash-border, #E5E5E0)",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 18px",
              background: "white",
              border: "1px solid var(--dash-border, #E5E5E0)",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              color: "#4B5563",
            }}
          >
            Plus tard
          </button>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={isPending}
            style={{
              padding: "10px 22px",
              background: "linear-gradient(135deg, #E84B1F, #ff6b3d)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(232, 75, 31, 0.25)",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? (
              "Traitement..."
            ) : (
              <>
                <CurrencyCircleDollar size={16} weight="duotone" />
                Activer pour {UNLOCK_PRICE.toLocaleString("fr-FR")} FCFA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
