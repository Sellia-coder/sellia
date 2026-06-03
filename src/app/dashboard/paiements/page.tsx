import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getShopBalances } from "@/lib/payouts";
import PaiementsClient from "./PaiementsClient";

export const dynamic = "force-dynamic";

export default async function PaiementsPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      slug: true,
      name: true,
      currency: true,
      plan: true,
      payoutPhone: true,
      phone: true,
      payoutOperator: true,
      payoutCountry: true,
      payoutHolderName: true,
      country: true,
    },
  });

  if (!shop) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Aucune boutique trouvée</h2>
      </div>
    );
  }

  const balances = await getShopBalances(shop.id);

  const payouts = await db.payout.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      order: {
        select: { orderNumber: true, customerName: true, total: true },
      },
    },
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const monthlyPayouts = await db.payout.findMany({
    where: {
      shopId: shop.id,
      createdAt: { gte: thirtyDaysAgo },
      orderId: { not: null },
    },
    select: {
      amount: true,
      grossAmount: true,
      commissionAmount: true,
      status: true,
    },
  });

  const monthlyStats = {
    grossRevenue: monthlyPayouts.reduce(
      (sum, p) => sum + Number(p.grossAmount ?? p.amount),
      0
    ),
    totalCommission: monthlyPayouts.reduce(
      (sum, p) => sum + Number(p.commissionAmount ?? 0),
      0
    ),
    transactionsCount: monthlyPayouts.length,
  };

  return (
    <PaiementsClient
      shopName={shop.name}
      currency={shop.currency || "FCFA"}
      planId={shop.plan || "free"}
      payoutMethodConfigured={!!(shop.payoutPhone || shop.phone)}
      payoutMethod={{
        operator: shop.payoutOperator,
        country: shop.payoutCountry || shop.country,
        phoneNumber: shop.payoutPhone,
        holderName: shop.payoutHolderName,
      }}
      balances={balances}
      monthlyStats={monthlyStats}
      payouts={payouts.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        grossAmount: p.grossAmount ? Number(p.grossAmount) : null,
        commissionAmount: p.commissionAmount
          ? Number(p.commissionAmount)
          : null,
        commissionRate: p.commissionRate ? Number(p.commissionRate) : null,
        netAmount: Number(p.netAmount),
        feeCartevo: Number(p.feeCartevo),
        currency: p.currency,
        status: p.status,
        payoutType: p.payoutType,
        operator: p.operator,
        phoneNumber: p.phoneNumber,
        description: p.description,
        createdAt: p.createdAt.toISOString(),
        releasedAt: p.releasedAt?.toISOString() || null,
        paidOutAt: p.paidOutAt?.toISOString() || null,
        orderNumber: p.order?.orderNumber || null,
        customerName: p.order?.customerName || null,
      }))}
    />
  );
}
