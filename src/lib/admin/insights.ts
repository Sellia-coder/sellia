/**
 * Agrégations admin insights — lecture seule.
 * N'altère pas payouts.ts / withdrawal.ts / metrics.ts (imports lecture OK).
 */

import { db } from "@/lib/db";
import { PayoutStatus } from "@prisma/client";
import { getShopBalances, type ShopBalances } from "@/lib/payouts";
import { gmvByShopIds } from "@/lib/admin/metrics";
import { ADMIN_PAID_PAYMENT_STATUSES } from "@/lib/admin/constants";
import {
  computeDisplayStatus,
  type OrderItem,
  type DisplayStatus,
} from "@/lib/order-status";

export type { ShopBalances };

/** Agrège les buckets getShopBalances pour toutes les boutiques (1 requête payouts). */
export async function getAllShopBalancesMap(): Promise<
  Record<string, ShopBalances>
> {
  const payouts = await db.payout.findMany({
    select: { shopId: true, status: true, amount: true },
  });

  const map: Record<string, ShopBalances> = {};

  const ensure = (shopId: string): ShopBalances => {
    if (!map[shopId]) {
      map[shopId] = {
        available: 0,
        pendingEscrow: 0,
        inProgress: 0,
        paidTotal: 0,
        refunded: 0,
      };
    }
    return map[shopId];
  };

  for (const p of payouts) {
    const b = ensure(p.shopId);
    const amt = Number(p.amount);
    switch (p.status) {
      case PayoutStatus.AVAILABLE:
        b.available += amt;
        break;
      case PayoutStatus.PENDING_ESCROW:
        b.pendingEscrow += amt;
        break;
      case PayoutStatus.REQUESTED:
      case PayoutStatus.PROCESSING:
      case PayoutStatus.PENDING:
        b.inProgress += amt;
        break;
      case PayoutStatus.SUCCESS:
      case PayoutStatus.PAID:
        b.paidTotal += amt;
        break;
      case PayoutStatus.REFUNDED:
      case PayoutStatus.CANCELLED:
        b.refunded += amt;
        break;
      default:
        break;
    }
  }

  return map;
}

export async function getShopBalancesReadonly(
  shopId: string
): Promise<ShopBalances> {
  return getShopBalances(shopId);
}

export type ShopReviewStats = {
  shopId: string;
  shopName: string;
  shopSlug: string;
  avgRating: number;
  reviewCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

/** Note moyenne par boutique (avis visibles = approved uniquement). */
export async function getShopReviewStatsList(): Promise<ShopReviewStats[]> {
  const shops = await db.shop.findMany({
    select: { id: true, name: true, slug: true },
  });

  const reviews = await db.review.findMany({
    where: { status: { in: ["approved", "pending"] } },
    select: { shopId: true, rating: true },
  });

  const byShop = new Map<string, number[]>();
  for (const r of reviews) {
    const arr = byShop.get(r.shopId) ?? [];
    arr.push(r.rating);
    byShop.set(r.shopId, arr);
  }

  return shops
    .map((s) => {
      const ratings = byShop.get(s.id) ?? [];
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<
        1 | 2 | 3 | 4 | 5,
        number
      >;
      for (const rating of ratings) {
        const k = Math.min(5, Math.max(1, rating)) as 1 | 2 | 3 | 4 | 5;
        distribution[k]++;
      }
      const avg =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;
      return {
        shopId: s.id,
        shopName: s.name,
        shopSlug: s.slug,
        avgRating: avg,
        reviewCount: ratings.length,
        distribution,
      };
    })
    .filter((s) => s.reviewCount > 0 || true);
}

export type MerchantRankRow = {
  rank: number;
  shopId: string;
  shopName: string;
  shopSlug: string;
  plan: string;
  gmv: number;
  orderCount: number;
  avgRating: number;
  reviewCount: number;
  createdAt: Date;
  score: number;
};

/**
 * Score indicatif (transparent) :
 *   score = GMV/1000 + commandes×5 + note_moyenne×20 + min(ancienneté_jours, 365)×0.05
 */
export async function getMerchantRanking(): Promise<MerchantRankRow[]> {
  const shops = await db.shop.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      createdAt: true,
    },
  });

  const shopIds = shops.map((s) => s.id);
  const [gmvMap, orderCounts, reviewStats] = await Promise.all([
    gmvByShopIds(shopIds),
    db.order.groupBy({
      by: ["shopId"],
      where: { paymentStatus: { in: [...ADMIN_PAID_PAYMENT_STATUSES] } },
      _count: { id: true },
    }),
    getShopReviewStatsList(),
  ]);

  const orderMap = Object.fromEntries(
    orderCounts.map((o) => [o.shopId, o._count.id])
  );
  const reviewMap = Object.fromEntries(
    reviewStats.map((r) => [r.shopId, r])
  );

  const rows = shops.map((s) => {
    const gmv = gmvMap[s.id] ?? 0;
    const orderCount = orderMap[s.id] ?? 0;
    const rev = reviewMap[s.id];
    const avgRating = rev?.avgRating ?? 0;
    const reviewCount = rev?.reviewCount ?? 0;
    const ageDays = Math.min(
      365,
      (Date.now() - s.createdAt.getTime()) / 86_400_000
    );
    const score =
      gmv / 1000 + orderCount * 5 + avgRating * 20 + ageDays * 0.05;

    return {
      rank: 0,
      shopId: s.id,
      shopName: s.name,
      shopSlug: s.slug,
      plan: s.plan,
      gmv,
      orderCount,
      avgRating,
      reviewCount,
      createdAt: s.createdAt,
      score,
    };
  });

  rows.sort((a, b) => b.score - a.score);
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

