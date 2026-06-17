/**
 * Répare la désynchronisation : CartevoTransaction déjà SUCCESS en base
 * mais Order.paymentStatus pas encore passé en paid_escrow.
 *
 * N'invente jamais un paiement — ne s'active que si la tx locale est SUCCESS.
 * Idempotent : settlePaidOrderPayout ne double-crédite pas.
 */

import { db } from "@/lib/db";
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  computeRefundDeadline,
  isOrderPaid,
} from "./order-status";
import { settlePaidOrderPayout } from "@/lib/payouts";
import { safeLogger } from "@/lib/security/redact";
import { trySendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";

export type HealOrderPaymentResult = {
  paymentStatus: string;
  orderStatus: string;
  healed: boolean;
};

export async function healOrderPaymentDesync(
  orderId: string
): Promise<HealOrderPaymentResult | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { cartevoTransaction: true },
  });

  if (!order) return null;

  const tx = order.cartevoTransaction;

  if (isOrderPaid(order.paymentStatus)) {
    return {
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      healed: false,
    };
  }

  if (!tx || tx.status !== "SUCCESS") {
    return {
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      healed: false,
    };
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: PAYMENT_STATUS.PAID_ESCROW,
      status: ORDER_STATUS.PAID_ESCROW,
      paidAt: order.paidAt ?? new Date(),
      refundDeadline: order.refundDeadline ?? computeRefundDeadline(),
    },
  });

  safeLogger.info("Healed order payment desync (local Cartevo SUCCESS)", {
    orderNumber: order.orderNumber,
    orderId: order.id,
  });

  await settlePaidOrderPayout(order.id).catch((err) => {
    safeLogger.error("settlePaidOrderPayout failed (heal desync)", {
      orderId: order.id,
      error: err instanceof Error ? err.message : String(err),
    });
  });

  trySendOrderConfirmationEmail(order.id).catch((err) => {
    safeLogger.error("Order confirmation email failed (heal desync)", {
      orderId: order.id,
      error: err instanceof Error ? err.message : String(err),
    });
  });

  return {
    paymentStatus: PAYMENT_STATUS.PAID_ESCROW,
    orderStatus: ORDER_STATUS.PAID_ESCROW,
    healed: true,
  };
}
