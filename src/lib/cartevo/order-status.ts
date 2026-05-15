/**
 * Constantes pour les statuts Order et PaymentStatus.
 * Garde les champs en String dans Prisma pour compatibilité avec l'existant.
 */

export const ORDER_STATUS = {
  PENDING: "pending",
  AWAITING_CONFIRMATION: "awaiting_confirmation",
  PAID_ESCROW: "paid_escrow",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  AWAITING_CONFIRMATION: "awaiting_confirmation",
  PAID_ESCROW: "paid_escrow",
  PAID_OFFLINE: "paid_offline",
  PAID_RELEASED: "paid_released",
  FAILED: "failed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
} as const;

export type OrderStatusValue =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type PaymentStatusValue =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export function isOrderPaid(paymentStatus: string): boolean {
  return (
    paymentStatus === PAYMENT_STATUS.PAID_ESCROW ||
    paymentStatus === PAYMENT_STATUS.PAID_OFFLINE ||
    paymentStatus === PAYMENT_STATUS.PAID_RELEASED
  );
}

export function isOrderActive(status: string): boolean {
  return (
    status !== ORDER_STATUS.CANCELLED &&
    status !== ORDER_STATUS.FAILED &&
    status !== ORDER_STATUS.REFUNDED
  );
}

export const PAYMENT_METHOD = {
  CASH_ON_DELIVERY: "cash_on_delivery",
  ONLINE_MOBILE_MONEY: "online_mobile_money",
  ONLINE_ESCROW: "online_escrow",
} as const;

export type PaymentMethodValue =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const ESCROW_REFUND_DAYS = 6;

export function computeRefundDeadline(from: Date = new Date()): Date {
  const deadline = new Date(from);
  deadline.setDate(deadline.getDate() + ESCROW_REFUND_DAYS);
  return deadline;
}