export type AdminFulfillmentBucket =
  | "in_progress"
  | "pending_delivery"
  | "delivered";

const DELIVERED_STATUSES: DisplayStatus[] = ["delivered", "completed"];
const PENDING_DELIVERY_STATUSES: DisplayStatus[] = [
  "paid_pending_delivery",
  "in_delivery",
  "downloadable",
];

export function getAdminFulfillmentBucket(
  order: Parameters<typeof computeDisplayStatus>[0]
): AdminFulfillmentBucket {
  const ds = computeDisplayStatus(order);
  if (DELIVERED_STATUSES.includes(ds)) return "delivered";
  if (PENDING_DELIVERY_STATUSES.includes(ds)) return "pending_delivery";
  return "in_progress";
}

export const FULFILLMENT_BUCKET_LABELS: Record<
  AdminFulfillmentBucket,
  string
> = {
  in_progress: "En cours",
  pending_delivery: "En attente de livraison",
  delivered: "Livré",
};

export type ProfitabilitySnapshot = {
  period: "current_month" | "previous_month" | "all_time";
  label: string;
  revenueCommissions: number | null;
  partnerFeesTracked: number;
  partnerFeesTrackedCount: number;
  partnerFeesEstimated: number;
  partnerFeesEstimatedLabel: string;
  margin: number | null;
  isProfitable: boolean | null;
  collectVolume: number;
  payoutVolume: number;
};

function monthBounds(offset: number): { start: Date; end: Date; label: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59);
  const label = start.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return { start, end, label };
}

export async function getProfitabilitySnapshots(): Promise<
  ProfitabilitySnapshot[]
