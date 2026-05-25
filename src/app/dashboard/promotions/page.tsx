import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import PromotionsHubClient from "./PromotionsHubClient";

export const dynamic = "force-dynamic";

export default async function PromotionsHubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, currency: true },
  });

  if (!shop) redirect("/personnaliser-ma-boutique");

  const [
    couponsCount,
    couponsActiveCount,
    couponsTotalUsage,
    giftCardsCount,
    giftCardsActiveCount,
    giftCardsTotalIssued,
    flashCount,
    flashActiveCount,
    loyaltyConfig,
    loyaltyAccountsCount,
  ] = await Promise.all([
    db.coupon.count({ where: { shopId: shop.id } }),
    db.coupon.count({ where: { shopId: shop.id, isActive: true } }),
    db.coupon.aggregate({
      where: { shopId: shop.id },
      _sum: { currentUses: true },
    }),
    db.giftCard.count({ where: { shopId: shop.id } }),
    db.giftCard.count({ where: { shopId: shop.id, isActive: true } }),
    db.giftCard.aggregate({
      where: { shopId: shop.id },
      _sum: { initialAmount: true },
    }),
    db.flashCampaign.count({ where: { shopId: shop.id } }),
    db.flashCampaign.count({
      where: {
        shopId: shop.id,
        isActive: true,
        endsAt: { gte: new Date() },
      },
    }),
    db.loyaltyConfig.findUnique({ where: { shopId: shop.id } }),
    db.loyaltyAccount.count({ where: { shopId: shop.id } }),
  ]);

  return (
    <PromotionsHubClient
      currency={shop.currency || "XAF"}
      stats={{
        coupons: {
          total: couponsCount,
          active: couponsActiveCount,
          totalUses: couponsTotalUsage._sum.currentUses || 0,
        },
        giftCards: {
          total: giftCardsCount,
          active: giftCardsActiveCount,
          totalIssued: giftCardsTotalIssued._sum.initialAmount || 0,
        },
        flash: {
          total: flashCount,
          active: flashActiveCount,
        },
        loyalty: {
          enabled: loyaltyConfig?.isEnabled || false,
          accountsCount: loyaltyAccountsCount,
        },
      }}
    />
  );
}
