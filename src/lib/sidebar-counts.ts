import { db } from "@/lib/db";

export interface SidebarCounts {
  products: {
    lowStock: number;
    total: number;
  };
  orders: {
    pending: number;
    toDeliver: number;
    actionRequired: number;
  };
}

/**
 * Compteurs pour les badges sidebar (request-scoped, pas de cache global).
 */
export async function getSidebarCounts(shopId: string): Promise<SidebarCounts> {
  const [productsLowStock, productsTotal, ordersPending, ordersToDeliver] =
    await Promise.all([
      db.product.count({
        where: {
          shopId,
          status: "active",
          unlimitedStock: false,
          stock: { lte: 5, gt: 0 },
        },
      }),
      db.product.count({
        where: { shopId, status: "active" },
      }),
      db.order.count({
        where: {
          shopId,
          paymentStatus: { in: ["pending", "awaiting_confirmation"] },
          status: { not: "cancelled" },
        },
      }),
      db.order.count({
        where: {
          shopId,
          paymentStatus: { in: ["paid_escrow", "paid_offline"] },
          qrScannedAt: null,
          status: { not: "cancelled" },
        },
      }),
    ]);

  return {
    products: {
      lowStock: productsLowStock,
      total: productsTotal,
    },
    orders: {
      pending: ordersPending,
      toDeliver: ordersToDeliver,
      actionRequired: ordersPending + ordersToDeliver,
    },
  };
}
