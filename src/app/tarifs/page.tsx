import {
  SELLIA_PLANS,
  CARTEVO_FEES,
  COUNTRY_LABELS,
} from "@/lib/cartevo/pricing";
import { Check, Info } from "lucide-react";
import Link from "next/link";
import PricingCalculator from "./PricingCalculator";

export const metadata = {
  title: "Tarifs transparents — Sellia",
  description:
    "Découvrez nos tarifs simples et nos frais opérateur par pays.",
};

export default function PricingPage() {
  return (
    <div
      style={{
        padding: "64px 24px 96px",
        background: "#FAFAF7",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              color: "#E84B1F",
              marginBottom: 16,
            }}
          >
            TARIFS TRANSPARENTS
          </div>
          <h1
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: 48,
              fontWeight: 500,
              color: "#0A0E13",
              letterSpacing: "-1.5px",
              margin: "0 0 16px",
              lineHeight: 1.15,
            }}
          >
            Pas de frais cachés.
            <br />
            Jamais.
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "#6B6E76",
              lineHeight: 1.55,
              maxWidth: 580,
              margin: "0 auto",
            }}
          >
            Vos clients paient le prix affiché. Vous voyez exactement ce que vous
            recevez avant même la première vente.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            marginBottom: 80,
          }}
        >
          {(["free", "pro", "business"] as const).map((id) => {
            const plan = SELLIA_PLANS[id];
            return (
              <div
                key={id}
                style={{
                  background: "#FFFFFF",
                  border: plan.highlighted
                    ? "2px solid #E84B1F"
                    : "1px solid #ECE9E2",
                  borderRadius: 24,
                  padding: "32px 28px",
                  position: "relative",
                }}
              >
                {plan.highlighted && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      right: 20,
                      background: "#E84B1F",
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                      padding: "5px 14px",
                      borderRadius: 100,
                    }}
                  >
                    Le plus populaire
                  </div>
                )}
                <h3
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontSize: 26,
                    fontWeight: 500,
                    margin: "0 0 8px",
                  }}
                >
                  {plan.name}
                </h3>
                <div style={{ marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: "Fraunces, serif",
                      fontSize: 44,
                      fontWeight: 500,
                      letterSpacing: "-1.2px",
                    }}
                  >
                    {plan.monthlyFee === 0
                      ? "0"
                      : plan.monthlyFee.toLocaleString("fr-FR")}
                  </span>
                  <span style={{ fontSize: 14, color: "#6B6E76", marginLeft: 4 }}>
                    FCFA{plan.monthlyFee > 0 ? "/mois" : ""}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: "#6B6E76", marginBottom: 24 }}>
                  + <strong>{plan.commissionRate}%</strong> de commission par vente
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 28px",
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
                        gap: 8,
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      <Check
                        size={14}
                        color="#16A34A"
                        style={{ marginTop: 3, flexShrink: 0 }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={
                    id === "free" ? "/inscription" : `/inscription?plan=${id}`
                  }
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "14px 20px",
                    background: plan.highlighted ? "#E84B1F" : "#FFFFFF",
                    color: plan.highlighted ? "#FFFFFF" : "#0A0E13",
                    border: `1.5px solid ${plan.highlighted ? "#E84B1F" : "#ECE9E2"}`,
                    borderRadius: 14,
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  {id === "free" ? "Commencer" : "Choisir ce plan"}
                </Link>
              </div>
            );
          })}
        </div>

        <div style={{ marginBottom: 80 }}>
          <h2
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: 32,
              fontWeight: 500,
              textAlign: "center",
              margin: "0 0 16px",
            }}
          >
            Calculez vos revenus en 10 secondes
          </h2>
          <p
            style={{
              textAlign: "center",
              fontSize: 15,
              color: "#6B6E76",
              marginBottom: 32,
            }}
          >
            Combien vous gagnez sur chaque vente, selon votre pays et votre plan.
          </p>
          <PricingCalculator />
        </div>

        <div>
          <h2
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: 32,
              fontWeight: 500,
              textAlign: "center",
              margin: "0 0 8px",
            }}
          >
            Frais opérateur par pays
          </h2>
          <p
            style={{
              textAlign: "center",
              fontSize: 15,
              color: "#6B6E76",
              marginBottom: 32,
            }}
          >
            Prélevés par les opérateurs Mobile Money lors de la collecte et du
            retrait.
          </p>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              border: "1px solid #ECE9E2",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0A0E13" }}>
                  <th
                    style={{
                      padding: "14px 20px",
                      color: "#FFFFFF",
                      textAlign: "left",
                      fontSize: 12,
                    }}
                  >
                    Pays
                  </th>
                  <th
                    style={{
                      padding: "14px 20px",
                      color: "#FFFFFF",
                      textAlign: "left",
                      fontSize: 12,
                    }}
                  >
                    Frais collecte
                  </th>
                  <th
                    style={{
                      padding: "14px 20px",
                      color: "#FFFFFF",
                      textAlign: "left",
                      fontSize: 12,
                    }}
                  >
                    Frais retrait
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(CARTEVO_FEES).map(([code, fees], idx) => (
                  <tr
                    key={code}
                    style={{
                      background: idx % 2 === 0 ? "#FFFFFF" : "#FAFAF7",
                      borderTop: "1px solid #F0EDE5",
                    }}
                  >
                    <td style={{ padding: "14px 20px", fontSize: 14 }}>
                      {COUNTRY_LABELS[code as keyof typeof COUNTRY_LABELS]}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 14 }}>
                      {fees.perOperator
                        ? Object.entries(fees.perOperator)
                            .map(([op, o]) => `${op.toUpperCase()}: ${o.payin}%`)
                            .join(" / ")
                        : `${fees.defaultPayin}%`}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 14 }}>
                      {fees.defaultPayout}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: 24,
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderLeft: "3px solid #16A34A",
              borderRadius: 12,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#15803D",
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Info size={14} /> Transparence des frais
            </div>
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 18px",
                fontSize: 13,
                color: "#15803D",
                lineHeight: 1.6,
              }}
            >
              <li>Vous choisissez par produit qui paye les frais</li>
              <li>Aucun frais caché sur chaque vente</li>
              <li>Plan Découverte sans abonnement mensuel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
