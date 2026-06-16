/**
 * Module central de tarification Sellia + Cartevo.
 *
 * - Grille Cartevo : fidèle au dashboard Cartevo (XAF + XOF + autres)
 * - Plans Sellia : Découverte 6% / Pro 4% / Business 4%
 * - 3 modes de répercussion des frais : merchant_absorbs / customer_pays / split_50_50
 *
 * ⚠️ NE JAMAIS exposer le nom "Cartevo" côté UI client.
 */

export type CartevoCountryCode =
  | "CM"
  | "GA"
  | "TD"
  | "CG"
  | "CI"
  | "SN"
  | "BF"
  | "ML"
  | "NE"
  | "TG"
  | "BJ"
  | "GN"
  | "CD";

export type Currency = "XAF" | "XOF" | "GNF" | "CDF" | "USD" | "EUR";

export interface OperatorOverride {
  payin?: number;
  payout?: number;
  min?: number;
}

export interface CountryFees {
  currency: Currency;
  defaultPayin: number;
  defaultPayout: number;
  perOperator?: Record<string, OperatorOverride>;
  fixedFee?: number;
}

export const CARTEVO_FEES: Record<CartevoCountryCode, CountryFees> = {
  CM: { currency: "XAF", defaultPayin: 1.5, defaultPayout: 1.5 },
  GA: { currency: "XAF", defaultPayin: 3.5, defaultPayout: 2.0 },
  TD: { currency: "XAF", defaultPayin: 6.5, defaultPayout: 3.0 },
  CG: { currency: "XAF", defaultPayin: 4.5, defaultPayout: 3.0 },
  CI: {
    currency: "XOF",
    defaultPayin: 3.0,
    defaultPayout: 2.0,
    perOperator: {
      mtn: { payin: 2.5 },
      wave: { payin: 2.0 },
      orange: { payin: 3.0 },
      moov: { payin: 3.0 },
    },
  },
  SN: { currency: "XOF", defaultPayin: 2.0, defaultPayout: 2.0 },
  BF: { currency: "XOF", defaultPayin: 3.5, defaultPayout: 2.5 },
  ML: { currency: "XOF", defaultPayin: 3.5, defaultPayout: 2.5 },
  NE: { currency: "XOF", defaultPayin: 4.5, defaultPayout: 2.5 },
  TG: { currency: "XOF", defaultPayin: 4.0, defaultPayout: 2.5 },
  BJ: { currency: "XOF", defaultPayin: 3.0, defaultPayout: 2.0 },
  GN: { currency: "GNF", defaultPayin: 3.5, defaultPayout: 2.5 },
  CD: { currency: "CDF", defaultPayin: 5.0, defaultPayout: 4.0 },
};

/**
 * Opérateurs Mobile Money disponibles pour le RETRAIT (payout) par pays.
 * Tchad (TD) : aucun opérateur de retrait MoMo chez Cartevo.
 *
 * ⚠️ PROPOSITION à VALIDER par KONO avec la liste EXACTE des opérateurs supportés
 * par Cartevo : certains codes peuvent différer (ex "tmoney" vs "togocom",
 * "free" vs "expresso", "africell" n'est peut-être pas un code Cartevo valide).
 */
export const PAYOUT_OPERATORS_BY_COUNTRY: Record<string, string[]> = {
  CM: ["mtn", "orange"],
  GA: ["airtel", "moov"],
  TD: [], // ⚠️ pas de retrait MoMo au Tchad
  CG: ["mtn", "airtel"],
  CI: ["mtn", "orange", "moov", "wave"],
  SN: ["orange", "free", "wave"],
  BF: ["orange", "moov"],
  ML: ["orange", "moov"],
  NE: ["airtel", "moov", "orange"],
  TG: ["tmoney", "moov"],
  BJ: ["mtn", "moov"],
  GN: ["orange", "mtn"],
  CD: ["orange", "airtel", "mpesa", "africell"],
};

