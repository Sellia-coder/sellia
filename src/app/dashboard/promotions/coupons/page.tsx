import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import CouponsClient from "./CouponsClient";

export default async function CouponsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, currency: true },
  });
  if (!shop) redirect("/personnaliser-ma-boutique");

  const coupons = await db.coupon.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <CouponsClient
      currency={shop.currency || "FCFA"}
      coupons={coupons.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount,
        maxDiscount: c.maxDiscount,
        startsAt: c.startsAt.toISOString(),
        endsAt: c.endsAt?.toISOString() || null,
        maxUses: c.maxUses,
        maxUsesPerCustomer: c.maxUsesPerCustomer,
        currentUses: c.currentUses,
        isActive: c.isActive,
        firstOrderOnly: c.firstOrderOnly,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}
