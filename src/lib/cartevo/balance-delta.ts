/**
 * BALANCE DELTA RECONCILIATION
 *
 * Contourne le bug Cartevo #2 (GET /transactions → 404) en matchant
 * sur la variation de payin_balance (endpoint fiable en prod).
 */

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { cartevoGetWalletBalance } from "./client";
import { computeRefundDeadline } from "./order-status";
import { safeLogger } from "@/lib/security/redact";
import { trySendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";
import { settlePaidOrderPayout } from "@/lib/payouts";

const BALANCE_TOLERANCE_PERCENT = 7;
const MAX_MATCH_AGE_MS = 24 * 60 * 60 * 1000;

export interface BalanceMatchResult {
  matched: boolean;
  matchedTxId?: string;
  matchedOrderNumber?: string;
  newPayinBalance?: number;
  deltaObserved?: number;
  expectedAmount?: number;
  reason?:
    | "no_pending_tx"
    | "balance_unchanged"
    | "delta_too_low"
    | "max_attempts_reached"
    | "balance_decreased";
}

export async function snapshotPayinBalance(params: {
  country: string;
  currency: string;
}): Promise<number> {
  try {
    const bal = await cartevoGetWalletBalance({
      country: params.country,
      currency: params.currency,
    });
    safeLogger.info("Balance snapshot", {
      country: params.country,
      payin: bal.payin,
    });
    return bal.payin;
  } catch (err) {
    safeLogger.error("Balance snapshot failed", {
      country: params.country,
      error: err instanceof Error ? err.message : String(err),
    });
    return 0;
  }
}

export async function tryMatchPendingByBalance(params: {
  country: string;
  currency: string;
  source: "polling" | "cron" | "manual_admin";
  targetTxId?: string;
}): Promise<BalanceMatchResult> {
  const { country, currency, source, targetTxId } = params;

  let currentBalance: number;
  try {
    const bal = await cartevoGetWalletBalance({ country, currency });
    currentBalance = bal.payin;
  } catch (err) {
    safeLogger.error("Balance fetch failed during match", {
      country,
      currency,
      error: err instanceof Error ? err.message : String(err),
    });
    return { matched: false, reason: "balance_unchanged" };
  }

  const cutoff = new Date(Date.now() - MAX_MATCH_AGE_MS);
  const where: Prisma.CartevoTransactionWhereInput = {
    status: { in: ["INITIATED", "PENDING"] },
    country,
    currency,
    createdAt: { gte: cutoff },
    payinBalanceBefore: { not: null },
  };

  let pendingTxs;
  if (targetTxId) {
    const target = await db.cartevoTransaction.findUnique({
      where: { cartevoTxId: targetTxId },
      include: { order: true },
    });
    if (!target || target.status === "SUCCESS") {
      return { matched: false, reason: "no_pending_tx" };
    }
    pendingTxs = [target];
  } else {
    pendingTxs = await db.cartevoTransaction.findMany({
      where,
      include: { order: true },
      orderBy: { createdAt: "asc" },
      take: 50,
    });
  }

  if (pendingTxs.length === 0) {
    return { matched: false, reason: "no_pending_tx" };
  }

  for (const tx of pendingTxs) {
    const balanceBefore = Number(tx.payinBalanceBefore ?? 0);
    const expectedAmount = Number(tx.amount);
    const delta = currentBalance - balanceBefore;
    const minExpectedDelta =
      expectedAmount * (1 - BALANCE_TOLERANCE_PERCENT / 100);

    safeLogger.info("Balance match attempt", {
      txId: tx.cartevoTxId,
      orderNumber: tx.order?.orderNumber,
      balanceBefore,
      currentBalance,
      delta,
      expectedAmount,
      minExpectedDelta,
      source,
    });

    await db.cartevoTransaction.update({
      where: { id: tx.id },
      data: { balanceMatchAttempts: { increment: 1 } },
    });

    if (delta < 0) {
      safeLogger.warn("Balance decreased (payout?), skip this iteration", {
        txId: tx.cartevoTxId,
        delta,
      });
      continue;
    }

    if (delta < minExpectedDelta) {
      continue;
    }

    safeLogger.info("Balance MATCH !", {
      txId: tx.cartevoTxId,
      orderNumber: tx.order?.orderNumber,
      delta,
      expectedAmount,
      source,
    });

    await db.$transaction(async (txn) => {
      await txn.cartevoTransaction.update({
        where: { id: tx.id },
        data: {
          status: "SUCCESS",
          completedAt: new Date(),
          payinBalanceAfter: currentBalance,
          balanceMatchedAt: new Date(),
          balanceMatchSource: source,
          errorMessage: `matched_by_balance_delta_${source}`,
        },
      });

      if (tx.orderId) {
        await txn.order.update({
          where: { id: tx.orderId },
          data: {
            paymentStatus: "paid_escrow",
            status: "paid_escrow",
            paidAt: new Date(),
            refundDeadline: computeRefundDeadline(),
            updatedAt: new Date(),
          },
        });
      }
    });

    if (tx.orderId) {
      trySendOrderConfirmationEmail(tx.orderId).catch((err) => {
        safeLogger.error("Email send failed after balance match", {
          orderId: tx.orderId,
          error: err instanceof Error ? err.message : String(err),
        });
      });
      // G4.B — Crée le payout dès la confirmation (escrow physique / instant digital+service).
      await settlePaidOrderPayout(tx.orderId).catch((err) => {
        safeLogger.error("settlePaidOrderPayout failed (balance match)", {
          orderId: tx.orderId,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    }

    return {
      matched: true,
      matchedTxId: tx.cartevoTxId,
      matchedOrderNumber: tx.order?.orderNumber,
      newPayinBalance: currentBalance,
      deltaObserved: delta,
      expectedAmount,
    };
  }

  return {
    matched: false,
    reason: "delta_too_low",
    newPayinBalance: currentBalance,
  };
}

export async function scanAndMatchAllPending(
  source: "polling" | "cron"
): Promise<{
  scanned: number;
  matched: number;
  results: BalanceMatchResult[];
}> {
  const cutoff = new Date(Date.now() - MAX_MATCH_AGE_MS);
  const groups = await db.cartevoTransaction.groupBy({
    by: ["country", "currency"],
    where: {
      status: { in: ["INITIATED", "PENDING"] },
      createdAt: { gte: cutoff },
      payinBalanceBefore: { not: null },
    },
  });

  const results: BalanceMatchResult[] = [];
  let matched = 0;

  for (const group of groups) {
    if (!group.country || !group.currency) continue;
    const r = await tryMatchPendingByBalance({
      country: group.country,
      currency: group.currency,
      source,
    });
    results.push(r);
    if (r.matched) matched++;
  }

  return { scanned: groups.length, matched, results };
}
