import { db } from "@/lib/db";
import { PayoutType } from "@prisma/client";
import type { OrderItem } from "@/lib/order-status";

export type DateRange = "7d" | "30d" | "90d" | "365d" | "all";

interface RangeBounds {
  current: { start: Date; end: Date };
  previous: { start: Date; end: Date };
}

const RANGE_DAYS: Record<DateRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "365d": 365,
  all: 365 * 10,
};

const PAID_ORDER_STATUSES = ["paid_escrow", "delivered", "paid_released", "paid_offline"];

export function getDateRangeBounds(range: DateRange): RangeBounds {
  const now = new Date();
  const span = RANGE_DAYS[range];
  const ms = span * 24 * 3600 * 1000;

  return {
    current: {
      start: new Date(now.getTime() - ms),
      end: now,
    },
    previous: {
      start: new Date(now.getTime() - 2 * ms),
      end: new Date(now.getTime() - ms),
    },
  };
}

function isSuccessfulOrder(o: {
  refundedAt: Date | null;
  qrScannedAt: Date | null;
  paymentStatus: string;
  status: string;
}): boolean {
  if (o.refundedAt) return false;
  return !!(
    o.qrScannedAt ||
    o.paymentStatus === "delivered" ||
    o.paymentStatus === "paid_released" ||
    o.status === "delivered"
  );
}

