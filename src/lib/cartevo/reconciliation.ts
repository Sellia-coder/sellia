/**
 * Réconciliation périodique des transactions PENDING.
 * À appeler depuis un cron job (toutes les 5-15 min) pour rattraper
 * les webhooks perdus OU détecter les transactions zombies.
 */

import { db } from "@/lib/db";
import { verifyAndCompare } from "./verify";
import { safeLogger } from "@/lib/security/redact";

const MAX_AGE_MS = 30 * 60 * 1000;

export interface ReconcileResult {
  scanned: number;
  updated: number;
  failed: number;
  details: Array<{
    cartevoTxId: string;
    action: "no_change" | "marked_success" | "marked_failed" | "error";
    reason?: string;
  }>;
}

export async function reconcilePendingTransactions(): Promise<ReconcileResult> {
  const cutoff = new Date(Date.now() - MAX_AGE_MS);

  const pendingTxs = await db.cartevoTransaction.findMany({
    where: {
      status: { in: ["INITIATED", "PENDING"] },
      createdAt: { lt: cutoff },
    },
    include: { order: true },
    take: 100,
  });

  const result: ReconcileResult = {
    scanned: pendingTxs.length,
    updated: 0,
    failed: 0,
    details: [],
  };

  for (const tx of pendingTxs) {
    try {
      const verified = await verifyAndCompare({
        transactionId: tx.cartevoTxId,
        expectedAmount: Number(tx.amount),
        expectedCurrency: tx.currency,
      });

      if (!verified.verified.found) {
        await db.cartevoTransaction.update({
          where: { id: tx.id },
          data: {
            status: "FAILED",
            errorMessage:
              "Transaction not found at Cartevo (reconciliation)",
            completedAt: new Date(),
          },
        });
        result.updated++;
        result.details.push({
          cartevoTxId: tx.cartevoTxId,
          action: "marked_failed",
          reason: "not_found_at_cartevo",
        });
        continue;
      }

      const cartevoStatus = verified.verified.status;

      if (cartevoStatus === "SUCCESS") {
        if (!verified.comparison.match) {
          safeLogger.error("Amount mismatch during reconciliation", {
            txId: tx.cartevoTxId,
            comparison: verified.comparison,
          });
          result.failed++;
          result.details.push({
            cartevoTxId: tx.cartevoTxId,
            action: "error",
            reason: verified.comparison.reason,
          });
          continue;
        }

        await db.cartevoTransaction.update({
          where: { id: tx.id },
          data: { status: "SUCCESS", completedAt: new Date() },
        });
        result.updated++;
        result.details.push({
          cartevoTxId: tx.cartevoTxId,
          action: "marked_success",
        });
      } else if (cartevoStatus === "FAILED" || cartevoStatus === "CANCELLED") {
        await db.cartevoTransaction.update({
          where: { id: tx.id },
          data: {
            status: cartevoStatus,
            errorMessage: verified.verified.errorMessage,
            completedAt: new Date(),
          },
        });
        result.updated++;
        result.details.push({
          cartevoTxId: tx.cartevoTxId,
          action: "marked_failed",
        });
      } else {
        result.details.push({
          cartevoTxId: tx.cartevoTxId,
          action: "no_change",
          reason: `still_${cartevoStatus}`,
        });
      }
    } catch (err) {
      safeLogger.error("Reconciliation error for tx", {
        txId: tx.cartevoTxId,
        error: err instanceof Error ? err.message : String(err),
      });
      result.failed++;
      result.details.push({
        cartevoTxId: tx.cartevoTxId,
        action: "error",
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  safeLogger.info("Reconciliation completed", {
    scanned: result.scanned,
    updated: result.updated,
    failed: result.failed,
  });

  return result;
}
