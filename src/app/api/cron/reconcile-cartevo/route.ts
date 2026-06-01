import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  verifyTransactionWithCartevo,
  compareWithExpected,
} from "@/lib/cartevo/verify";
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  computeRefundDeadline,
} from "@/lib/cartevo/order-status";
import { safeLogger } from "@/lib/security/redact";
import { trySendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";
import { settlePaidOrderPayout } from "@/lib/payouts";
import {
  computeNextRetryAt,
  WEBHOOK_ERROR_STATUS,
  MAX_RETRY_COUNT,
} from "@/lib/cartevo/webhook-retry";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const startedAt = Date.now();
  const stats = {
    reconciledTransactions: 0,
    retriedWebhooks: 0,
    successCount: 0,
    failedCount: 0,
    stillPending: 0,
    investigationNeeded: 0,
    errors: [] as string[],
  };

  const stuckTxs = await db.cartevoTransaction.findMany({
    where: {
      type: "COLLECT",
      status: { in: ["INITIATED", "PENDING"] },
      initiatedAt: { lt: new Date(Date.now() - 30_000) },
    },
    include: { order: true },
    take: 50,
    orderBy: { initiatedAt: "asc" },
  });

  for (const tx of stuckTxs) {
    try {
      const verified = await verifyTransactionWithCartevo(tx.cartevoTxId);
      stats.reconciledTransactions++;

      if (!verified.found) {
        stats.stillPending++;
        continue;
      }

      const comparison = compareWithExpected(verified, {
        expectedAmount: Number(tx.amount),
        expectedCurrency: tx.currency,
      });

      if (!comparison.match) {
        stats.errors.push(`${tx.cartevoTxId}: amount_mismatch`);
        continue;
      }

      if (verified.status === "SUCCESS") {
        await db.$transaction(async (prisma) => {
          await prisma.cartevoTransaction.update({
            where: { id: tx.id },
            data: {
              status: "SUCCESS",
              completedAt: new Date(),
              rawResponse: verified as unknown as Prisma.InputJsonValue,
            },
          });
          if (tx.orderId) {
            await prisma.order.update({
              where: { id: tx.orderId },
              data: {
                paymentStatus: PAYMENT_STATUS.PAID_ESCROW,
                status: ORDER_STATUS.PAID_ESCROW,
                paidAt: new Date(),
                refundDeadline: computeRefundDeadline(),
              },
            });
          }
        });
        stats.successCount++;
        safeLogger.info("Cron: reconciled tx to SUCCESS", {
          cartevoTxId: tx.cartevoTxId,
          orderNumber: tx.order?.orderNumber,
        });
        if (tx.orderId) {
          await trySendOrderConfirmationEmail(tx.orderId);
          // G4.B — payout dès la confirmation (escrow physique / instant digital+service).
          await settlePaidOrderPayout(tx.orderId).catch((err) => {
            stats.errors.push(
              `settle ${tx.orderId}: ${err instanceof Error ? err.message : String(err)}`
            );
          });
        }
      } else if (
        verified.status === "FAILED" ||
        verified.status === "CANCELLED"
      ) {
        await db.$transaction(async (prisma) => {
          await prisma.cartevoTransaction.update({
            where: { id: tx.id },
            data: {
              status: verified.status,
              completedAt: new Date(),
              errorMessage: verified.errorMessage,
              rawResponse: verified as unknown as Prisma.InputJsonValue,
            },
          });
          if (tx.orderId) {
            await prisma.order.update({
              where: { id: tx.orderId },
              data: {
                paymentStatus: PAYMENT_STATUS.FAILED,
                status: ORDER_STATUS.FAILED,
              },
            });
          }
        });
        stats.failedCount++;
      } else {
        stats.stillPending++;
      }
    } catch (err) {
      stats.errors.push(
        `${tx.cartevoTxId}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  const stuckWebhooks = await db.cartevoWebhookLog.findMany({
    where: {
      processed: false,
      nextRetryAt: { lte: new Date() },
      retryCount: { lt: MAX_RETRY_COUNT },
    },
    take: 50,
    orderBy: { nextRetryAt: "asc" },
  });

  for (const wh of stuckWebhooks) {
    if (!wh.cartevoTxId) {
      await db.cartevoWebhookLog.update({
        where: { id: wh.id },
        data: { processed: true, processedAt: new Date() },
      });
      continue;
    }
    try {
      const verified = await verifyTransactionWithCartevo(wh.cartevoTxId);
      stats.retriedWebhooks++;

      if (!verified.found) {
        const newCount = wh.retryCount + 1;
        const nextRetry = computeNextRetryAt(newCount);
        await db.cartevoWebhookLog.update({
          where: { id: wh.id },
          data: {
            retryCount: newCount,
            lastRetryAt: new Date(),
            nextRetryAt: nextRetry,
            errorMessage: nextRetry
              ? WEBHOOK_ERROR_STATUS.PENDING_PROPAGATION
              : WEBHOOK_ERROR_STATUS.INVESTIGATION_NEEDED,
          },
        });
        if (!nextRetry) stats.investigationNeeded++;
        continue;
      }

      const localTx = await db.cartevoTransaction.findUnique({
        where: { cartevoTxId: wh.cartevoTxId },
      });
      if (!localTx) {
        await db.cartevoWebhookLog.update({
          where: { id: wh.id },
          data: {
            processed: true,
            processedAt: new Date(),
            errorMessage: WEBHOOK_ERROR_STATUS.NO_LOCAL_TX,
          },
        });
        continue;
      }

      const comparison = compareWithExpected(verified, {
        expectedAmount: Number(localTx.amount),
        expectedCurrency: localTx.currency,
      });
      if (!comparison.match) {
        await db.cartevoWebhookLog.update({
          where: { id: wh.id },
          data: {
            processed: true,
            processedAt: new Date(),
            errorMessage: `${WEBHOOK_ERROR_STATUS.AMOUNT_MISMATCH}: ${comparison.reason}`,
          },
        });
        continue;
      }

      if (verified.status === "SUCCESS") {
        await db.$transaction(async (prisma) => {
          await prisma.cartevoTransaction.update({
            where: { id: localTx.id },
            data: {
              status: "SUCCESS",
              completedAt: new Date(),
              rawResponse: verified as unknown as Prisma.InputJsonValue,
            },
          });
          if (localTx.orderId) {
            await prisma.order.update({
              where: { id: localTx.orderId },
              data: {
                paymentStatus: PAYMENT_STATUS.PAID_ESCROW,
                status: ORDER_STATUS.PAID_ESCROW,
                paidAt: new Date(),
                refundDeadline: computeRefundDeadline(),
              },
            });
          }
          await prisma.cartevoWebhookLog.update({
            where: { id: wh.id },
            data: { processed: true, processedAt: new Date() },
          });
        });
        stats.successCount++;
        if (localTx.orderId) {
          await trySendOrderConfirmationEmail(localTx.orderId);
          // G4.B — payout dès la confirmation (escrow physique / instant digital+service).
          await settlePaidOrderPayout(localTx.orderId).catch((err) => {
            stats.errors.push(
              `settle ${localTx.orderId}: ${err instanceof Error ? err.message : String(err)}`
            );
          });
        }
      } else if (
        verified.status === "FAILED" ||
        verified.status === "CANCELLED"
      ) {
        await db.$transaction(async (prisma) => {
          await prisma.cartevoTransaction.update({
            where: { id: localTx.id },
            data: {
              status: verified.status,
              completedAt: new Date(),
              errorMessage: verified.errorMessage,
              rawResponse: verified as unknown as Prisma.InputJsonValue,
            },
          });
          if (localTx.orderId) {
            await prisma.order.update({
              where: { id: localTx.orderId },
              data: {
                paymentStatus: PAYMENT_STATUS.FAILED,
                status: ORDER_STATUS.FAILED,
              },
            });
          }
          await prisma.cartevoWebhookLog.update({
            where: { id: wh.id },
            data: { processed: true, processedAt: new Date() },
          });
        });
        stats.failedCount++;
      }
    } catch (err) {
      stats.errors.push(
        `webhook ${wh.id}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  const durationMs = Date.now() - startedAt;
  safeLogger.info("Cron reconcile completed", { ...stats, durationMs });

  return NextResponse.json({
    ok: true,
    durationMs,
    ...stats,
  });
}
