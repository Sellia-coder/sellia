import { db } from "@/lib/db";
import { sumSelliaCommissions, gmvByShopIds } from "@/lib/admin/metrics";
import { PayoutStatus } from "@prisma/client";
import { planLabel } from "@/lib/admin/constants";

export async function getAdminAbonnementsData() {
  const [planGroups, shops, totalRevenue, commissionPayouts] = await Promise.all([
    db.shop.groupBy({
      by: ["plan"],
      _count: { _all: true },
    }),
    db.shop.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        slug: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    }),
    sumSelliaCommissions(),
    db.payout.findMany({
      where: {
        commissionAmount: { not: null },
        status: {
          notIn: [PayoutStatus.FAILED, PayoutStatus.CANCELLED, PayoutStatus.REFUNDED],
        },
      },
      select: { commissionAmount: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  const shopsTotal = planGroups.reduce((s, g) => s + g._count._all, 0);
  const planDistribution = planGroups.map((g) => ({
    plan: g.plan ?? "free",
    label: planLabel(g.plan),
    count: g._count._all,
    percent: shopsTotal > 0 ? Math.round((g._count._all / shopsTotal) * 100) : 0,
  }));

  const gmvMap = await gmvByShopIds(shops.map((s) => s.id));
  const shopsWithGmv = shops.map((s) => ({
    ...s,
    planLabel: planLabel(s.plan),
    gmv: gmvMap[s.id] ?? 0,
  }));

  const monthlyMap = new Map<string, number>();
  for (const p of commissionPayouts) {
    if (p.commissionAmount == null) continue;
    const d = p.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(p.commissionAmount));
  }
  const monthlyRevenue = [...monthlyMap.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6)
    .map(([month, amount]) => ({ month, amount }));

  return {
    planDistribution,
    shopsTotal,
    totalRevenue,
    monthlyRevenue,
    shopsWithGmv,
  };
}
