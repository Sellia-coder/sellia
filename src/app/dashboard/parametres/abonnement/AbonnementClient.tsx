"use client";

import { useState } from "react";
import {
  Check,
  X,
  Sparkle,
  Lightning,
  Crown,
  ArrowRight,
} from "@phosphor-icons/react";
import styles from "./abonnement.module.css";

interface Props {
  currentPlan: string;
  shopName: string;
}

const PLANS = [
  {
    id: "free",
    name: "Découverte",
    description: "Idéal pour démarrer et tester votre activité",
    priceMonthly: 0,
    priceAnnual: 0,
    badge: null,
    icon: Sparkle,
    color: "#6B6E76",
    features: [
      { label: "Boutique en ligne illimitée", included: true },
      { label: "Catalogue produits illimités", included: true },
      { label: "Paiement Mobile Money + cartes", included: true },
      { label: "Lien personnalisé getsellia.com", included: true },
      { label: "Domaine personnalisé", included: false },
      { label: "Pixels marketing (FB, GA4, TikTok)", included: false },
      { label: "Commission Sellia", value: "6% par vente" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Pour les entrepreneurs sérieux qui veulent scaler",
    priceMonthly: 4900,
    priceAnnual: 47040,
    badge: "POPULAIRE",
    icon: Lightning,
    color: "#E84B1F",
    features: [
      { label: "Tout du plan Découverte", included: true },
      { label: "Domaine personnalisé (.com, .fr...)", included: true },
      { label: "Pixels marketing : FB, GA4, TikTok, Snap", included: true },
      { label: "Coupons & cartes cadeaux", included: true },
      { label: "Campagnes flash + fidélité", included: true },
      { label: "Pages personnalisées illimitées", included: true },
      { label: "Commission Sellia", value: "4% par vente" },
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "Pour les marques établies et boutiques à fort volume",
    priceMonthly: 19900,
    priceAnnual: 191040,
    badge: "BIENTÔT",
    icon: Crown,
    color: "#9333EA",
    features: [
      { label: "Tout du plan Pro", included: true },
      { label: "Multi-boutiques (jusqu'à 5)", included: true },
      { label: "API publique + webhooks", included: true },
      { label: "Manager dédié", included: true },
      { label: "Commission Sellia", value: "4% par vente" },
    ],
  },
];

const FAQ = [
  {
    q: "Comment fonctionne la commission Sellia ?",
    a: "La commission est prélevée automatiquement sur chaque vente. Plus votre plan est élevé, plus la commission est basse.",
  },
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez passer à un plan supérieur instantanément. Le passage à un plan inférieur prend effet au prochain cycle.",
  },
  {
    q: "Y a-t-il un engagement ?",
    a: "Aucun engagement. Vous êtes libre de résilier quand vous le souhaitez depuis votre dashboard.",
  },
  {
    q: "Le plan annuel offre-t-il une réduction ?",
    a: "Oui, l'abonnement annuel vous fait économiser 20% par rapport au mensuel.",
  },
];

export default function AbonnementClient({ currentPlan, shopName }: Props) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatPrice = (n: number) => n.toLocaleString("fr-FR");

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>— ABONNEMENT</span>
        <h1 className={styles.title}>
          Choisissez le plan qui propulse{" "}
          <span className={styles.titleItalic}>{shopName}</span>
        </h1>
        <p className={styles.subtitle}>
          Démarrez gratuitement. Passez à Pro quand vous êtes prêt à scaler.
          Annulation à tout moment.
        </p>

        <div className={styles.billingToggle}>
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`${styles.billingBtn} ${billing === "monthly" ? styles.billingActive : ""}`}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={`${styles.billingBtn} ${billing === "annual" ? styles.billingActive : ""}`}
          >
            Annuel
            <span className={styles.discount}>-20%</span>
          </button>
        </div>
      </div>

      <div className={styles.plansGrid}>
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const price =
            billing === "annual" ? plan.priceAnnual : plan.priceMonthly;
          const isCurrent = currentPlan === plan.id;
          const isFree = plan.id === "free";
          const isBusiness = plan.id === "business";
          const isPopular = plan.badge === "POPULAIRE";

          return (
            <div
              key={plan.id}
              className={`${styles.planCard} ${isPopular ? styles.planCardPopular : ""}`}
            >
              {plan.badge && (
                <div
                  className={`${styles.planBadge} ${isPopular ? styles.badgePopular : styles.badgeSoon}`}
                >
                  {plan.badge}
                </div>
              )}

              <div className={styles.planHeader}>
                <div
                  className={styles.planIcon}
                  style={{ background: `${plan.color}15`, color: plan.color }}
                >
                  <Icon size={26} weight="duotone" />
                </div>
                <div>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>
              </div>

              <div className={styles.planPrice}>
                {isFree ? (
                  <div className={styles.priceValue}>Gratuit</div>
                ) : (
                  <>
                    <div className={styles.priceValue}>
                      {formatPrice(
                        billing === "annual" ? Math.round(price / 12) : price
                      )}
                      <span className={styles.priceCurrency}>FCFA</span>
                    </div>
                    <div className={styles.pricePeriod}>
                      par mois
                      {billing === "annual" ? ", facturé annuellement" : ""}
                    </div>
                    {billing === "annual" && (
                      <div className={styles.priceTotal}>
                        Soit {formatPrice(price)} FCFA / an
                      </div>
                    )}
                  </>
                )}
              </div>

              <button
                type="button"
                disabled={isCurrent || isBusiness}
                className={`${styles.planCta} ${isCurrent ? styles.planCtaCurrent : ""} ${isPopular ? styles.planCtaPopular : ""}`}
              >
                {isCurrent
                  ? "Plan actuel"
                  : isBusiness
                    ? "Bientôt disponible"
                    : `Passer ${plan.name}`}
                {!isCurrent && !isBusiness && (
                  <ArrowRight size={14} weight="bold" />
                )}
              </button>

              <div className={styles.planFeatures}>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className={styles.feature}>
                    {feature.included !== undefined ? (
                      feature.included ? (
                        <Check size={15} weight="bold" color="#15803D" />
                      ) : (
                        <X size={15} weight="regular" color="#C4C0B6" />
                      )
                    ) : null}
                    <span
                      className={`${styles.featureLabel} ${feature.included === false ? styles.featureMuted : ""}`}
                    >
                      {feature.label}
                    </span>
                    {"value" in feature && feature.value && (
                      <span className={styles.featureValue}>{feature.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Questions fréquentes</h2>
        <div className={styles.faqList}>
          {FAQ.map((item, idx) => (
            <details
              key={idx}
              open={openFaq === idx}
              className={styles.faqItem}
              onClick={(e) => {
                e.preventDefault();
                setOpenFaq(openFaq === idx ? null : idx);
              }}
            >
              <summary className={styles.faqQuestion}>
                {item.q}
                <span className={styles.faqIcon}>+</span>
              </summary>
              <div className={styles.faqAnswer}>{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
