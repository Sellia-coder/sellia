"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import {
  X,
  Truck,
  CheckCircle,
  Lock,
  TrendUp,
  ShieldCheck,
  CurrencyCircleDollar,
  SpinnerGap,
  WarningCircle,
  DeviceMobile,
} from "@phosphor-icons/react";
import {
  payCodUnlockAction,
  pollCodUnlockPaymentAction,
  devUnlockCodAction,
  getCodUnlockPriceAction,
} from "@/app/actions/feature-unlock";
import { PaymentMethodsGrid } from "@/components/icons/momo-operators";
import {
  getOperatorsForCountry,
  getAllCountries,
  getOperatorInfo,
} from "@/lib/cartevo/operators-catalog";
import type { CartevoCountry } from "@/lib/cartevo/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onUnlocked?: () => void;
}

type ModalPhase = "form" | "pending" | "success" | "failed";

const UNLOCK_PRICE_DEFAULT = 1900;

const BENEFITS = [
  {
    Icon: TrendUp,
    label: "Conversion x2",
    desc: "Vos clients hésitent moins quand ils peuvent payer à la réception",
  },
  {
    Icon: ShieldCheck,
    label: "Confiance renforcée",
    desc: "Pratique standard des marchands africains",
  },
  {
    Icon: Truck,
    label: "Livraison + paiement",
    desc: "Le client règle directement au livreur",
  },
  {
    Icon: CheckCircle,
    label: "Gestion intégrée",
    desc: "Statut commande et paiement suivis dans le dashboard",
  },
];

function getMomoPlaceholder(code: string): string {
  const placeholders: Record<string, string> = {
    CM: "6XX XXX XXX",
    CI: "07 XX XX XX XX",
    SN: "7X XXX XX XX",
    BJ: "9X XX XX XX",
    TG: "9X XX XX XX",
    BF: "7X XX XX XX",
    ML: "7X XX XX XX",
    NE: "9X XX XX XX",
    CG: "0X XXX XXX",
    GA: "0X XX XX XX",
    GN: "62X XX XX XX",
    RW: "78X XXX XXX",
  };
  return placeholders[code] ?? "XXX XXX XXX";
}