/** Libellés lisibles des opérateurs de retrait. */
export const PAYOUT_OPERATOR_LABELS: Record<string, string> = {
  mtn: "MTN",
  orange: "Orange",
  moov: "Moov",
  wave: "Wave",
  airtel: "Airtel",
  mpesa: "M-Pesa",
  tmoney: "T-Money",
  free: "Free",
  africell: "Africell",
};

export function getPayoutOperators(country: string): string[] {
  return PAYOUT_OPERATORS_BY_COUNTRY[(country || "").toUpperCase()] ?? [];
}

export type SelliaPlan = "free" | "pro" | "business";

export interface SelliaPlanConfig {
  id: SelliaPlan;
  name: string;
  commissionRate: number;
  monthlyFee: number;
  yearlyDiscount: number;
  features: string[];
  highlighted?: boolean;
}

export const SELLIA_PLANS: Record<SelliaPlan, SelliaPlanConfig> = {
  free: {
    id: "free",
    name: "Découverte",
    commissionRate: 6.0,
    monthlyFee: 0,
    yearlyDiscount: 0,
    features: [
      "Boutique en ligne illimitée",
      "Produits illimités",
      "Commandes illimitées",
      "Paiement Mobile Money sécurisé",
      "Protection acheteur 6 jours",
      "QR code de livraison",
      "Email automatique de confirmation",
      "Tableau de bord marchand",
      "Système de messagerie connecté à votre boutique",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    commissionRate: 4.0,
    monthlyFee: 4900,
    yearlyDiscount: 15,
    highlighted: true,
    features: [
      "Tout Découverte",
      "Frais partenaires & opérateurs réduits à 4% (-33%)",
      "Multi-boutiques (jusqu'à 5)",
      "Branding personnalisé (logo, couleurs)",
      "Domaine personnalisé (.com)",
      "Statistiques avancées",
      "Support prioritaire",
      "Promotions et codes promo",
      "Retrait instantané de vos gains",
      "Système de messagerie connecté à votre boutique",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    commissionRate: 4.0,
    monthlyFee: 14900,
    yearlyDiscount: 20,
    features: [
      "Tout Pro",
      "Frais partenaires & opérateurs réduits à 4%",
      "Multi-boutiques illimitées",
      "API complète (intégration sur-mesure)",
      "Compte gestionnaire dédié",
      "Multi-utilisateurs (équipe)",
      "Rapports comptables exportables",
      "Webhooks personnalisés",
      "Retrait instantané de vos gains",
      "Système de messagerie connecté à votre boutique",
    ],
  },
};

export type FeeMode = "merchant_absorbs" | "customer_pays" | "split_50_50";

export const FEE_MODE_LABELS: Record<
  FeeMode,
  { fr: string; description: string }
> = {
  merchant_absorbs: {
    fr: "J'absorbe les frais",
    description:
      "Le client paie le prix affiché. Les frais sont déduits de votre revenu.",
  },
  customer_pays: {
    fr: "Le client paie les frais",
    description:
      "Les frais sont ajoutés au prix lors du paiement. Vous recevez le montant exact affiché.",
  },
  split_50_50: {
    fr: "Partage 50/50",
    description:
      "La moitié des frais est ajoutée au prix du client. L'autre moitié est déduite de votre revenu.",
  },
};

export interface FeeBreakdown {
  baseAmount: number;
  cartevoRate: number;
  selliaRate: number;
  cartevoFee: number;
  selliaFee: number;
  totalFees: number;
  customerPays: number;
  merchantReceives: number;
  totalFeesAdded: number;
  feeMode: FeeMode;
}

export function getCartevoPayinRate(country: string, operator: string): number {
  const c = CARTEVO_FEES[country as CartevoCountryCode];
  if (!c) {
    throw new Error(`Cartevo: pays non supporté pour payin: ${country}`);
  }
  const opOverride = c.perOperator?.[operator.toLowerCase()];
  return opOverride?.payin ?? c.defaultPayin;
}

/**
 * Frais de retrait facturé au marchand (revenu Sellia), distinct du coût Cartevo.
 * RDC (CD) et Tchad (TD) = 2% (payout Cartevo élevé là-bas).
 * Tous les autres pays = 0% (retrait gratuit, Sellia absorbe le coût Cartevo).
 */
export function getMerchantWithdrawalFeeRate(country: string): number {
  const c = (country || "").toUpperCase();
  if (c === "TD" || c === "CD" || c === "RDC") return 2;
  return 0;
}

export function getCartevoPayoutRate(country: string, operator: string): number {
  const c = CARTEVO_FEES[country as CartevoCountryCode];
  if (!c) {
    throw new Error(`Cartevo: pays non supporté pour payout: ${country}`);
  }
  const opOverride = c.perOperator?.[operator.toLowerCase()];
  return opOverride?.payout ?? c.defaultPayout;
}

import { getSelliaCommissionRate } from "@/lib/admin/money-config";

export function getSelliaRate(plan: SelliaPlan): number {
  return getSelliaCommissionRate(plan);
}

export function computeCollectFees(params: {
  baseAmount: number;
  country: string;
  operator: string;
  shopPlan: SelliaPlan;
  feeMode: FeeMode;
}): FeeBreakdown {
  const { baseAmount, country, operator, shopPlan, feeMode } = params;

  const cartevoRate = getCartevoPayinRate(country, operator);
  const selliaRate = getSelliaRate(shopPlan);

  const cartevoFee = round2(baseAmount * (cartevoRate / 100));
  const selliaFee = round2(baseAmount * (selliaRate / 100));
  const totalFees = round2(cartevoFee + selliaFee);

  let customerPays: number;
  let merchantReceives: number;
  let totalFeesAdded: number;

  switch (feeMode) {
    case "merchant_absorbs":
      customerPays = baseAmount;
      merchantReceives = round2(baseAmount - totalFees);
      totalFeesAdded = 0;
      break;
    case "customer_pays":
      customerPays = round2(baseAmount + totalFees);
      merchantReceives = baseAmount;
      totalFeesAdded = totalFees;
      break;
    case "split_50_50":
      customerPays = round2(baseAmount + totalFees / 2);
      merchantReceives = round2(baseAmount - totalFees / 2);
      totalFeesAdded = round2(totalFees / 2);
      break;
  }

  return {
    baseAmount,
    cartevoRate,
    selliaRate,
    cartevoFee,
    selliaFee,
    totalFees,
    customerPays,
    merchantReceives,
    totalFeesAdded,
    feeMode,
  };
}

export interface PayoutBreakdown {
  requestedAmount: number;
  cartevoRate: number;
  cartevoFee: number;
  merchantReceives: number;
}

export function computePayoutFees(params: {
  requestedAmount: number;
  country: string;
  operator: string;
}): PayoutBreakdown {
  const { requestedAmount, country, operator } = params;
  const cartevoRate = getCartevoPayoutRate(country, operator);
  const cartevoFee = round2(requestedAmount * (cartevoRate / 100));
  return {
    requestedAmount,
    cartevoRate,
    cartevoFee,
    merchantReceives: round2(requestedAmount - cartevoFee),
  };
}

export function projectedPayoutAmount(
  walletBalance: number,
  country: string,
  operator: string
): number {
  const payoutRate = getCartevoPayoutRate(country, operator);
  return round2(walletBalance * (1 - payoutRate / 100));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function getSupportedCountries(): CartevoCountryCode[] {
  return Object.keys(CARTEVO_FEES) as CartevoCountryCode[];
}

export const COUNTRY_LABELS: Record<CartevoCountryCode, string> = {
  CM: "Cameroun",
  GA: "Gabon",
  TD: "Tchad",
  CG: "Congo Brazza",
  CI: "Côte d'Ivoire",
  SN: "Sénégal",
  BF: "Burkina Faso",
  ML: "Mali",
  NE: "Niger",
  TG: "Togo",
  BJ: "Bénin",
  GN: "Guinée Conakry",
  CD: "République Démocratique du Congo",
};
