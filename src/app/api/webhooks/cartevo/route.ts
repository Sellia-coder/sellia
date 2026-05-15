import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
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
import type { CartevoTxStatus } from "@/lib/cartevo/types";

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

  if (existing) {
    safeLogger.info("Webhook already processed (idempotent)", {
      webhookId,
      transactionId,
    });
    return NextResponse.json({ ok: true, deduplicated: true });
  }

  const headersObj: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  let webhookLog;
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

  let verified;
  try {
    verified = await verifyTransactionWithCartevo(transactionId);
  } catch (err) {
    safeLogger.error("Verify-on-pull failed", {
      transactionId,
      error: err instanceof Error ? err.message : String(err),
    });
    await db.cartevoWebhookLog.update({
      where: { id: webhookLog.id },
      data: {
        errorMessage: "verify_on_pull_failed",
        processedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: false, error: "verify_failed" });
  }

  if (!verified.found) {
    safeLogger.warn("Webhook for unknown Cartevo transaction", { transactionId });
    await db.cartevoWebhookLog.update({
      where: { id: webhookLog.id },
      data: {
        errorMessage: "transaction_not_found_at_cartevo",
        processedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, ignored: "tx_not_found" });
  }

  const cartevoTx = await db.cartevoTransaction.findUnique({
    where: { cartevoTxId: transactionId },
    include: { order: true },
  });

  if (!cartevoTx) {
    safeLogger.warn("Webhook for unknown local transaction", { transactionId });
    await db.cartevoWebhookLog.update({
      where: { id: webhookLog.id },
      data: {
        errorMessage: "no_local_transaction",
        processedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, ignored: "no_local_tx" });
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
        errorMessage: `amount_mismatch: ${comparison.reason}`,
        processedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: false, error: "amount_mismatch" });
  }

  const terminalStatuses: CartevoTxStatus[] = [
    "SUCCESS",
    "FAILED",
    "CANCELLED",
  ];
  const isTerminal =
    verified.status !== undefined && terminalStatuses.includes(verified.status);

  try {
    await db.$transaction(async (tx) => {
      await tx.cartevoTransaction.update({
        where: { id: cartevoTx.id },
        data: {
          status: verified.status ?? cartevoTx.status,
          completedAt: isTerminal ? new Date() : null,
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
        },
      });
    });

    safeLogger.info("Webhook processed successfully", {
      transactionId,
      status: verified.status,
      orderNumber: cartevoTx.order?.orderNumber,
    });

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