function computeDelta(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

function parseOrderItems(raw: unknown): OrderItem[] {
  if (!Array.isArray(raw)) return [];
  return raw as OrderItem[];
}

export async function getShopKpis(shopId: string, range: DateRange = "30d") {
  const { current, previous } = getDateRangeBounds(range);

  const [currentOrders, previousOrders] = await Promise.all([
    db.order.findMany({
      where: { shopId, createdAt: { gte: current.start, lte: current.end } },
      select: {
        total: true,
        customerPhone: true,
        paymentStatus: true,
        status: true,
        qrScannedAt: true,
        refundedAt: true,
      },
    }),
    db.order.findMany({
      where: { shopId, createdAt: { gte: previous.start, lte: previous.end } },
      select: {
        total: true,
        customerPhone: true,
        paymentStatus: true,
        status: true,
        qrScannedAt: true,
        refundedAt: true,
      },
    }),
  ]);

  const currentSuccessful = currentOrders.filter(isSuccessfulOrder);
  const previousSuccessful = previousOrders.filter(isSuccessfulOrder);

  const currentRevenue = currentSuccessful.reduce((sum, o) => sum + o.total, 0);
  const previousRevenue = previousSuccessful.reduce((sum, o) => sum + o.total, 0);

  const currentOrderCount = currentOrders.length;
  const previousOrderCount = previousOrders.length;

  const currentCustomers = new Set(
    currentOrders.map((o) => o.customerPhone)
  ).size;
  const previousCustomers = new Set(
    previousOrders.map((o) => o.customerPhone)
  ).size;

  const avgBasket =
    currentOrderCount > 0
      ? Math.round(currentRevenue / currentOrderCount)
      : 0;
  const previousAvgBasket =
    previousOrderCount > 0
      ? Math.round(previousRevenue / previousOrderCount)
      : 0;

  return {
    revenue: {
      current: currentRevenue,
      previous: previousRevenue,
      delta: computeDelta(currentRevenue, previousRevenue),
    },
    orders: {
      current: currentOrderCount,
      previous: previousOrderCount,
      delta: computeDelta(currentOrderCount, previousOrderCount),
    },
    customers: {
      current: currentCustomers,
      previous: previousCustomers,
      delta: computeDelta(currentCustomers, previousCustomers),
    },
    avgBasket: {
      current: avgBasket,
      previous: previousAvgBasket,
      delta: computeDelta(avgBasket, previousAvgBasket),
    },
  };
}

export async function getTopProducts(
  shopId: string,
  range: DateRange = "30d",
  limit = 5
) {
  const { current } = getDateRangeBounds(range);

  const orders = await db.order.findMany({
    where: {
      shopId,
      createdAt: { gte: current.start },
      paymentStatus: { in: PAID_ORDER_STATUSES },
      refundedAt: null,
    },
    select: { items: true },
  });

  const productStats = new Map<
    string,
    {
      name: string;
      quantity: number;
      revenue: number;
      imageUrl?: string | null;
      emoji?: string | null;
    }
  >();

  for (const order of orders) {
    const items = parseOrderItems(order.items);
    for (const item of items) {
      const key = item.productId || item.name;
      if (!key) continue;

      const qty = item.quantity || 1;
      const revenue = (item.price || 0) * qty;
      const existing = productStats.get(key);

      if (existing) {
        existing.quantity += qty;
        existing.revenue += revenue;
      } else {
        productStats.set(key, {
          name: item.name || "Produit",
          quantity: qty,
          revenue,
          imageUrl: item.imageUrl ?? null,
          emoji: item.emoji ?? null,
        });
      }
    }
  }

  return Array.from(productStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/**
 * Retourne une map { productId: { quantity, revenue } } des ventes par produit
 * sur les commandes effectivement payées (paid_escrow, delivered, paid_released, paid_offline).
 */
export async function getProductSalesMap(
  shopId: string
): Promise<Record<string, { quantity: number; revenue: number }>> {
  const orders = await db.order.findMany({
    where: {
      shopId,
      paymentStatus: { in: PAID_ORDER_STATUSES },
      refundedAt: null,
    },
    select: { items: true },
  });

  const map: Record<string, { quantity: number; revenue: number }> = {};

  for (const order of orders) {
    const items = parseOrderItems(order.items);
    for (const item of items) {
      const productId = item.productId;
      if (!productId) continue;
      const qty = item.quantity || 1;
      const price = item.price || 0;
      if (!map[productId]) map[productId] = { quantity: 0, revenue: 0 };
      map[productId].quantity += qty;
      map[productId].revenue += qty * price;
    }
  }

  return map;
}

export async function getTopCustomers(shopId: string, limit = 5) {
  return db.customer.findMany({
    where: { shopId },
    orderBy: { totalSpent: "desc" },
    take: limit,
    select: {
      id: true,
      fullName: true,
      phone: true,
      city: true,
      totalOrders: true,
      totalSpent: true,
    },
  });
}

export async function getRecentActivity(shopId: string, limit = 5) {
  const [orders, payouts] = await Promise.all([
    db.order.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        orderNumber: true,
        customerName: true,
        total: true,
        qrScannedAt: true,
        createdAt: true,
      },
    }),
    db.payout.findMany({
      where: { shopId, payoutType: PayoutType.MERCHANT_REQUESTED },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        amount: true,
        createdAt: true,
        phoneNumber: true,
      },
    }),
  ]);

  const events: Array<{
    type: "order_created" | "qr_scanned" | "withdraw_requested";
    timestamp: Date;
    title: string;
    subtitle: string;
    amount: number;
    href?: string;
  }> = [];

  for (const o of orders) {
    events.push({
      type: o.qrScannedAt ? "qr_scanned" : "order_created",
      timestamp: o.qrScannedAt || o.createdAt,
      title: o.qrScannedAt
        ? `${o.customerName} — livraison confirmée`
        : `${o.customerName} a commandé`,
      subtitle: o.orderNumber,
      amount: o.total,
      href: `/dashboard/commandes/${o.orderNumber}`,
    });
  }

  for (const p of payouts) {
    events.push({
      type: "withdraw_requested",
      timestamp: p.createdAt,
      title: "Retrait demandé",
      subtitle: p.phoneNumber,
      amount: Number(p.amount),
    });
  }

  return events
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export async function getRevenueTimeSeries(
  shopId: string,
  range: DateRange = "30d"
) {
  const { current } = getDateRangeBounds(range);

  const orders = await db.order.findMany({
    where: {
      shopId,
      createdAt: { gte: current.start },
      refundedAt: null,
      OR: [
        { qrScannedAt: { not: null } },
        { paymentStatus: { in: ["delivered", "paid_released"] } },
      ],
    },
    select: { total: true, createdAt: true },
  });

  const buckets = new Map<string, number>();
  const days = Math.ceil(
    (Date.now() - current.start.getTime()) / (24 * 3600 * 1000)
  );

  for (let i = 0; i <= days; i++) {
    const d = new Date(current.start.getTime() + i * 24 * 3600 * 1000);
    const key = d.toISOString().split("T")[0];
    buckets.set(key, 0);
  }

  for (const o of orders) {
    const key = o.createdAt.toISOString().split("T")[0];
    buckets.set(key, (buckets.get(key) || 0) + o.total);
  }

  return Array.from(buckets.entries()).map(([date, revenue]) => ({
    date,
    revenue,
    label: new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    }),
  }));
}

