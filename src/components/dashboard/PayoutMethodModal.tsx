"use client";

import { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  Warning,
  DeviceMobile,
  User,
  MapPin,
  Phone,
} from "@phosphor-icons/react";
import { savePayoutMethodAction, type PayoutOperatorKey } from "@/app/actions/payout-method";
import styles from "./payout-method-modal.module.css";

interface Props {
  initialMethod?: {
    operator: string | null;
    country: string | null;
    phoneNumber: string | null;
    holderName: string | null;
  };
  onClose: () => void;
  onSaved?: () => void;
}

const OPERATORS = [
  {
    key: "orange_money",
    label: "Orange Money",
    color: "#FF7900",
    countries: ["CM", "CI", "SN", "ML", "BF", "MG"],
  },
  {
    key: "mtn_mobile_money",
    label: "MTN Mobile Money",
    color: "#FFCC00",
    countries: ["CM", "CI", "BJ", "GH", "UG", "RW"],
  },
  {
    key: "moov_money",
    label: "Moov Money",
    color: "#0072CE",
    countries: ["CI", "BJ", "BF", "TG", "ML", "NE"],
  },
  {
    key: "wave",
    label: "Wave",
    color: "#1DC8FF",
    countries: ["CI", "SN", "UG"],
  },
] as const;

const COUNTRIES: Record<string, { label: string; flag: string; dialCode: string }> =
  {
    CM: { label: "Cameroun", flag: "🇨🇲", dialCode: "+237" },
    CI: { label: "Côte d'Ivoire", flag: "🇨🇮", dialCode: "+225" },
    SN: { label: "Sénégal", flag: "🇸🇳", dialCode: "+221" },
    ML: { label: "Mali", flag: "🇲🇱", dialCode: "+223" },
    BF: { label: "Burkina Faso", flag: "🇧🇫", dialCode: "+226" },
    MG: { label: "Madagascar", flag: "🇲🇬", dialCode: "+261" },
    BJ: { label: "Bénin", flag: "🇧🇯", dialCode: "+229" },
    GH: { label: "Ghana", flag: "🇬🇭", dialCode: "+233" },
    UG: { label: "Ouganda", flag: "🇺🇬", dialCode: "+256" },
    RW: { label: "Rwanda", flag: "🇷🇼", dialCode: "+250" },
    TG: { label: "Togo", flag: "🇹🇬", dialCode: "+228" },
    NE: { label: "Niger", flag: "🇳🇪", dialCode: "+227" },
  };

const COUNTRY_CODES = ["CM", "CI", "SN", "ML", "BF", "MG"] as const;

