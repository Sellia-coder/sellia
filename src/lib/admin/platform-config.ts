import {
  SELLIA_PLANS,
  CARTEVO_FEES,
  PAYOUT_OPERATORS_BY_COUNTRY,
  PAYOUT_OPERATOR_LABELS,
  getMerchantWithdrawalFeeRate,
} from "@/lib/cartevo/pricing";

/** Miroir lecture seule du seuil dans payouts/request (pas d'édition ici). */
export const WITHDRAWAL_VALIDATION_THRESHOLD_FCFA = 50_000;

/** Prix déblocage paiement à la livraison (feature-unlock.ts). */
export const COD_UNLOCK_PRICE_FCFA = 1_900;

export function getAdminPlatformConfig() {
  const plans = Object.values(SELLIA_PLANS).map((p) => ({
    id: p.id,
    name: p.name,
    commissionRate: p.commissionRate,
    monthlyFee: p.monthlyFee,
  }));

  const countries = Object.entries(CARTEVO_FEES).map(([code, fees]) => ({
    code,
    currency: fees.currency,
    payinRate: fees.defaultPayin,
    payoutRate: fees.defaultPayout,
    withdrawalFeeRate: getMerchantWithdrawalFeeRate(code),
    operators: (PAYOUT_OPERATORS_BY_COUNTRY[code] ?? []).map(
      (op) => PAYOUT_OPERATOR_LABELS[op] ?? op
    ),
  }));

  return {
    plans,
    countries,
    withdrawalValidationThreshold: WITHDRAWAL_VALIDATION_THRESHOLD_FCFA,
    codUnlockPrice: COD_UNLOCK_PRICE_FCFA,
  };
}
