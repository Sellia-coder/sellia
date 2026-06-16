import { db } from "@/lib/db";
import { PayoutStatus } from "@prisma/client";
import { gmvByShopIds } from "@/lib/admin/metrics";
import { getShopBalances } from "@/lib/payouts";
import { ADMIN_PAID_PAYMENT_STATUSES } from "@/lib/admin/constants";

export async function getAdminUserDetail(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isBlocked: true,
      blockedAt: true,
      createdAt: true,
      lastLoginAt: true,
      firstName: true,
      lastName: true,
      phone: true,
      shops: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          name: true,
          plan: true,
          isPublished: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) return null;

  const shop = user.shops[0] ?? null;
  let orderCount = 0;
  let gmv = 0;
  let lastPaymentAt: Date | null = null;
  let balances = null;
  let withdrawalPending = 0;
  let reportCount = 0;
  let ticketCount = 0;
  let customerCount = 0;

  if (shop) {
    const [
      count,
      gmvMap,
      lastOrder,
      bal,
      withdrawals,
      reports,
      tickets,
      customers,
    ] = await Promise.all([
      db.order.count({
        where: {
          shopId: shop.id,
          paymentStatus: { in: [...ADMIN_PAID_PAYMENT_STATUSES] },
        },
      }),
      gmvByShopIds([shop.id]),
      db.order.findFirst({
        where: {
          shopId: shop.id,
          paymentStatus: { in: [...ADMIN_PAID_PAYMENT_STATUSES] },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      getShopBalances(shop.id).catch(() => null),
      db.payout.count({
        where: {
          shopId: shop.id,
          status: { in: [PayoutStatus.REQUESTED, PayoutStatus.PROCESSING] },
        },
      }),
      db.productReport.count({ where: { shopId: shop.id } }),
      db.supportTicket.count({ where: { shopId: shop.id } }),
      db.customer.count({ where: { shopId: shop.id } }),
    ]);
    orderCount = count;
    gmv = gmvMap[shop.id] ?? 0;
    lastPaymentAt = lastOrder?.createdAt ?? null;
    balances = bal;
    withdrawalPending = withdrawals;
    reportCount = reports;
    ticketCount = tickets;
    customerCount = customers;
  }

  return {
    user,
    shop,
    shops: user.shops,
    stats: {
      orderCount,
      gmv,
      lastPaymentAt,
      balances,
      withdrawalPending,
      reportCount,
      ticketCount,
      customerCount,
    },
  };
}