export default function PayoutMethodModal({
  initialMethod,
  onClose,
  onSaved,
}: Props) {
  const [operator, setOperator] = useState(initialMethod?.operator || "");
  const [country, setCountry] = useState(initialMethod?.country || "CM");
  const [phoneNumber, setPhoneNumber] = useState(
    initialMethod?.phoneNumber || ""
  );
  const [holderName, setHolderName] = useState(initialMethod?.holderName || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableOperators = OPERATORS.filter((op) =>
    (op.countries as readonly string[]).includes(country)
  );

  useEffect(() => {
    if (operator && !availableOperators.find((op) => op.key === operator)) {
      setOperator("");
    }
  }, [country, operator, availableOperators]);

  const selectedOp = OPERATORS.find((op) => op.key === operator);
  const selectedCountry = COUNTRIES[country];

  const handleSubmit = async () => {
    if (!operator || !country || !phoneNumber || !holderName) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    setSaving(true);
    setError(null);

    const res = await savePayoutMethodAction({
      operator: operator as PayoutOperatorKey,
      country,
      phoneNumber,
      holderName,
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        onSaved?.();
        onClose();
        if (typeof window !== "undefined") window.location.reload();
      }, 1500);
    } else {
      setError(res.error);
      setSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {success ? (
          <div className={styles.successView}>
            <CheckCircle
              size={56}
              weight="duotone"
              color="var(--sellia-success)"
            />
            <h3>Méthode de retrait enregistrée</h3>
            <p>Vous pouvez maintenant retirer votre argent.</p>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <div>
                <h2 className={styles.title}>Méthode de retrait</h2>
                <p className={styles.subtitle}>
                  Configurez votre compte Mobile Money pour recevoir vos gains.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={styles.closeBtn}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className={styles.body}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <MapPin size={13} weight="duotone" /> Pays
                </label>
                <div className={styles.countryGrid}>
                  {COUNTRY_CODES.map((code) => {
                    const c = COUNTRIES[code];
                    return (
                      <button
                        key={code}
                        type="button"
                        className={`${styles.countryBtn} ${country === code ? styles.countryBtnActive : ""}`}
                        onClick={() => setCountry(code)}
                      >
                        <span className={styles.countryFlag}>{c.flag}</span>
                        <span className={styles.countryLabel}>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <DeviceMobile size={13} weight="duotone" /> Opérateur Mobile
                  Money
                </label>
                {availableOperators.length === 0 ? (
                  <div className={styles.noOperators}>
                    <Warning size={14} weight="duotone" /> Aucun opérateur
                    disponible dans ce pays
                  </div>
                ) : (
                  <div className={styles.operatorGrid}>
                    {availableOperators.map((op) => (
                      <button
                        key={op.key}
                        type="button"
                        className={`${styles.operatorBtn} ${operator === op.key ? styles.operatorBtnActive : ""}`}
                        onClick={() => setOperator(op.key)}
                        style={
                          operator === op.key
                            ? {
                                borderColor: op.color,
                                boxShadow: `0 0 0 3px ${op.color}25`,
                              }
                            : undefined
                        }
                      >
                        <div
                          className={styles.operatorLogo}
                          style={{ background: op.color }}
                        >
                          {op.label.charAt(0)}
                        </div>
                        <span className={styles.operatorLabel}>{op.label}</span>
                        {operator === op.key && (
                          <CheckCircle
                            size={16}
                            weight="fill"
                            color={op.color}
                            className={styles.operatorCheck}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Phone size={13} weight="duotone" /> Numéro Mobile Money
                </label>
                <div className={styles.phoneInputWrap}>
                  <span className={styles.dialCode}>
                    {selectedCountry?.flag} {selectedCountry?.dialCode}
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/[^0-9\s]/g, ""))
                    }
                    placeholder="6XX XX XX XX"
                    className={styles.phoneInput}
                    maxLength={15}
                  />
                </div>
                <span className={styles.fieldHint}>
                  Le numéro associé à votre compte{" "}
                  {selectedOp?.label || "Mobile Money"}
                </span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <User size={13} weight="duotone" /> Nom du titulaire
                </label>
                <input
                  type="text"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="Ex: KONO Christian"
                  className={styles.textInput}
                  maxLength={80}
                />
                <span className={styles.fieldHint}>
                  Exactement comme enregistré chez votre opérateur
                </span>
              </div>

              {error && (
                <div className={styles.errorBox}>
                  <Warning size={14} weight="duotone" /> {error}
                </div>
              )}

              {operator && phoneNumber && holderName && (
                <div className={styles.recap}>
                  <div className={styles.recapHeader}>Récapitulatif</div>
                  <div className={styles.recapLine}>
                    <span>Opérateur</span>
                    <strong>{selectedOp?.label}</strong>
                  </div>
                  <div className={styles.recapLine}>
                    <span>Numéro</span>
                    <strong>
                      {selectedCountry?.dialCode} {phoneNumber}
                    </strong>
                  </div>
                  <div className={styles.recapLine}>
                    <span>Titulaire</span>
                    <strong>{holderName}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <button
                type="button"
                onClick={onClose}
                className={styles.btnSecondary}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !operator || !phoneNumber || !holderName}
                className={styles.btnPrimary}
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
