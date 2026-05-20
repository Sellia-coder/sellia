import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { trySendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import {
  extractTransactionIdFromWebhook,
  hashWebhookBody,
  getCartevoWebhookId,
} from "@/lib/cartevo/webhook";
import {
  verifyTransactionWithCartevo,
  compareWithExpected,
} from "@/lib/cartevo/verify";
import { isIpWhitelisted } from "@/lib/cartevo/ip-whitelist";
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  computeRefundDeadline,
} from "@/lib/cartevo/order-status";
import { safeLogger } from "@/lib/security/redact";
import {
  computeNextRetryAt,
  WEBHOOK_ERROR_STATUS,
} from "@/lib/cartevo/webhook-retry";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  const limit = rateLimit(
    `webhook_cartevo:${ip}`,
    RATE_LIMITS.WEBHOOK_PER_IP.limit,
    RATE_LIMITS.WEBHOOK_PER_IP.windowMs
  );
  if (!limit.allowed) {
    safeLogger.warn("Webhook rate limit exceeded", { ip });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!isIpWhitelisted(ip)) {
    safeLogger.warn("Webhook from non-whitelisted IP", { ip });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    safeLogger.error("Failed to read webhook body", { error: String(err) });
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const extracted = extractTransactionIdFromWebhook(rawBody);
  if (!extracted.ok || !extracted.transactionId) {
    safeLogger.warn("Webhook: invalid body format", { reason: extracted.reason });
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  const transactionId = extracted.transactionId;
  const event = extracted.event || "unknown";

  const bodyHash = hashWebhookBody(rawBody);
  const webhookIdHeader = request.headers.get("x-webhook-id");
  const webhookId = getCartevoWebhookId(webhookIdHeader, {
    event,
    data: { transaction_id: transactionId },
  });

  const existing = await db.cartevoWebhookLog.findUnique({
    where: { webhookId },
  });

  if (existing?.processed) {
    safeLogger.info("Webhook already processed (idempotent)", { webhookId });
    return NextResponse.json({ ok: true, deduplicated: true });
  }

  const headersObj: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  let webhookLog;
  if (existing) {
    webhookLog = existing;
  } else {
    try {
      webhookLog = await db.cartevoWebhookLog.create({
        data: {
          webhookId,
          event,
          cartevoTxId: transactionId,
          processed: false,
          rawHeaders: headersObj as Prisma.InputJsonValue,
          rawBody: { raw: rawBody, hash: bodyHash } as Prisma.InputJsonValue,
          signatureValid: true,
          receivedAt: new Date(),
        },
      });
    } catch (err) {
      safeLogger.error("Failed to log webhook", { error: String(err) });
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  let verified;
  try {
    verified = await verifyTransactionWithCartevo(transactionId);
  } catch (err) {
    safeLogger.error("Verify-on-pull threw", {
      transactionId,
      error: err instanceof Error ? err.message : String(err),
    });
    await db.cartevoWebhookLog.update({
      where: { id: webhookLog.id },
      data: {
        errorMessage: WEBHOOK_ERROR_STATUS.VERIFY_FAILED,
        lastRetryAt: new Date(),
        retryCount: { increment: 1 },
        nextRetryAt: computeNextRetryAt(webhookLog.retryCount + 1),
      },
    });
    return NextResponse.json({ ok: false, error: "verify_failed_will_retry" });
  }

  const cartevoTx = await db.cartevoTransaction.findUnique({
    where: { cartevoTxId: transactionId },
    include: { order: true },
  });

  if (!cartevoTx && !verified.found) {
    safeLogger.warn("Webhook truly fake (no local tx, no cartevo tx)", {
      transactionId,
    });
    await db.cartevoWebhookLog.update({
      where: { id: webhookLog.id },
      data: {
        errorMessage: WEBHOOK_ERROR_STATUS.NO_LOCAL_TX,
        processed: true,
        processedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, ignored: "fake_webhook" });
  }

  if (cartevoTx && !verified.found) {
    const newRetryCount = webhookLog.retryCount + 1;
    const nextRetry = computeNextRetryAt(newRetryCount);

    safeLogger.warn("Webhook pending propagation at Cartevo (race condition)", {
      transactionId,
      retryCount: newRetryCount,
      nextRetryAt: nextRetry?.toISOString(),
    });

    await db.cartevoWebhookLog.update({
      where: { id: webhookLog.id },
      data: {
        errorMessage: nextRetry
          ? WEBHOOK_ERROR_STATUS.PENDING_PROPAGATION
          : WEBHOOK_ERROR_STATUS.INVESTIGATION_NEEDED,
        processed: false,
        retryCount: newRetryCount,
        lastRetryAt: new Date(),
        nextRetryAt: nextRetry,
      },
    });

    return NextResponse.json({
      ok: true,
      pending_propagation: true,
      retry_count: newRetryCount,
      next_retry_at: nextRetry?.toISOString() ?? null,
    });
  }

  if (!cartevoTx && verified.found) {
    safeLogger.warn("Webhook for unknown local transaction (but Cartevo knows it)", {
      transactionId,
    });
    await db.cartevoWebhookLog.update({
      where: { id: webhookLog.id },
      data: {
        errorMessage: WEBHOOK_ERROR_STATUS.NO_LOCAL_TX,
        processed: true,
        processedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, ignored: "no_local_tx_but_cartevo_has" });
  }

  if (!cartevoTx) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const comparison = compareWithExpected(verified, {
    expectedAmount: Number(cartevoTx.amount),
    expectedCurrency: cartevoTx.currency,
  });

  if (!comparison.match) {
    safeLogger.error("Webhook amount/currency mismatch", {
      transactionId,
      comparison,
    });
    await db.cartevoWebhookLog.update({
      where: { id: webhookLog.id },
      data: {
        errorMessage: `${WEBHOOK_ERROR_STATUS.AMOUNT_MISMATCH}: ${comparison.reason}`,
        processed: true,
        processedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: false, error: "amount_mismatch" });
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.cartevoTransaction.update({
        where: { id: cartevoTx.id },
        data: {
          status: verified.status ?? cartevoTx.status,
          completedAt:
            verified.status === "SUCCESS" ||
            verified.status === "FAILED" ||
            verified.status === "CANCELLED"
              ? new Date()
              : null,
          errorMessage: verified.errorMessage,
          rawResponse: verified as unknown as Prisma.InputJsonValue,
        },
      });

      if (cartevoTx.orderId) {
        if (verified.status === "SUCCESS") {
          await tx.order.update({
            where: { id: cartevoTx.orderId },
            data: {
              paymentStatus: PAYMENT_STATUS.PAID_ESCROW,
              status: ORDER_STATUS.PAID_ESCROW,
              paidAt: new Date(),
              refundDeadline: computeRefundDeadline(),
            },
          });
        } else if (
          verified.status === "FAILED" ||
          verified.status === "CANCELLED"
        ) {
          await tx.order.update({
            where: { id: cartevoTx.orderId },
            data: {
              paymentStatus: PAYMENT_STATUS.FAILED,
              status: ORDER_STATUS.FAILED,
            },
          });
        }
      }

      await tx.cartevoWebhookLog.update({
        where: { id: webhookLog.id },
        data: {
          processed: true,
          processedAt: new Date(),
          errorMessage: null,
        },
      });
    });

    safeLogger.info("Webhook processed successfully", {
      transactionId,
      status: verified.status,
      orderNumber: cartevoTx.order?.orderNumber,
    });

    if (verified.status === "SUCCESS" && cartevoTx.orderId) {
      await trySendOrderConfirmationEmail(cartevoTx.orderId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    safeLogger.error("Webhook DB update failed", {
      transactionId,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { ok: false, error: "db_update_failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "cartevo-webhook",
    timestamp: new Date().toISOString(),
  });
}
