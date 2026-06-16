/**
 * Paiement Cartevo pour déblocage COD (feature unlock marchand).
 * Séparé de order-collect : pas d'Order, pas de payout marchand.
 */

import type { Prisma } from "@prisma/client";
import { cartevoCollect } from "./client";
import { CartevoError } from "./types";
import { db } from "@/lib/db";
import { safeLogger } from "@/lib/security/redact";
import { getCodUnlockPrice } from "@/lib/admin/money-config";
import { snapshotPayinBalance } from "./balance-delta";
import type { CartevoCountry, CartevoOperator, CartevoCurrency } from "./types";
import { getCountryInfo } from "./operators-catalog";
import { verifyTransactionWithCartevo, compareWithExpected } from "./verify";

export const COD_UNLOCK_PURPOSE = "COD_UNLOCK" as const;

type RawRequestPayload = {
  purpose?: string;
  shopId?: string;
  userId?: string;
  amount?: number;
};

export function isCodUnlockTransaction(rawRequest: unknown): boolean {
  if (!rawRequest || typeof rawRequest !== "object") return false;
  return (rawRequest as RawRequestPayload).purpose === COD_UNLOCK_PURPOSE;
}

export function getCodUnlockShopId(rawRequest: unknown): string | null {
  if (!rawRequest || typeof rawRequest !== "object") return null;
  const shopId = (rawRequest as RawRequestPayload).shopId;
  return typeof shopId === "string" && shopId.length > 0 ? shopId : null;
}

export interface InitCodUnlockCollectInput {
  shopId: string;
  userId: string;
  country: CartevoCountry;
  operator: CartevoOperator;
  phoneNumber: string;
}

export interface InitCodUnlockCollectResult {
  ok: boolean;
  cartevoTransactionId?: string;
  cartevoTxId?: string;
  amount?: number;
  currency?: CartevoCurrency;
  error?: string;
}

export async function findPendingCodUnlockTx(shopId: string) {
  const pending = await db.cartevoTransaction.findFirst({
    where: {
      shopId,
      orderId: null,
      status: { in: ["INITIATED", "PENDING"] },
    },
    orderBy: { initiatedAt: "desc" },
    select: { id: true, rawRequest: true },
  });
  if (!pending || !isCodUnlockTransaction(pending.rawRequest)) return null;
  return pending;
}

export async function initCodUnlockCollect(
  input: InitCodUnlockCollectInput
): Promise<InitCodUnlockCollectResult> {
  const { shopId, userId, country, operator, phoneNumber } = input;
  const amount = getCodUnlockPrice();

  const countryInfo = getCountryInfo(country);
  if (!countryInfo) {
    return { ok: false, error: "Pays non supporté" };
  }

  const payinBalanceBefore = await snapshotPayinBalance({
    country,
    currency: countryInfo.currency,
  });

  let cartevoResult;
  try {
    cartevoResult = await cartevoCollect({
      operator,
      country,
      phone_number: phoneNumber,
      amount,
      currency: countryInfo.currency,
      notify_url: process.env.CARTEVO_NOTIFY_URL,
    });
  } catch (err) {
    const msg = err instanceof CartevoError ? err.message : String(err);
    safeLogger.error("COD unlock Cartevo collect API error", { shopId, error: msg });
    return { ok: false, error: msg };
  }

  if (!cartevoResult.success || !cartevoResult.data) {
    safeLogger.error("COD unlock Cartevo collect failed", { shopId, cartevoResult });
    return {
      ok: false,
      error: cartevoResult.message || "Le paiement n'a pas pu être initié",
    };
  }

  const data = cartevoResult.data;

  try {
    const cartevoTx = await db.cartevoTransaction.create({
      data: {
        cartevoTxId: data.transaction_id,
        cartevoExternalId: data.external_id,
        type: "COLLECT",
        status: "INITIATED",
        amount,
        currency: countryInfo.currency,
        feeCartevo: 0,
        feeSellia: 0,
        netAmount: amount,
        cartevoRate: 0,
        selliaRate: 0,
        shopPlanAtTime: "platform",
        feeMode: "platform_fee",
        operator,
        country,
        phoneNumber,
        shopId,
        orderId: null,
        payinBalanceBefore,
        balanceMatchAttempts: 0,
        rawRequest: {
          purpose: COD_UNLOCK_PURPOSE,
          shopId,
          userId,
          amount,
        } as Prisma.InputJsonValue,
        rawResponse: data as unknown as Prisma.InputJsonValue,
        initiatedAt: new Date(),
      },
    });

    safeLogger.info("COD unlock collect initiated", {
      shopId,
      cartevoTxId: data.transaction_id,
      amount,
    });

    return {
      ok: true,
      cartevoTransactionId: cartevoTx.id,
      cartevoTxId: data.transaction_id,
      amount,
      currency: countryInfo.currency,
    };
  } catch (err) {
    safeLogger.error("Failed to persist COD unlock CartevoTransaction", {
      shopId,
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "Erreur lors de l'enregistrement du paiement" };
  }
}

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

/**
 * Débloque COD uniquement sur paiement confirmé. Idempotent via @@unique([shopId, feature]).
 */
export async function finalizeCodUnlockInTransaction(
  tx: TxClient,
  params: {
    shopId: string;
    cartevoTxId: string;
    paidAmount: number;
  }
): Promise<{ unlocked: boolean; alreadyUnlocked: boolean }> {
  const existing = await tx.shopFeatureUnlock.findUnique({
    where: { shopId_feature: { shopId: params.shopId, feature: "COD" } },
    select: { id: true },
  });

  if (existing) {
    return { unlocked: true, alreadyUnlocked: true };
  }

  try {
    await tx.shopFeatureUnlock.create({
      data: {
        shopId: params.shopId,
        feature: "COD",
        paidAmount: params.paidAmount,
        paymentMethod: "cartevo",
        paymentRef: params.cartevoTxId,
      },
    });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { unlocked: true, alreadyUnlocked: true };
    }
    throw err;
  }

  return { unlocked: true, alreadyUnlocked: false };
}

