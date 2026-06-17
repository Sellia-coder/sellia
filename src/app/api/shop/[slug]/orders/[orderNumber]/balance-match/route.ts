import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tryMatchPendingByBalance } from "@/lib/cartevo/balance-delta";
import { healOrderPaymentDesync } from "@/lib/cartevo/sync-order-payment";
import { isOrderPaid } from "@/lib/cartevo/order-status";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { z } from "zod/v3";

const paramsSchema = z.object({
  slug: z.string().min(1),
  orderNumber: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; orderNumber: string }> }
) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`balance_match:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }
  const { slug, orderNumber } = parsed.data;
  const decoded = decodeURIComponent(orderNumber);

  const order = await db.order.findFirst({
    where: { orderNumber: decoded, shop: { slug } },
    include: { cartevoTransaction: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (
    order.paymentStatus === "paid_escrow" ||
    order.paymentStatus === "paid_released" ||
    order.paymentStatus === "delivered"
  ) {
    return NextResponse.json({
      ok: true,
      matched: true,
      already_finalized: true,
      new_payment_status: order.paymentStatus,
    });
  }

  if (order.paymentStatus === "failed" || order.paymentStatus === "cancelled") {
    return NextResponse.json({
      ok: true,
      matched: false,
      already_finalized: true,
      new_payment_status: order.paymentStatus,
    });
  }

  if (!order.cartevoTransaction?.cartevoTxId) {
    return NextResponse.json({
      ok: true,
      matched: false,
      still_pending: true,
      reason: "no_cartevo_tx",
    });
  }

  // Tx locale déjà SUCCESS mais commande pas synchronisée
  if (order.cartevoTransaction.status === "SUCCESS") {
    const healed = await healOrderPaymentDesync(order.id);
    if (healed && isOrderPaid(healed.paymentStatus)) {
      return NextResponse.json({
        ok: true,
        matched: true,
        healed: healed.healed,
        new_payment_status: healed.paymentStatus,
      });
    }
  }

  const country = order.cartevoTransaction.country || "CM";
  const currency = order.cartevoTransaction.currency || "XAF";

  const result = await tryMatchPendingByBalance({
    country,
    currency,
    source: "polling",
    targetTxId: order.cartevoTransaction.cartevoTxId,
  });

  if (result.matched) {
    return NextResponse.json({
      ok: true,
      matched: true,
      new_payment_status: "paid_escrow",
      delta_observed: result.deltaObserved,
      expected_amount: result.expectedAmount,
    });
  }

  return NextResponse.json({
    ok: true,
    matched: false,
    still_pending: true,
    reason: result.reason,
    new_payin_balance: result.newPayinBalance,
  });
}
