import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
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
import { settlePaidOrderPayout } from "@/lib/payouts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; orderNumber: string }> }
) {
  const ip = getClientIp(request.headers);

  const limit = rateLimit(`payment_status:${ip}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: Math.ceil(limit.resetIn / 1000),
      },
      { status: 429 }
    );
  }

  try {
    const { slug, orderNumber } = await params;

    const order = await db.order.findFirst({
      where: { orderNumber, shop: { slug } },
      include: {
        shop: { select: { slug: true, currency: true } },
        cartevoTransaction: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.cartevoTransaction) {
      return NextResponse.json({
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        qrCode: order.qrCode,
        verifiedAt: new Date().toISOString(),
      });
    }

    const cartevoTx = order.cartevoTransaction;

    if (cartevoTx.status === "SUCCESS" || cartevoTx.status === "FAILED") {
      return NextResponse.json({
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        qrCode: order.qrCode,
        verifiedAt: new Date().toISOString(),
      });
    }

    const verified = await verifyTransactionWithCartevo(cartevoTx.cartevoTxId);

    if (!verified.found) {
      return NextResponse.json({
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        qrCode: order.qrCode,
        verifiedAt: new Date().toISOString(),
      });
    }

    const comparison = compareWithExpected(verified, {
      expectedAmount: Number(cartevoTx.amount),
      expectedCurrency: cartevoTx.currency,
    });

    if (!comparison.match) {
      safeLogger.error("Amount/currency mismatch in status poll", {
        orderNumber: order.orderNumber,
        comparison,
      });
      return NextResponse.json({
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        qrCode: order.qrCode,
        verifiedAt: new Date().toISOString(),
      });
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

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PAYMENT_STATUS.PAID_ESCROW,
            status: ORDER_STATUS.PAID_ESCROW,
            paidAt: new Date(),
            refundDeadline: computeRefundDeadline(),
          },
        });
      });

      safeLogger.info("Order marked PAID_ESCROW via status polling", {
        orderNumber: order.orderNumber,
      });

      // G4.B — Crée le payout (escrow physique / libération instantanée digital+service).
      // Idempotent : sûr même si le webhook l'a déjà réglé.
      await settlePaidOrderPayout(order.id).catch((err) => {
        safeLogger.error("settlePaidOrderPayout failed (status polling)", {
          orderNumber: order.orderNumber,
          error: err instanceof Error ? err.message : String(err),
        });
      });

      return NextResponse.json({
        orderNumber: order.orderNumber,
        paymentStatus: PAYMENT_STATUS.PAID_ESCROW,
        orderStatus: ORDER_STATUS.PAID_ESCROW,
        total: order.total,
        paymentMethod: order.paymentMethod,
        qrCode: order.qrCode,
        verifiedAt: new Date().toISOString(),
      });
    }

    if (verified.status === "FAILED" || verified.status === "CANCELLED") {
      await db.$transaction(async (tx) => {
        await tx.cartevoTransaction.update({
          where: { id: cartevoTx.id },
          data: {
            status: verified.status,
            errorMessage: verified.errorMessage,
            completedAt: new Date(),
            rawResponse: verified as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PAYMENT_STATUS.FAILED,
            status: ORDER_STATUS.FAILED,
          },
        });
      });

      return NextResponse.json({
        orderNumber: order.orderNumber,
        paymentStatus: PAYMENT_STATUS.FAILED,
        orderStatus: ORDER_STATUS.FAILED,
        total: order.total,
        paymentMethod: order.paymentMethod,
        qrCode: order.qrCode,
        verifiedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      total: order.total,
      paymentMethod: order.paymentMethod,
      qrCode: order.qrCode,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    safeLogger.error("Status polling error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
