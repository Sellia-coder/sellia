import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { safeLogger } from "@/lib/security/redact";

export interface RefundEvent {
  cartevoTxId: string;
  amount: number;
  currency: string;
  reason?: string;
  webhookId: string;
}

export async function handleCartevoRefund(event: RefundEvent): Promise<void> {
  const originalTx = await db.cartevoTransaction.findUnique({
    where: { cartevoTxId: event.cartevoTxId },
    include: { order: true, shop: true },
  });

  if (!originalTx) {
    safeLogger.warn("Refund for unknown Cartevo tx", {
      cartevoTxId: event.cartevoTxId,
      webhookId: event.webhookId,
    });
    return;
  }

  safeLogger.warn("REFUND/REVERSAL detected — manual review required", {
    cartevoTxId: event.cartevoTxId,
    shopId: originalTx.shopId,
    orderId: originalTx.orderId,
    amount: event.amount,
    currency: event.currency,
    reason: event.reason,
    originalStatus: originalTx.status,
  });

  const prev =
    (originalTx.rawResponse as Record<string, unknown> | null) ?? {};

  await db.cartevoTransaction.update({
    where: { id: originalTx.id },
    data: {
      rawResponse: {
        ...prev,
        refundEvent: {
          amount: event.amount,
          currency: event.currency,
          reason: event.reason,
          receivedAt: new Date().toISOString(),
          requiresManualReview: true,
        },
      } as Prisma.InputJsonValue,
    },
  });
}