> {
  const periods = [
    { key: "current_month" as const, offset: 0 },
    { key: "previous_month" as const, offset: 1 },
    { key: "all_time" as const, offset: -1 },
  ];

  const results: ProfitabilitySnapshot[] = [];

  for (const p of periods) {
    const bounds =
      p.offset >= 0
        ? monthBounds(p.offset)
        : { start: new Date(0), end: new Date(), label: "Total" };

    const dateFilter =
      p.offset >= 0
        ? { gte: bounds.start, lte: bounds.end }
        : undefined;

    const commissionAgg = await db.payout.aggregate({
      where: {
        commissionAmount: { not: null },
        payoutType: {
          in: ["ORDER_DIGITAL", "ORDER_PHYSICAL", "ORDER_SERVICE"],
        },
        status: {
          notIn: [
            PayoutStatus.FAILED,
            PayoutStatus.CANCELLED,
            PayoutStatus.REFUNDED,
          ],
        },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _sum: { commissionAmount: true },
    });

    const revenue =
      commissionAgg._sum.commissionAmount != null
        ? Number(commissionAgg._sum.commissionAmount)
        : null;

    const txs = await db.cartevoTransaction.findMany({
      where: {
        status: "SUCCESS",
        ...(dateFilter ? { completedAt: dateFilter } : {}),
      },
      select: {
        type: true,
        amount: true,
        feeCartevo: true,
        cartevoRate: true,
      },
    });

    let partnerFeesTracked = 0;
    let collectVolume = 0;
    let payoutVolume = 0;
    let estimatedExtra = 0;

    for (const tx of txs) {
      const fee = Number(tx.feeCartevo);
      const amt = Number(tx.amount);
      if (fee > 0) {
        partnerFeesTracked += fee;
      } else if (tx.cartevoRate > 0) {
        estimatedExtra += Math.round((amt * tx.cartevoRate) / 100);
      }
      if (tx.type === "COLLECT") collectVolume += amt;
      if (tx.type === "PAYOUT") payoutVolume += amt;
    }

    const hasTracked = txs.some((t) => Number(t.feeCartevo) > 0);
    const partnerFeesEstimated = hasTracked
      ? partnerFeesTracked + estimatedExtra
      : estimatedExtra;

    const margin =
      revenue != null ? revenue - partnerFeesEstimated : null;

    results.push({
      period: p.key,
      label: bounds.label,
      revenueCommissions: revenue,
      partnerFeesTracked,
      partnerFeesTrackedCount: txs.filter((t) => Number(t.feeCartevo) > 0)
        .length,
      partnerFeesEstimated,
      partnerFeesEstimatedLabel: hasTracked
        ? txs.length > partnerFeesTracked
          ? "mixte (tracé + estimé)"
          : "tracé (CartevoTransaction.feeCartevo)"
        : "estimé (taux cartevoRate)",
      collectVolume,
      payoutVolume,
      margin,
      isProfitable: margin != null ? margin >= 0 : null,
    });
  }

  return results;
}

export async function getOrdersForFulfillmentAdmin(opts?: {
  bucket?: AdminFulfillmentBucket;
  limit?: number;
}) {
  const orders = await db.order.findMany({
    where: {
      paymentStatus: { in: [...ADMIN_PAID_PAYMENT_STATUSES, "pending", "awaiting_confirmation", "failed"] },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      orderNumber: true,
      customerName: true,
      total: true,
      paymentStatus: true,
      status: true,
      qrScannedAt: true,
      paidAt: true,
      refundedAt: true,
      items: true,
      createdAt: true,
      shop: { select: { id: true, name: true, slug: true } },
    },
  });

  const mapped = orders.map((o) => {
    const items = o.items as unknown as OrderItem[];
    const bucket = getAdminFulfillmentBucket({
      paymentStatus: o.paymentStatus,
      status: o.status,
      qrScannedAt: o.qrScannedAt,
      paidAt: o.paidAt,
      refundedAt: o.refundedAt,
      items,
    });
    const displayStatus = computeDisplayStatus({
      paymentStatus: o.paymentStatus,
      status: o.status,
      qrScannedAt: o.qrScannedAt,
      paidAt: o.paidAt,
      refundedAt: o.refundedAt,
      items,
    });
    return { ...o, items, bucket, displayStatus };
  });

  const filtered = opts?.bucket
    ? mapped.filter((o) => o.bucket === opts.bucket)
    : mapped;

  return filtered.slice(0, opts?.limit ?? 100);
}

export async function getFulfillmentCounts(): Promise<{
  in_progress: number;
  pending_delivery: number;
  delivered: number;
  total: number;
}> {
  const orders = await db.order.findMany({
    where: {
      paymentStatus: {
        in: [
          ...ADMIN_PAID_PAYMENT_STATUSES,
          "pending",
          "awaiting_confirmation",
          "failed",
        ],
      },
    },
    take: 1000,
    select: {
      paymentStatus: true,
      status: true,
      qrScannedAt: true,
      paidAt: true,
      refundedAt: true,
      items: true,
    },
  });

  const counts = {
    in_progress: 0,
    pending_delivery: 0,
    delivered: 0,
    total: orders.length,
  };

  for (const o of orders) {
    const items = o.items as unknown as OrderItem[];
    const bucket = getAdminFulfillmentBucket({
      paymentStatus: o.paymentStatus,
      status: o.status,
      qrScannedAt: o.qrScannedAt,
      paidAt: o.paidAt,
      refundedAt: o.refundedAt,
      items,
    });
    counts[bucket]++;
  }

  return counts;
}
