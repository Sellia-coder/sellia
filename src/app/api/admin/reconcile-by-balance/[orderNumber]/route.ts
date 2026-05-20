import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tryMatchPendingByBalance } from "@/lib/cartevo/balance-delta";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderNumber } = await params;
  const decoded = decodeURIComponent(orderNumber);

  const order = await db.order.findFirst({
    where: { orderNumber: decoded, shop: { ownerId: user.id } },
    include: { cartevoTransaction: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!order.cartevoTransaction?.cartevoTxId) {
    return NextResponse.json({
      ok: false,
      error: "no_cartevo_transaction",
    });
  }

  const country = order.cartevoTransaction.country || "CM";
  const currency = order.cartevoTransaction.currency || "XAF";

  const result = await tryMatchPendingByBalance({
    country,
    currency,
    source: "manual_admin",
    targetTxId: order.cartevoTransaction.cartevoTxId,
  });

  if (result.matched) {
    return NextResponse.json({
      ok: true,
      reconciled: true,
      new_payment_status: "paid_escrow",
      delta_observed: result.deltaObserved,
    });
  }

  return NextResponse.json({
    ok: true,
    reconciled: false,
    still_pending: true,
    reason: result.reason,
    new_payin_balance: result.newPayinBalance,
  });
}
