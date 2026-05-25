import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import LoyaltyClient from "./LoyaltyClient";

export default async function LoyaltyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
  });
  if (!shop) redirect("/personnaliser-ma-boutique");

  const [config, accounts] = await Promise.all([
    db.loyaltyConfig.findUnique({ where: { shopId: shop.id } }),
    db.loyaltyAccount.findMany({
      where: { shopId: shop.id },
      orderBy: { lifetimePoints: "desc" },
      take: 100,
    }),
  ]);

  const totalPoints = accounts.reduce((s, a) => s + a.points, 0);
  const totalLifetime = accounts.reduce((s, a) => s + a.lifetimePoints, 0);

  return (
    <LoyaltyClient
      config={
        config
          ? {
              isEnabled: config.isEnabled,
              pointsPerCurrency: config.pointsPerCurrency,
              currencyPerPoint: config.currencyPerPoint,
              redemptionPointsRequired: config.redemptionPointsRequired,
              redemptionDiscountAmount: config.redemptionDiscountAmount,
              silverThreshold: config.silverThreshold,
              goldThreshold: config.goldThreshold,
              platinumThreshold: config.platinumThreshold,
              welcomeBonusPoints: config.welcomeBonusPoints,
            }
          : null
      }
      stats={{
        accountsCount: accounts.length,
        totalPoints,
        totalLifetime,
      }}
      accounts={accounts.map((a) => ({
        id: a.id,
        customerName: a.customerName,
        customerPhone: a.customerPhone,
        points: a.points,
        lifetimePoints: a.lifetimePoints,
        tier: a.tier,
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  );
}
