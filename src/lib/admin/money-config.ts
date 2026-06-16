/**
 * Réglages money (commissions, seuil retrait, prix COD) — overrides DB + fallback constantes.
 * Lecture fail-safe : DB vide/invalide/erreur → constantes par défaut.
 *
 * ⚠️ Forward-only : les payouts existants stockent commissionRate à la création.
 */

import {
  getPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  type PlatformSettingsData,
} from "@/lib/admin/platform-settings";

type MoneyPlan = "free" | "pro" | "business";

/** Constantes de référence (miroir SELLIA_PLANS + seuils actuels). */
export const MONEY_DEFAULTS = {
  commissionRates: {
    free: 6,
    pro: 4,
    business: 4,
  } satisfies Record<MoneyPlan, number>,
  withdrawalValidationThreshold: 50_000,
  codUnlockPrice: 1_900,
} as const;

export const MAX_COMMISSION_RATE_PERCENT = 50;

export type EffectiveMoneyConfig = {
  commissionRates: Record<MoneyPlan, number>;
  withdrawalValidationThreshold: number;
  codUnlockPrice: number;
  /** true si au moins un override DB actif */
  hasOverrides: boolean;
};

export type MoneySettingsInput = {
  commissionRateFree?: number | null;
  commissionRatePro?: number | null;
  commissionRateBusiness?: number | null;
  withdrawalValidationThreshold?: number | null;
  codUnlockPrice?: number | null;
};

let cache: EffectiveMoneyConfig | null = null;
let cacheAt = 0;
const CACHE_TTL_MS = 30_000;

export function isValidCommissionRate(n: unknown): n is number {
  return (
    typeof n === "number" &&
    Number.isFinite(n) &&
    n >= 0 &&
    n <= MAX_COMMISSION_RATE_PERCENT
  );
}

export function isValidMoneyAmount(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && Number.isInteger(n);
}

function resolveRate(
  override: number | null | undefined,
  fallback: number
): number {
  if (override != null && isValidCommissionRate(override)) return override;
  return fallback;
}

function resolveAmount(
  override: number | null | undefined,
  fallback: number
): number {
  if (override != null && isValidMoneyAmount(override)) return override;
  return fallback;
}

export function resolveEffectiveMoneyConfig(
  settings: PlatformSettingsData
): EffectiveMoneyConfig {
  const commissionRates = {
    free: resolveRate(
      settings.commissionRateFree,
      MONEY_DEFAULTS.commissionRates.free
    ),
    pro: resolveRate(
      settings.commissionRatePro,
      MONEY_DEFAULTS.commissionRates.pro
    ),
    business: resolveRate(
      settings.commissionRateBusiness,
      MONEY_DEFAULTS.commissionRates.business
    ),
  };

  const withdrawalValidationThreshold = resolveAmount(
    settings.withdrawalValidationThreshold,
    MONEY_DEFAULTS.withdrawalValidationThreshold
  );

  const codUnlockPrice = resolveAmount(
    settings.codUnlockPrice,
    MONEY_DEFAULTS.codUnlockPrice
  );

  const hasOverrides =
    settings.commissionRateFree != null ||
    settings.commissionRatePro != null ||
    settings.commissionRateBusiness != null ||
    settings.withdrawalValidationThreshold != null ||
    settings.codUnlockPrice != null;

  return {
    commissionRates,
    withdrawalValidationThreshold,
    codUnlockPrice,
    hasOverrides,
  };
}

/** Recharge le cache serveur (layouts, création payout/retrait). Fail-safe. */
export async function refreshMoneyConfigCache(): Promise<EffectiveMoneyConfig> {
  try {
    const settings = await getPlatformSettings();
    cache = resolveEffectiveMoneyConfig(settings);
    cacheAt = Date.now();
    return cache;
  } catch {
    cache = resolveEffectiveMoneyConfig(DEFAULT_PLATFORM_SETTINGS);
    cacheAt = Date.now();
    return cache;
  }
}

function getCached(): EffectiveMoneyConfig {
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) return cache;
  return resolveEffectiveMoneyConfig(DEFAULT_PLATFORM_SETTINGS);
}

export function invalidateMoneyConfigCache(): void {
  cache = null;
  cacheAt = 0;
}

/** Taux commission effectif pour un plan (sync, cache ou constante). */
export function getSelliaCommissionRate(plan: MoneyPlan | string): number {
  const key = (plan === "pro" || plan === "business" ? plan : "free") as MoneyPlan;
  return getCached().commissionRates[key];
}

/** Seuil validation retrait manuelle (sync). */
export function getWithdrawalValidationThreshold(): number {
  return getCached().withdrawalValidationThreshold;
}

/** Prix déblocage COD (sync). */
export function getCodUnlockPrice(): number {
  return getCached().codUnlockPrice;
}

export function getEffectiveMoneyConfigSync(): EffectiveMoneyConfig {
  return getCached();
}

export function validateMoneySettingsInput(
  input: MoneySettingsInput
): { ok: true; data: MoneySettingsInput } | { ok: false; error: string } {
  const data: MoneySettingsInput = {};

  if ("commissionRateFree" in input) {
    if (input.commissionRateFree === null) data.commissionRateFree = null;
    else if (!isValidCommissionRate(input.commissionRateFree)) {
      return { ok: false, error: "Commission Découverte invalide (0–50 %)." };
    } else data.commissionRateFree = input.commissionRateFree;
  }

  if ("commissionRatePro" in input) {
    if (input.commissionRatePro === null) data.commissionRatePro = null;
    else if (!isValidCommissionRate(input.commissionRatePro)) {
      return { ok: false, error: "Commission Pro invalide (0–50 %)." };
    } else data.commissionRatePro = input.commissionRatePro;
  }

  if ("commissionRateBusiness" in input) {
    if (input.commissionRateBusiness === null) data.commissionRateBusiness = null;
    else if (!isValidCommissionRate(input.commissionRateBusiness)) {
      return { ok: false, error: "Commission Business invalide (0–50 %)." };
    } else data.commissionRateBusiness = input.commissionRateBusiness;
  }

  if ("withdrawalValidationThreshold" in input) {
    if (input.withdrawalValidationThreshold === null) {
      data.withdrawalValidationThreshold = null;
    } else if (!isValidMoneyAmount(input.withdrawalValidationThreshold)) {
      return { ok: false, error: "Seuil de retrait invalide (entier ≥ 0)." };
    } else data.withdrawalValidationThreshold = input.withdrawalValidationThreshold;
  }

  if ("codUnlockPrice" in input) {
    if (input.codUnlockPrice === null) data.codUnlockPrice = null;
    else if (!isValidMoneyAmount(input.codUnlockPrice)) {
      return { ok: false, error: "Prix COD invalide (entier ≥ 0)." };
    } else data.codUnlockPrice = input.codUnlockPrice;
  }

  return { ok: true, data };
}
