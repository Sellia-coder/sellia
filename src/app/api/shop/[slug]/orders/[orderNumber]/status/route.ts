import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTransactionWithCartevo } from "@/lib/cartevo/verify";
import { healOrderPaymentDesync } from "@/lib/cartevo/sync-order-payment";
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  computeRefundDeadline,
  isOrderPaid,
} from "@/lib/cartevo/order-status";
import { settlePaidOrderPayout } from "@/lib/payouts";
import { safeLogger } from "@/lib/security/redact";
import { trySendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";

export const dynamic = "force-dynamic";

/**
 * GET /api/shop/[slug]/orders/[orderNumber]/status
 * Polling léger : répare la désync locale, puis verify-on-pull si besoin.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; orderNumber: string }> }
) {
  const { slug, orderNumber } = await params;

  const order = await db.order.findFirst({
    where: {
      orderNumber,
      shop: { slug },
    },
    include: { cartevoTransaction: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (isOrderPaid(order.paymentStatus)) {
    return NextResponse.json({
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      paidAt: order.paidAt?.toISOString() ?? null,
    });
  }

  const cartevoTx = order.cartevoTransaction;

  if (!cartevoTx) {
    return NextResponse.json({
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      paidAt: order.paidAt?.toISOString() ?? null,
    });
  }

  // Réparer désync : tx locale SUCCESS mais commande pas encore payée
  if (cartevoTx.status === "SUCCESS") {
    const healed = await healOrderPaymentDesync(order.id);
    if (healed?.healed || isOrderPaid(healed?.paymentStatus ?? "")) {
      const fresh = await db.order.findUnique({
        where: { id: order.id },
        select: { paymentStatus: true, status: true, paidAt: true },
      });
      return NextResponse.json({
        paymentStatus: fresh?.paymentStatus ?? PAYMENT_STATUS.PAID_ESCROW,
        orderStatus: fresh?.status ?? ORDER_STATUS.PAID_ESCROW,
        paidAt: fresh?.paidAt?.toISOString() ?? null,
      });
    }
  }

  if (cartevoTx.status === "FAILED" || cartevoTx.status === "CANCELLED") {
    if (
      order.paymentStatus !== PAYMENT_STATUS.FAILED &&
      order.paymentStatus !== PAYMENT_STATUS.CANCELLED
    ) {
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PAYMENT_STATUS.FAILED,
          status: ORDER_STATUS.CANCELLED,
        },
      });
    }
    return NextResponse.json({
      paymentStatus: PAYMENT_STATUS.FAILED,
      orderStatus: ORDER_STATUS.CANCELLED,
      paidAt: null,
    });
  }

  // Verify-on-pull : interroger Cartevo si la tx locale n'est pas terminale
  const verified = await verifyTransactionWithCartevo(cartevoTx.cartevoTxId);

  if (!verified.found) {
    return NextResponse.json({
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      paidAt: order.paidAt?.toISOString() ?? null,
    });
  }

  if (verified.status === "SUCCESS") {
    await db.cartevoTransaction.update({
      where: { id: cartevoTx.id },
      data: {
        status: "SUCCESS",
        completedAt: new Date(),
      },
    });

    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PAYMENT_STATUS.PAID_ESCROW,
        status: ORDER_STATUS.PAID_ESCROW,
        paidAt: new Date(),
        refundDeadline: computeRefundDeadline(),
      },
    });

    await settlePaidOrderPayout(order.id).catch((err) => {
      safeLogger.error("settlePaidOrderPayout failed (verify-on-pull)", {
        orderId: order.id,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    trySendOrderConfirmationEmail(order.id).catch((err) => {
      safeLogger.error("Order confirmation email failed (verify-on-pull)", {
        orderId: order.id,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    const fresh = await db.order.findUnique({
      where: { id: order.id },
      select: { paymentStatus: true, status: true, paidAt: true },
    });

    return NextResponse.json({
      paymentStatus: fresh?.paymentStatus ?? PAYMENT_STATUS.PAID_ESCROW,
      orderStatus: fresh?.status ?? ORDER_STATUS.PAID_ESCROW,
      paidAt: fresh?.paidAt?.toISOString() ?? new Date().toISOString(),
    });
  }

  if (verified.status === "FAILED" || verified.status === "CANCELLED") {
    await db.cartevoTransaction.update({
      where: { id: cartevoTx.id },
      data: {
        status: verified.status,
        errorMessage: verified.errorMessage,
        completedAt: new Date(),
      },
    });

    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PAYMENT_STATUS.FAILED,
        status: ORDER_STATUS.CANCELLED,
      },
    });

    return NextResponse.json({
      paymentStatus: PAYMENT_STATUS.FAILED,
      orderStatus: ORDER_STATUS.CANCELLED,
      paidAt: null,
    });
  }

  return NextResponse.json({
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
    paidAt: order.paidAt?.toISOString() ?? null,
  });
}
