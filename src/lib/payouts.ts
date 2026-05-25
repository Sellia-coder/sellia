import { db } from "@/lib/db";
import { Prisma, PayoutStatus, PayoutType } from "@prisma/client";

interface CreatePayoutInput {
  orderId: string;
  payoutType: PayoutType;
  releaseImmediately?: boolean;
}

function selliaCommissionRate(plan: string): number {
  if (plan === "pro" || plan === "business") return 4;
  return 6;
}

function resolvePayoutDestination(shop: {
  payoutPhone: string | null;
  payoutOperator: string | null;
  payoutCountry: string | null;
  phone: string | null;
  country: string | null;
}) {
  return {
    phoneNumber: shop.payoutPhone || shop.phone || "0000000000",
    operator: shop.payoutOperator || "mtn",
    country: shop.payoutCountry || shop.country || "CM",
  };
}

/**
 * Crée un Payout à partir d'une commande livrée. Idempotent par orderId.
 */
export async function createPayoutFromOrder(input: CreatePayoutInput) {
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    include: {
      shop: {
        select: {
          id: true,
          plan: true,
          currency: true,
          payoutPhone: true,
          payoutOperator: true,
          payoutCountry: true,
          phone: true,
          country: true,
        },
      },
    },
  });

  if (!order) return null;

  const existing = await db.payout.findUnique({
    where: { orderId: input.orderId },
  });
  if (existing) return existing;

  const plan = order.shop.plan || "free";
  const commissionRate = selliaCommissionRate(plan);
  const grossAmount = order.total - order.shippingPrice;
  const commissionAmount = Math.round(
    (grossAmount * commissionRate) / 100
  );
  const merchantAmount =
    grossAmount - commissionAmount + order.shippingPrice;

  const initialStatus = input.releaseImmediately
    ? PayoutStatus.AVAILABLE
    : PayoutStatus.PENDING_ESCROW;

  const releasedAt = input.releaseImmediately ? new Date() : null;
  const dest = resolvePayoutDestination(order.shop);

  const payout = await db.payout.create({
    data: {
      shopId: order.shop.id,
      orderId: order.id,
      payoutType: input.payoutType,
      amount: new Prisma.Decimal(merchantAmount),
      grossAmount: new Prisma.Decimal(grossAmount),
      commissionRate: new Prisma.Decimal(commissionRate),
      commissionAmount: new Prisma.Decimal(commissionAmount),
      feeCartevo: new Prisma.Decimal(0),
      netAmount: new Prisma.Decimal(merchantAmount),
      currency: order.shop.currency || "XAF",
      operator: dest.operator,
      country: dest.country,
      phoneNumber: dest.phoneNumber,
      status: initialStatus,
      releasedAt,
      description: `Vente commande ${order.orderNumber}`,
    },
  });

  return payout;
}

export async function releasePayout(payoutId: string) {
  const payout = await db.payout.findUnique({ where: { id: payoutId } });
  if (!payout) return null;
  if (payout.status !== PayoutStatus.PENDING_ESCROW) return payout;

  return db.payout.update({
    where: { id: payoutId },
    data: {
      status: PayoutStatus.AVAILABLE,
      releasedAt: new Date(),
    },
  });
}

export interface ShopBalances {
  available: number;
  pendingEscrow: number;
  inProgress: number;
  paidTotal: number;
  refunded: number;
}

export async function getShopBalances(shopId: string): Promise<ShopBalances> {
  const payouts = await db.payout.findMany({
    where: { shopId },
    select: { status: true, amount: true },
  });

  const sum = (filter: (p: (typeof payouts)[number]) => boolean) =>
    payouts
      .filter(filter)
      .reduce((acc, p) => acc + Number(p.amount), 0);

  return {
    available: sum((p) => p.status === PayoutStatus.AVAILABLE),
    pendingEscrow: sum((p) => p.status === PayoutStatus.PENDING_ESCROW),
    inProgress: sum(
      (p) =>
        p.status === PayoutStatus.REQUESTED ||
        p.status === PayoutStatus.PROCESSING ||
        p.status === PayoutStatus.PENDING
    ),
    paidTotal: sum(
      (p) =>
        p.status === PayoutStatus.PAID || p.status === PayoutStatus.SUCCESS
    ),
    refunded: sum(
      (p) =>
        p.status === PayoutStatus.REFUNDED ||
        p.status === PayoutStatus.CANCELLED
    ),
  };
}
