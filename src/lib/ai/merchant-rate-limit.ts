/**
 * Rate-limiting des générations IA par marchand (protection des coûts plateforme).
 * Réutilise le store en mémoire de @/lib/security/rate-limit (single-instance).
 * Pour multi-instance → migrer vers Redis (signalé dans security/rate-limit.ts).
 *
 * ⚠️ Vérification AVANT l'appel IA payant ; consommation uniquement si autorisé.
 * ⚠️ Fail-open sur exception interne (ne jamais bloquer à cause d'un bug).
 */

import { peekRateLimit, rateLimit } from "@/lib/security/rate-limit";
import { db } from "@/lib/db";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export type AiGenerationType =
  | "image_hero"
  | "text_description"
  | "text_advice"
  | "text_shop_generate";

type PlanTier = "free" | "pro";

type WindowConfig = { limit: number; windowMs: number };

type TypeLimits = {
  burst: WindowConfig;
  hour: WindowConfig;
  day: WindowConfig;
};

const AI_LIMITS: Record<PlanTier, Record<AiGenerationType, TypeLimits>> = {
  free: {
    image_hero: {
      burst: { limit: 2, windowMs: MIN },
      hour: { limit: 5, windowMs: HOUR },
      day: { limit: 20, windowMs: DAY },
    },
    text_description: {
      burst: { limit: 5, windowMs: MIN },
      hour: { limit: 15, windowMs: HOUR },
      day: { limit: 50, windowMs: DAY },
    },
    text_advice: {
      burst: { limit: 3, windowMs: MIN },
      hour: { limit: 10, windowMs: HOUR },
      day: { limit: 30, windowMs: DAY },
    },
    text_shop_generate: {
      burst: { limit: 2, windowMs: MIN },
      hour: { limit: 5, windowMs: HOUR },
      day: { limit: 15, windowMs: DAY },
    },
  },
  pro: {
    image_hero: {
      burst: { limit: 5, windowMs: MIN },
      hour: { limit: 10, windowMs: HOUR },
      day: { limit: 30, windowMs: DAY },
    },
    text_description: {
      burst: { limit: 5, windowMs: MIN },
      hour: { limit: 20, windowMs: HOUR },
      day: { limit: 80, windowMs: DAY },
    },
    text_advice: {
      burst: { limit: 5, windowMs: MIN },
      hour: { limit: 15, windowMs: HOUR },
      day: { limit: 50, windowMs: DAY },
    },
    text_shop_generate: {
      burst: { limit: 3, windowMs: MIN },
      hour: { limit: 8, windowMs: HOUR },
      day: { limit: 25, windowMs: DAY },
    },
  },
};

const TYPE_LABELS: Record<AiGenerationType, string> = {
  image_hero: "images",
  text_description: "descriptions",
  text_advice: "conseils IA",
  text_shop_generate: "générations de boutique",
};

export function planToTier(plan: string | null | undefined): PlanTier {
  const p = (plan ?? "free").toLowerCase();
  if (p === "pro" || p === "business") return "pro";
  return "free";
}

export async function getMerchantPlanForUser(userId: string): Promise<PlanTier> {
  try {
    const shop = await db.shop.findFirst({
      where: { ownerId: userId },
      select: { plan: true },
      orderBy: { createdAt: "desc" },
    });
    return planToTier(shop?.plan);
  } catch {
    return "free";
  }
}

function bucketKey(
  merchantKey: string,
  type: AiGenerationType,
  window: keyof TypeLimits
): string {
  return `ai:${type}:${window}:${merchantKey}`;
}

export interface AiRateLimitDenied {
  allowed: false;
  message: string;
  retryAfterSec: number;
}

export interface AiRateLimitAllowed {
  allowed: true;
}

export type AiRateLimitResult = AiRateLimitAllowed | AiRateLimitDenied;

function peekAllWindows(
  merchantKey: string,
  type: AiGenerationType,
  tier: PlanTier
): AiRateLimitResult {
  const limits = AI_LIMITS[tier][type];
  let maxResetIn = 0;

  for (const window of ["burst", "hour", "day"] as const) {
    const cfg = limits[window];
    const key = bucketKey(merchantKey, type, window);
    const peek = peekRateLimit(key, cfg.limit);
    if (!peek.allowed) {
      maxResetIn = Math.max(maxResetIn, peek.resetIn);
    }
  }

  if (maxResetIn > 0) {
    return {
      allowed: false,
      message: aiRateLimitExceededMessage(maxResetIn, type),
      retryAfterSec: Math.ceil(maxResetIn / 1000),
    };
  }

  return { allowed: true };
}

function consumeAllWindows(
  merchantKey: string,
  type: AiGenerationType,
  tier: PlanTier
): void {
  const limits = AI_LIMITS[tier][type];
  for (const window of ["burst", "hour", "day"] as const) {
    const cfg = limits[window];
    rateLimit(bucketKey(merchantKey, type, window), cfg.limit, cfg.windowMs);
  }
}

/**
 * Vérifie les quotas puis consomme une unité sur chaque fenêtre.
 * À appeler immédiatement AVANT l'appel IA payant.
 */
export function enforceAiRateLimit(
  merchantKey: string,
  type: AiGenerationType,
  tier: PlanTier = "free"
): AiRateLimitResult {
  try {
    const peek = peekAllWindows(merchantKey, type, tier);
    if (!peek.allowed) {
      console.warn("[ai-rate-limit] exceeded", {
        merchantKey,
        type,
        tier,
        retryAfterSec: peek.retryAfterSec,
      });
      return peek;
    }

    consumeAllWindows(merchantKey, type, tier);
    return { allowed: true };
  } catch (err) {
    console.error("[ai-rate-limit] enforce error (fail-open):", err);
    return { allowed: true };
  }
}

/** Lecture seule — utile pour afficher un état sans consommer. */
export function peekAiRateLimit(
  merchantKey: string,
  type: AiGenerationType,
  tier: PlanTier = "free"
): AiRateLimitResult {
  try {
    return peekAllWindows(merchantKey, type, tier);
  } catch {
    return { allowed: true };
  }
}

export function aiRateLimitExceededMessage(
  resetInMs: number,
  type: AiGenerationType
): string {
  const minutes = Math.max(1, Math.ceil(resetInMs / MIN));
  const label = TYPE_LABELS[type];
  return `Vous avez atteint votre limite de générations IA (${label}). Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`;
}

export function merchantKeyForUser(userId: string): string {
  return `user:${userId}`;
}

export function merchantKeyForIp(ip: string): string {
  return `ip:${ip}`;
}
