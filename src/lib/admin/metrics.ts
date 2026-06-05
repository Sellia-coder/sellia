import { db } from "@/lib/db";
import { PayoutStatus, type Prisma } from "@prisma/client";
import { ADMIN_PAID_PAYMENT_STATUSES } from "./constants";

const paidWhere = {
  paymentStatus: { in: [...ADMIN_PAID_PAYMENT_STATUSES] },
};

function monthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Revenus Sellia (estimé) : somme des commissionAmount enregistrées sur les
 * Payouts liés aux commandes (ORDER_*), hors échecs/annulations. Peut inclure
 * des commissions déjà comptabilisées par payout split — approximation conservative.
 */
export async function sumSelliaCommissions(): Promise<number | null> {
  const agg = await db.payout.aggregate({
    where: {
      commissionAmount: { not: null },
      payoutType: { in: ["ORDER_DIGITAL", "ORDER_PHYSICAL", "ORDER_SERVICE"] },
      status: {
        notIn: [PayoutStatus.FAILED, PayoutStatus.CANCELLED, PayoutStatus.REFUNDED],
      },
    },
    _sum: { commissionAmount: true },
  });
  const v = agg._sum.commissionAmount;
  if (v == null) return null;
  return Number(v);
}

export type AdminRecentShop = {
  id: string;
  slug: string;
  name: string;
  plan: string;
  createdAt: Date;
  owner: { email: string };
};

export type AdminRecentOrder = {
  orderNumber: string;
  total: number;
  createdAt: Date;
  shop: { name: string; slug: string };
};

export type AdminRecentPayout = {
  id: string;
  amount: Prisma.Decimal;
  netAmount: Prisma.Decimal;
  status: PayoutStatus;
  currency: string;
  createdAt: Date;
  shop: { name: string; slug: string };
};

export type AdminOverviewMetrics = {
  shopsTotal: number;
  shopsPublished: number;
  usersTotal: number;
  gmvTotal: number;
  selliaRevenue: number | null;
  pendingWithdrawals: number;
  ordersThisMonth: number;
  recentShops: AdminRecentShop[];
  recentOrders: AdminRecentOrder[];
  recentPayouts: AdminRecentPayout[];
};

export async function getAdminOverviewMetrics(): Promise<AdminOverviewMetrics> {
  const startOfMonth = monthStart();

  const [
    shopsTotal,
    shopsPublished,
    usersTotal,
    gmvAgg,
    commissionsSum,
    pendingWithdrawals,
    ordersThisMonth,
    recentShops,
    recentOrders,
    recentPayouts,
  ] = await Promise.all([
    db.shop.count(),
    db.shop.count({ where: { isPublished: true } }),
    db.user.count(),
    db.order.aggregate({ where: paidWhere, _sum: { total: true } }),
    sumSelliaCommissions(),
    db.payout.count({ where: { status: PayoutStatus.REQUESTED } }),
    db.order.count({
      where: {
        ...paidWhere,
        createdAt: { gte: startOfMonth },
      },
    }),
    db.shop.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        name: true,
        plan: true,
        createdAt: true,
        owner: { select: { email: true } },
      },
    }),
    db.order.findMany({
      where: paidWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        orderNumber: true,
        total: true,
        createdAt: true,
        shop: { select: { name: true, slug: true } },
      },
    }),
    db.payout.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        amount: true,
        netAmount: true,
        status: true,
        currency: true,
        createdAt: true,
        shop: { select: { name: true, slug: true } },
      },
    }),
  ]);

  return {
    shopsTotal,
    shopsPublished,
    usersTotal,
    gmvTotal: gmvAgg._sum.total ?? 0,
    selliaRevenue: commissionsSum,
    pendingWithdrawals,
    ordersThisMonth,
    recentShops,
    recentOrders,
    recentPayouts,
  };
}

/** GMV par shopId pour une liste d'IDs (une requête groupBy). */
export async function gmvByShopIds(
  shopIds: string[]
): Promise<Record<string, number>> {
  if (shopIds.length === 0) return {};
  const rows = await db.order.groupBy({
    by: ["shopId"],
    where: {
      shopId: { in: shopIds },
      ...paidWhere,
    },
    _sum: { total: true },
  });
  const map: Record<string, number> = {};
  for (const r of rows) {
    map[r.shopId] = r._sum.total ?? 0;
  }
  return map;
}
