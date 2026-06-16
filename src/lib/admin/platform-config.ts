import {
  CARTEVO_FEES,
  PAYOUT_OPERATORS_BY_COUNTRY,
  PAYOUT_OPERATOR_LABELS,
  getMerchantWithdrawalFeeRate,
  SELLIA_PLANS,
  type SelliaPlan,
} from "@/lib/cartevo/pricing";
import {
  refreshMoneyConfigCache,
  getEffectiveMoneyConfigSync,
  MONEY_DEFAULTS,
} from "@/lib/admin/money-config";

const PLAN_LABELS: Record<SelliaPlan, string> = {
  free: "Découverte",
  pro: "Pro",
  business: "Business",
};

/** Config plateforme pour l'admin (taux effectifs = overrides ou constantes). */
export async function getAdminPlatformConfig() {
  await refreshMoneyConfigCache();
  const money = getEffectiveMoneyConfigSync();

  const plans = (["free", "pro", "business"] as const).map((id) => ({
    id,
    name: PLAN_LABELS[id],
    commissionRate: money.commissionRates[id],
    monthlyFee: SELLIA_PLANS[id].monthlyFee,
    defaultCommissionRate: MONEY_DEFAULTS.commissionRates[id],
    hasOverride:
      (id === "free" && money.commissionRates.free !== MONEY_DEFAULTS.commissionRates.free) ||
      (id === "pro" && money.commissionRates.pro !== MONEY_DEFAULTS.commissionRates.pro) ||
      (id === "business" &&
        money.commissionRates.business !== MONEY_DEFAULTS.commissionRates.business),
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
    withdrawalValidationThreshold: money.withdrawalValidationThreshold,
    codUnlockPrice: money.codUnlockPrice,
    defaultWithdrawalThreshold: MONEY_DEFAULTS.withdrawalValidationThreshold,
    defaultCodUnlockPrice: MONEY_DEFAULTS.codUnlockPrice,
    moneyHasOverrides: money.hasOverrides,
  };
}