export async function getPaymentMethodBreakdown(
  shopId: string,
  range: DateRange = "30d"
) {
  const { current } = getDateRangeBounds(range);

  const orders = await db.order.findMany({
    where: {
      shopId,
      createdAt: { gte: current.start },
      paymentStatus: { in: PAID_ORDER_STATUSES },
      refundedAt: null,
    },
    select: { paymentMethod: true, paymentSubMethod: true, total: true },
  });

  const breakdown = new Map<string, { count: number; revenue: number }>();

  for (const o of orders) {
    const key = o.paymentSubMethod || o.paymentMethod || "Autre";
    const existing = breakdown.get(key);
    if (existing) {
      existing.count++;
      existing.revenue += o.total;
    } else {
      breakdown.set(key, { count: 1, revenue: o.total });
    }
  }

  return Array.from(breakdown.entries()).map(([method, data]) => ({
    method,
    ...data,
  }));
}

export async function getProductTypeBreakdown(
  shopId: string,
  range: DateRange = "30d"
) {
  const { current } = getDateRangeBounds(range);

  const orders = await db.order.findMany({
    where: {
      shopId,
      createdAt: { gte: current.start },
      paymentStatus: { in: PAID_ORDER_STATUSES },
      refundedAt: null,
    },
    select: { items: true, createdAt: true },
  });

  const buckets = new Map<
    string,
    { physical: number; digital: number; service: number }
  >();
  const days = Math.ceil(
    (Date.now() - current.start.getTime()) / (24 * 3600 * 1000)
  );

  for (let i = 0; i <= days; i++) {
    const d = new Date(current.start.getTime() + i * 24 * 3600 * 1000);
    const key = d.toISOString().split("T")[0];
    buckets.set(key, { physical: 0, digital: 0, service: 0 });
  }

  for (const o of orders) {
    const key = o.createdAt.toISOString().split("T")[0];
    const bucket = buckets.get(key) || {
      physical: 0,
      digital: 0,
      service: 0,
    };
    const items = parseOrderItems(o.items);

    for (const item of items) {
      const type =
        item.type === "digital" || item.type === "service"
          ? item.type
          : "physical";
      const value = (item.price || 0) * (item.quantity || 1);
      bucket[type] += value;
    }

    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries()).map(([date, data]) => ({
    date,
    ...data,
    label: new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    }),
  }));
}

export async function getSalesHeatmap(shopId: string, range: DateRange = "30d") {
  const { current } = getDateRangeBounds(range);

  const orders = await db.order.findMany({
    where: {
      shopId,
      createdAt: { gte: current.start },
      paymentStatus: { in: PAID_ORDER_STATUSES },
      refundedAt: null,
    },
    select: { createdAt: true, total: true },
  });

  const heatmap: number[][] = Array.from({ length: 7 }, () =>
    Array(24).fill(0)
  );

  for (const o of orders) {
    const day = o.createdAt.getDay();
    const hour = o.createdAt.getHours();
    heatmap[day][hour] += o.total;
  }

  return heatmap;
}