export type CodUnlockPaymentStatus = "pending" | "success" | "failed";

export async function resolveCodUnlockPayment(
  cartevoTransactionId: string,
  ownerId: string
): Promise<
  | {
      ok: true;
      status: CodUnlockPaymentStatus;
      unlocked: boolean;
      amount: number;
    }
  | { ok: false; error: string }
> {
  const cartevoTx = await db.cartevoTransaction.findUnique({
    where: { id: cartevoTransactionId },
    include: { shop: { select: { ownerId: true } } },
  });

  if (!cartevoTx || !cartevoTx.shopId) {
    return { ok: false, error: "Transaction introuvable" };
  }

  if (!isCodUnlockTransaction(cartevoTx.rawRequest)) {
    return { ok: false, error: "Transaction invalide" };
  }

  if (cartevoTx.shop?.ownerId !== ownerId) {
    return { ok: false, error: "Non autorisé" };
  }

  const shopId = cartevoTx.shopId;
  const paidAmount = Math.round(Number(cartevoTx.amount));

  const existingUnlock = await db.shopFeatureUnlock.findUnique({
    where: { shopId_feature: { shopId, feature: "COD" } },
    select: { id: true },
  });
  if (existingUnlock) {
    return { ok: true, status: "success", unlocked: true, amount: paidAmount };
  }

  if (cartevoTx.status === "SUCCESS") {
    await db.$transaction(async (tx) => {
      await finalizeCodUnlockInTransaction(tx, {
        shopId,
        cartevoTxId: cartevoTx.cartevoTxId,
        paidAmount,
      });
    });
    return { ok: true, status: "success", unlocked: true, amount: paidAmount };
  }

  if (cartevoTx.status === "FAILED" || cartevoTx.status === "CANCELLED") {
    return { ok: true, status: "failed", unlocked: false, amount: paidAmount };
  }

  const verified = await verifyTransactionWithCartevo(cartevoTx.cartevoTxId);
  if (!verified.found) {
    return { ok: true, status: "pending", unlocked: false, amount: paidAmount };
  }

  const comparison = compareWithExpected(verified, {
    expectedAmount: paidAmount,
    expectedCurrency: cartevoTx.currency,
  });

  if (!comparison.match) {
    safeLogger.error("COD unlock amount mismatch", {
      cartevoTxId: cartevoTx.cartevoTxId,
      comparison,
    });
    return { ok: true, status: "failed", unlocked: false, amount: paidAmount };
  }

  if (verified.status === "SUCCESS") {
    await db.$transaction(async (tx) => {
      await tx.cartevoTransaction.update({
        where: { id: cartevoTx.id },
        data: {
          status: "SUCCESS",
          completedAt: new Date(),
          rawResponse: verified as unknown as Prisma.InputJsonValue,
        },
      });
      await finalizeCodUnlockInTransaction(tx, {
        shopId,
        cartevoTxId: cartevoTx.cartevoTxId,
        paidAmount,
      });
    });
    return { ok: true, status: "success", unlocked: true, amount: paidAmount };
  }

  if (verified.status === "FAILED" || verified.status === "CANCELLED") {
    await db.cartevoTransaction.update({
      where: { id: cartevoTx.id },
      data: {
        status: verified.status,
        errorMessage: verified.errorMessage,
        completedAt: new Date(),
        rawResponse: verified as unknown as Prisma.InputJsonValue,
      },
    });
    return { ok: true, status: "failed", unlocked: false, amount: paidAmount };
  }

  return { ok: true, status: "pending", unlocked: false, amount: paidAmount };
}