export default function ProUpgradeModal({ open, onClose, onUnlocked }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [unlockPrice, setUnlockPrice] = useState(UNLOCK_PRICE_DEFAULT);
  const [phase, setPhase] = useState<ModalPhase>("form");
  const [country, setCountry] = useState<CartevoCountry>("CM");
  const [operator, setOperator] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [txId, setTxId] = useState<string | null>(null);
  const [pollFeedback, setPollFeedback] = useState<string | null>(null);
  const pollCancelledRef = useRef(false);

  const countries = getAllCountries();
  const operators = getOperatorsForCountry(country);
  const selectedOperator = operator ? getOperatorInfo(country, operator) : null;

  const resetState = useCallback(() => {
    setPhase("form");
    setError(null);
    setTxId(null);
    setPollFeedback(null);
    setOperator(null);
    setPhone("");
    pollCancelledRef.current = true;
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    pollCancelledRef.current = false;
    getCodUnlockPriceAction().then((res) => {
      if (res.ok) setUnlockPrice(res.amount);
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "pending") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, phase, resetState]);

  useEffect(() => {
    setOperator(null);
  }, [country]);

  useEffect(() => {
    if (phase !== "pending" || !txId) return;

    pollCancelledRef.current = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let pollCount = 0;

    const poll = async () => {
      if (pollCancelledRef.current) return;

      try {
        const res = await pollCodUnlockPaymentAction(txId);
        if (pollCancelledRef.current) return;

        if (res.ok && res.unlocked) {
          setPhase("success");
          setPollFeedback(null);
          onUnlocked?.();
          return;
        }

        if (res.ok && res.status === "failed") {
          setPhase("failed");
          setError("Le paiement n'a pas abouti. Vous pouvez réessayer.");
          setPollFeedback(null);
          return;
        }

        pollCount += 1;
        setPollFeedback(
          pollCount < 3
            ? "Confirmez le paiement sur votre téléphone…"
            : "Vérification en cours auprès de l'opérateur…"
        );
      } catch {
        // retry on network error
      }

      if (!pollCancelledRef.current) {
        const delay = pollCount < 5 ? 2000 : pollCount < 12 ? 5000 : 10000;
        timeoutId = setTimeout(poll, delay);
      }
    };

    timeoutId = setTimeout(poll, 2000);
    return () => {
      pollCancelledRef.current = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [phase, txId, onUnlocked]);

  if (!open) return null;

  const handlePay = () => {
    setError(null);
    if (!operator) {
      setError("Choisissez votre opérateur Mobile Money");
      return;
    }
    if (!phone.trim()) {
      setError("Entrez votre numéro Mobile Money");
      return;
    }

    startTransition(async () => {
      const res = await payCodUnlockAction({
        country,
        operator: operator as "mtn" | "orange" | "wave" | "moov" | "airtel",
        phoneNumber: phone.trim(),
      });

      if (!res.ok) {
        setError(res.error || "Erreur");
        return;
      }

      setTxId(res.cartevoTransactionId);
      setPhase("pending");
      setPollFeedback("Paiement initié — confirmez sur votre téléphone.");
    });
  };

  const handleRetry = () => {
    resetState();
  };

  const handleDevUnlock = () => {
    if (process.env.NODE_ENV !== "development") return;
    startTransition(async () => {
      const dev = await devUnlockCodAction();
      if (dev.ok) {
        onUnlocked?.();
        onClose();
      } else {
        setError(dev.error || "Erreur");
      }
    });
  };

  const handleClose = () => {
    if (phase === "pending") return;
    onClose();
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
      onClick={handleClose}
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
            onClick={handleClose}
            disabled={phase === "pending"}
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
              cursor: phase === "pending" ? "not-allowed" : "pointer",
              color: "#0E1116",
              opacity: phase === "pending" ? 0.5 : 1,
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
              background:
                phase === "success"
                  ? "linear-gradient(135deg, #16A34A, #22C55E)"
                  : "linear-gradient(135deg, #E84B1F, #ff6b3d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow:
                phase === "success"
                  ? "0 8px 24px rgba(22, 163, 74, 0.3)"
                  : "0 8px 24px rgba(232, 75, 31, 0.3)",
              marginBottom: "16px",
            }}
          >
            {phase === "success" ? (
              <CheckCircle size={28} weight="duotone" />
            ) : phase === "pending" ? (
              <SpinnerGap size={28} className="cod-unlock-spin" />
            ) : (
              <Truck size={28} weight="duotone" />
            )}
          </div>

          <div
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: phase === "success" ? "#16A34A" : "#E84B1F",
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            {phase === "success"
              ? "Activé"
              : phase === "pending"
                ? "Paiement en cours"
                : phase === "failed"
                  ? "Paiement échoué"
                  : "Fonctionnalité premium"}
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontFamily: "'Manrope', sans-serif",
              fontSize: "28px",
              fontWeight: 500,
              lineHeight: 1.15,
              color: "#0E1116",
              letterSpacing: "-0.5px",
            }}
          >
            {phase === "success" ? (
              <>
                Paiement à la livraison <em style={{ color: "#16A34A" }}>activé</em>
              </>
            ) : phase === "pending" ? (
              <>Confirmez le paiement sur votre téléphone</>
            ) : phase === "failed" ? (
              <>Le paiement n&apos;a pas abouti</>
            ) : (
              <>
                Activez le paiement <em style={{ color: "#E84B1F" }}>à la livraison</em>
              </>
            )}
          </h2>

          <p style={{ margin: 0, fontSize: "14px", color: "#4B5563", lineHeight: 1.5 }}>
            {phase === "success"
              ? "Vos clients peuvent désormais régler en espèces à la livraison. La fonctionnalité est activée à vie."
              : phase === "pending"
                ? `Validez le débit de ${unlockPrice.toLocaleString("fr-FR")} FCFA via ${selectedOperator?.shortName ?? "Mobile Money"} sur votre téléphone.`
                : phase === "failed"
                  ? "Aucun débit n'a été confirmé. Vous pouvez réessayer avec un autre numéro ou opérateur."
                  : "Offrez à vos clients la possibilité de régler en espèces au moment de la livraison — le levier #1 pour booster vos conversions en Afrique."}
          </p>
        </div>

        {(phase === "form" || phase === "failed") && (
          <>
            <div style={{ padding: "20px 32px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                }}
              >
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
                    <b.Icon
                      size={20}
                      weight="duotone"
                      color="#E84B1F"
                      style={{ flexShrink: 0, marginTop: "1px" }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#0E1116",
                          marginBottom: "2px",
                        }}
                      >
                        {b.label}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#6B7280",
                          lineHeight: 1.4,
                        }}
                      >
                        {b.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "0 32px 16px" }}>
              <div
                style={{
                  padding: "20px",
                  background:
                    "linear-gradient(135deg, rgba(232, 75, 31, 0.06), rgba(232, 75, 31, 0.02))",
                  border: "1.5px solid rgba(232, 75, 31, 0.2)",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginBottom: "16px",
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
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: "36px",
                        fontWeight: 500,
                        color: "#0E1116",
                        letterSpacing: "-1px",
                      }}
                    >
                      {unlockPrice.toLocaleString("fr-FR")}
                    </span>
                    <span style={{ fontSize: "14px", color: "#4B5563", fontWeight: 500 }}>
                      FCFA
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#6B7280", marginTop: "4px" }}>
                    Sans engagement · Activé à vie
                  </div>
                </div>
                <Lock size={32} weight="duotone" color="#E84B1F" style={{ flexShrink: 0 }} />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#0E1116",
                    marginBottom: "8px",
                  }}
                >
                  Moyens de paiement acceptés
                </div>
                <PaymentMethodsGrid size={28} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "6px",
                    }}
                  >
                    Pays
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value as CartevoCountry)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid var(--dash-border, #E5E5E0)",
                      fontSize: "13px",
                      background: "white",
                    }}
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "6px",
                    }}
                  >
                    Opérateur Mobile Money
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {operators.map((op) => (
                      <button
                        key={op.code}
                        type="button"
                        onClick={() => setOperator(op.code)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "10px",
                          border:
                            operator === op.code
                              ? "2px solid #E84B1F"
                              : "1px solid var(--dash-border, #E5E5E0)",
                          background:
                            operator === op.code
                              ? "rgba(232, 75, 31, 0.06)"
                              : "white",
                          fontSize: "12.5px",
                          fontWeight: operator === op.code ? 600 : 500,
                          cursor: "pointer",
                          color: "#0E1116",
                        }}
                      >
                        {op.shortName}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "6px",
                    }}
                  >
                    Numéro Mobile Money
                  </label>
                  <div style={{ position: "relative" }}>
                    <DeviceMobile
                      size={16}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9CA3AF",
                      }}
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={getMomoPlaceholder(country)}
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 36px",
                        borderRadius: "10px",
                        border: "1px solid var(--dash-border, #E5E5E0)",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  {selectedOperator?.ussd && (
                    <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "6px" }}>
                      Pas de notification ? Composez{" "}
                      <strong>{selectedOperator.ussd}</strong>
                    </p>
                  )}
                </div>
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
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <WarningCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </>
        )}

        {phase === "pending" && (
          <div style={{ padding: "8px 32px 24px" }}>
            {pollFeedback && (
              <div
                style={{
                  padding: "14px 16px",
                  background: "rgba(232, 75, 31, 0.06)",
                  border: "1px solid rgba(232, 75, 31, 0.15)",
                  borderRadius: "12px",
                  fontSize: "13px",
                  color: "#4B5563",
                  lineHeight: 1.5,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <SpinnerGap size={18} className="cod-unlock-spin" color="#E84B1F" />
                <span>{pollFeedback}</span>
              </div>
            )}
            <p
              style={{
                fontSize: "12px",
                color: "#9CA3AF",
                marginTop: "12px",
                textAlign: "center",
              }}
            >
              Ne fermez pas cette fenêtre pendant la vérification.
            </p>
          </div>
        )}

        {phase === "success" && (
          <div style={{ padding: "8px 32px 24px" }}>
            <div
              style={{
                padding: "16px",
                background: "rgba(22, 163, 74, 0.06)",
                border: "1px solid rgba(22, 163, 74, 0.2)",
                borderRadius: "12px",
                fontSize: "13px",
                color: "#166534",
                textAlign: "center",
              }}
            >
              Paiement de {unlockPrice.toLocaleString("fr-FR")} FCFA confirmé.
            </div>
          </div>
        )}

        <div
          style={{
            padding: "16px 32px 24px",
            borderTop: "1px solid var(--dash-border, #E5E5E0)",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {phase === "form" && (
            <>
              <button
                type="button"
                onClick={handleClose}
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
                onClick={handlePay}
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
                  <>
                    <SpinnerGap size={16} className="cod-unlock-spin" />
                    Initiation...
                  </>
                ) : (
                  <>
                    <CurrencyCircleDollar size={16} weight="duotone" />
                    Payer {unlockPrice.toLocaleString("fr-FR")} FCFA
                  </>
                )}
              </button>
              {process.env.NODE_ENV === "development" && (
                <button
                  type="button"
                  onClick={handleDevUnlock}
                  disabled={isPending}
                  style={{
                    padding: "10px 14px",
                    background: "#F3F4F6",
                    border: "1px dashed #9CA3AF",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "11px",
                    color: "#6B7280",
                  }}
                >
                  Dev bypass
                </button>
              )}
            </>
          )}

          {phase === "failed" && (
            <>
              <button
                type="button"
                onClick={handleClose}
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
                Fermer
              </button>
              <button
                type="button"
                onClick={handleRetry}
                style={{
                  padding: "10px 22px",
                  background: "linear-gradient(135deg, #E84B1F, #ff6b3d)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Réessayer
              </button>
            </>
          )}

          {phase === "success" && (
            <button
              type="button"
              onClick={() => {
                onClose();
              }}
              style={{
                padding: "10px 22px",
                background: "linear-gradient(135deg, #16A34A, #22C55E)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                width: "100%",
              }}
            >
              Continuer
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes codUnlockSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .cod-unlock-spin {
          animation: codUnlockSpin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
