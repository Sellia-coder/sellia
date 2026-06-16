import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getRevenueTimeSeries,
  getTopProducts,
  getPaymentMethodBreakdown,
  getProductTypeBreakdown,
  getSalesHeatmap,
  getShopKpis,
  type DateRange,
} from "@/lib/analytics";
import { getShopBalances } from "@/lib/payouts";
import { getShopVisitStats } from "@/lib/shop-visits";
import StatsClient from "./StatsClient";

export const dynamic = "force-dynamic";

const VALID_RANGES: DateRange[] = ["7d", "30d", "90d", "365d", "all"];

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const rangeParam = params.range;
  const range: DateRange = VALID_RANGES.includes(rangeParam as DateRange)
    ? (rangeParam as DateRange)
    : "30d";

  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, currency: true },
  });

  if (!shop) redirect("/personnaliser-ma-boutique");

  const [
    kpis,
    revenueSeries,
    topProducts,
    paymentBreakdown,
    productTypeBreakdown,
    heatmap,
    balances,
    visitStats,
  ] = await Promise.all([
    getShopKpis(shop.id, range),
    getRevenueTimeSeries(shop.id, range),
    getTopProducts(shop.id, range, 10),
    getPaymentMethodBreakdown(shop.id, range),
    getProductTypeBreakdown(shop.id, range),
    getSalesHeatmap(shop.id, range),
    getShopBalances(shop.id),
    getShopVisitStats(shop.id).catch(() => null),
  ]);

  return (
    <StatsClient
      currency={shop.currency || "XAF"}
      range={range}
      kpis={kpis}
      revenueSeries={revenueSeries}
      topProducts={topProducts}
      paymentBreakdown={paymentBreakdown}
      productTypeBreakdown={productTypeBreakdown}
      heatmap={heatmap}
      pendingEscrow={balances.pendingEscrow}
      visitStats={visitStats}
    />
  );
}
