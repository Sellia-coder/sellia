import { db } from "@/lib/db";
import { PayoutStatus } from "@prisma/client";
import { gmvByShopIds } from "@/lib/admin/metrics";
import { getShopBalances } from "@/lib/payouts";
import { ADMIN_PAID_PAYMENT_STATUSES } from "@/lib/admin/constants";

export type AdminShopStats = {
  gmv: number;
  orderCount: number;
  productCount: number;
  withdrawalCount: number;
  balances: {
    available: number;
    pendingEscrow: number;
    inProgress: number;
    paidTotal: number;
  };
};

export async function getAdminShopStats(shopId: string): Promise<AdminShopStats> {
  const [gmvMap, orderCount, productCount, withdrawalCount, balances] =
    await Promise.all([
      gmvByShopIds([shopId]),
      db.order.count({
        where: {
          shopId,
          paymentStatus: { in: [...ADMIN_PAID_PAYMENT_STATUSES] },
        },
      }),
      db.product.count({ where: { shopId } }),
      db.payout.count({
        where: {
          shopId,
          status: {
            in: [
              PayoutStatus.SUCCESS,
              PayoutStatus.PAID,
              PayoutStatus.PROCESSING,
              PayoutStatus.REQUESTED,
            ],
          },
        },
      }),
      getShopBalances(shopId),
    ]);

  return {
    gmv: gmvMap[shopId] ?? 0,
    orderCount,
    productCount,
    withdrawalCount,
    balances: {
      available: balances.available,
      pendingEscrow: balances.pendingEscrow,
      inProgress: balances.inProgress,
      paidTotal: balances.paidTotal,
    },
  };
}
