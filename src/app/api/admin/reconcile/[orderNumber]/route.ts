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

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const decoded = decodeURIComponent(orderNumber);

    const order = await db.order.findFirst({
      where: { orderNumber: decoded },
      include: {
        shop: { select: { id: true, slug: true, ownerId: true } },
        cartevoTransaction: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.cartevoTransaction) {
      return NextResponse.json({
        ok: false,
        error: "no_cartevo_transaction",
        message: "Cette commande n'a pas de paiement Mobile Money associé.",
      });
    }

    const cartevoTx = order.cartevoTransaction;

    if (cartevoTx.status === "SUCCESS" || cartevoTx.status === "FAILED") {
      return NextResponse.json({
        ok: true,
        already_finalized: true,
        cartevo_status: cartevoTx.status,
        order_payment_status: order.paymentStatus,
      });
    }

    const verified = await verifyTransactionWithCartevo(cartevoTx.cartevoTxId);

    if (!verified.found) {
      return NextResponse.json({
        ok: true,
        still_pending: true,
        message:
          "Le paiement est encore en cours de validation. Veuillez patienter quelques minutes.",
      });
    }

    const comparison = compareWithExpected(verified, {
      expectedAmount: Number(cartevoTx.amount),
      expectedCurrency: cartevoTx.currency,
    });

    if (!comparison.match) {
      safeLogger.error("Manual reconcile: amount mismatch", {
        orderNumber: decoded,
        comparison,
      });
      return NextResponse.json(
        { ok: false, error: "amount_mismatch" },
        { status: 409 }
      );
    }

    if (verified.status === "SUCCESS") {
      await db.$transaction(async (prisma) => {
        await prisma.cartevoTransaction.update({
          where: { id: cartevoTx.id },
          data: {
            status: "SUCCESS",
            completedAt: new Date(),
            rawResponse: verified as unknown as Prisma.InputJsonValue,
          },
        });
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PAYMENT_STATUS.PAID_ESCROW,
            status: ORDER_STATUS.PAID_ESCROW,
            paidAt: new Date(),
            refundDeadline: computeRefundDeadline(),
          },
        });
      });

      safeLogger.info("Manual reconcile: order marked paid_escrow", {
        orderNumber: decoded,
      });

      return NextResponse.json({
        ok: true,
        reconciled: true,
        new_payment_status: PAYMENT_STATUS.PAID_ESCROW,
      });
    }

    if (verified.status === "FAILED" || verified.status === "CANCELLED") {
      await db.$transaction(async (prisma) => {
        await prisma.cartevoTransaction.update({
          where: { id: cartevoTx.id },
          data: {
            status: verified.status,
            completedAt: new Date(),
            errorMessage: verified.errorMessage,
            rawResponse: verified as unknown as Prisma.InputJsonValue,
          },
        });
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PAYMENT_STATUS.FAILED,
            status: ORDER_STATUS.FAILED,
          },
        });
      });

      return NextResponse.json({
        ok: true,
        reconciled: true,
        new_payment_status: PAYMENT_STATUS.FAILED,
      });
    }

    return NextResponse.json({
      ok: true,
      still_pending: true,
      cartevo_status: verified.status,
    });
  } catch (err) {
    safeLogger.error("Manual reconcile error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
