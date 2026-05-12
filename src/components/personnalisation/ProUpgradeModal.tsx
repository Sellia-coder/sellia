"use client";

import { useState } from "react";
import { X, Crown, Check, ChevronDown, Loader2, ShieldCheck } from "lucide-react";
import CountryFlag, { COUNTRY_NAMES } from "@/components/shared/CountryFlag";
import PaymentLogos from "@/components/shop/PaymentLogos";
import styles from "./ProUpgradeModal.module.css";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

const PRO_BENEFITS = [
  {
    title: "Paiement à la livraison débloqué",
    desc: "Vos clients peuvent payer en espèces à la réception",
    highlight: true,
  },
  {
    title: "Commission réduite à 4%",
    desc: "Au lieu de 6% sur le plan gratuit",
  },
  {
    title: "Domaine personnalisé",
    desc: "Utilisez votre propre nom de domaine (.com)",
  },
  {
    title: "Statistiques détaillées",
    desc: "Rapports IA et analytics avancés",
  },
  {
    title: "Support prioritaire WhatsApp",
    desc: "Réponse sous 4 heures",
  },
];

export default function ProUpgradeModal({ onClose, onSuccess }: Props) {
  const [momoCountry, setMomoCountry] = useState("CM");
  const [momoNumber, setMomoNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"benefits" | "payment" | "success">("benefits");

  const isValidNumber = momoNumber.length >= 8;

  const dialCodes: Record<string, string> = {
    CM: "+237", CI: "+225", SN: "+221", BJ: "+229", TG: "+228",
    BF: "+226", ML: "+223", NE: "+227", CG: "+242", GA: "+241",
    GN: "+224", RW: "+250",
  };

  const handleActivate = async () => {
    if (!isValidNumber || isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setStep("success");
    }, 1500);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={18} strokeWidth={2.2} />
        </button>

        {step === "benefits" && (
          <>
            <div className={styles.header}>
              <div className={styles.headerIcon}>
                <Crown size={28} strokeWidth={2.2} fill="currentColor" />
              </div>
              <div className={styles.headerBadge}>PASSEZ AU PLAN PRO</div>
              <h2 className={styles.headerTitle}>
                Débloquez tout le potentiel de votre boutique
              </h2>
              <p className={styles.headerSubtitle}>
                Activez le paiement à la livraison et bien plus pour seulement
              </p>
              <div className={styles.priceTag}>
                <span className={styles.priceAmount}>4 900</span>
                <span className={styles.priceCurrency}>FCFA</span>
                <span className={styles.pricePeriod}>/ mois</span>
              </div>
              <span className={styles.priceNote}>Annulable à tout moment · Sans engagement</span>
            </div>

            <div className={styles.benefits}>
              <h3 className={styles.benefitsTitle}>Ce que vous débloquez</h3>
              <ul className={styles.benefitsList}>
                {PRO_BENEFITS.map((benefit, i) => (
                  <li key={i} className={`${styles.benefit} ${benefit.highlight ? styles.benefitHighlight : ""}`}>
                    <div className={styles.benefitIcon}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <div className={styles.benefitText}>
                      <span className={styles.benefitTitleText}>
                        {benefit.title}
                        {benefit.highlight && <span className={styles.benefitStar}>★</span>}
                      </span>
                      <span className={styles.benefitDesc}>{benefit.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className={styles.primaryCta}
              onClick={() => setStep("payment")}
            >
              <Crown size={16} strokeWidth={2.4} fill="currentColor" />
              Activer mon plan Pro
            </button>

            <span className={styles.legal}>
              <ShieldCheck size={12} strokeWidth={2.4} />
              Paiement sécurisé · Données chiffrées
            </span>
          </>
        )}

        {step === "payment" && (
          <>
            <div className={styles.headerSimple}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setStep("benefits")}
              >
                ←
              </button>
              <h2 className={styles.headerSimpleTitle}>Activer le plan Pro</h2>
            </div>

            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Plan Pro mensuel</span>
                <span>4 900 FCFA</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryTotal}>
                <span>Total aujourd&apos;hui</span>
                <span className={styles.summaryTotalAmount}>4 900 FCFA</span>
              </div>
              <span className={styles.summaryNote}>
                Renouvellement automatique le même jour chaque mois.
              </span>
            </div>

            <div className={styles.paymentMethod}>
              <span className={styles.paymentMethodLabel}>Mode de paiement</span>
              <div className={styles.paymentMethodCard}>
                <span className={styles.paymentMethodTitle}>Mobile Money</span>
                <PaymentLogos
                  methods={["mtn_momo", "wave", "orange_money", "moov_money", "free_money", "airtel_money"]}
                  size="sm"
                  variant="circle"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Numéro Mobile Money à débiter</label>
              <div className={styles.fieldInner}>
                <div className={styles.fieldCountry}>
                  <select
                    value={momoCountry}
                    onChange={(e) => setMomoCountry(e.target.value)}
                    className={styles.fieldCountrySelect}
                  >
                    {Object.keys(dialCodes).map((code) => (
                      <option key={code} value={code}>
                        {dialCodes[code]} {COUNTRY_NAMES[code as keyof typeof COUNTRY_NAMES]}
                      </option>
                    ))}
                  </select>
                  <div className={styles.fieldCountryDisplay}>
                    <CountryFlag code={momoCountry as any} size="sm" />
                    <span>{dialCodes[momoCountry]}</span>
                    <ChevronDown size={12} strokeWidth={2.4} />
                  </div>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  className={styles.fieldInput}
                  placeholder="6XX XXX XXX"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value.replace(/[^0-9]/g, ""))}
                  maxLength={10}
                />
              </div>
            </div>

            <button
              type="button"
              className={styles.primaryCta}
              onClick={handleActivate}
              disabled={!isValidNumber || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} strokeWidth={2.4} className={styles.spin} />
                  Activation en cours...
                </>
              ) : (
                <>
                  <Crown size={16} strokeWidth={2.4} fill="currentColor" />
                  Confirmer et payer 4 900 FCFA
                </>
              )}
            </button>

            <span className={styles.legal}>
              <ShieldCheck size={12} strokeWidth={2.4} />
              Paiement sécurisé · Vous recevrez un SMS de confirmation
            </span>
          </>
        )}

        {step === "success" && (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className={styles.successTitle}>Plan Pro activé !</h2>
            <p className={styles.successDesc}>
              Votre plan Pro est maintenant actif. Le paiement à la livraison est débloqué pour vos clients.
            </p>
            <button
              type="button"
              className={styles.primaryCta}
              onClick={() => {
                onSuccess?.();
                onClose();
              }}
            >
              Continuer la configuration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
