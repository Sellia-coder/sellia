import type { Prisma, PrismaClient } from "@prisma/client";

export interface ShopBalanceDetailed {
  totalCollectedGross: number;
  totalCommissionsSellia: number;
  totalFeesCartevo: number;
  totalNet: number;
  totalPaidOut: number;
  totalPending: number;
  available: number;
  currency: string;
}

export async function calculateShopBalance(
  prisma: PrismaClient | Prisma.TransactionClient,
  shopId: string,
  currency: string = "XAF"
): Promise<ShopBalanceDetailed> {
  const collected = await prisma.cartevoTransaction.aggregate({
    where: {
      shopId,
      type: "COLLECT",
      status: "SUCCESS",
      currency,
    },
    _sum: { amount: true, feeCartevo: true, feeSellia: true, netAmount: true },
  });

  const paidOut = await prisma.payout.aggregate({
    where: { shopId, status: "SUCCESS", currency },
    _sum: { amount: true },
  });

  const pending = await prisma.payout.aggregate({
    where: {
      shopId,
      status: { in: ["PENDING", "PROCESSING"] },
      currency,
    },
    _sum: { amount: true },
  });

  const totalCollectedGross = Number(collected._sum.amount ?? 0);
  const totalCommissionsSellia = Number(collected._sum.feeSellia ?? 0);
  const totalFeesCartevo = Number(collected._sum.feeCartevo ?? 0);
  const totalNet = Number(collected._sum.netAmount ?? 0);
  const totalPaidOut = Number(paidOut._sum.amount ?? 0);
  const totalPending = Number(pending._sum.amount ?? 0);
  const available = totalNet - totalPaidOut - totalPending;

  return {
    totalCollectedGross,
    totalCommissionsSellia,
    totalFeesCartevo,
    totalNet,
    totalPaidOut,
    totalPending,
    available: Math.max(0, available),
    currency,
  };
}

export async function checkPayoutAllowed(
  prisma: Prisma.TransactionClient,
  shopId: string,
  requestedAmount: number,
  currency: string = "XAF"
): Promise<{ allowed: boolean; balance: ShopBalanceDetailed; reason?: string }> {
  const balance = await calculateShopBalance(prisma, shopId, currency);

  if (requestedAmount > balance.available) {
    return {
      allowed: false,
      balance,
      reason: `Insufficient balance. Available: ${balance.available} ${currency}, Requested: ${requestedAmount}`,
    };
  }

  return { allowed: true, balance };
}
