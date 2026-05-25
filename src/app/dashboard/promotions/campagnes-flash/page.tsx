import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import FlashCampaignsClient from "./FlashCampaignsClient";

export default async function FlashCampaignsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, currency: true },
  });
  if (!shop) redirect("/personnaliser-ma-boutique");

  const [campaigns, products] = await Promise.all([
    db.flashCampaign.findMany({
      where: { shopId: shop.id },
      orderBy: { startsAt: "desc" },
    }),
    db.product.findMany({
      where: { shopId: shop.id, status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <FlashCampaignsClient
      currency={shop.currency || "FCFA"}
      products={products}
      campaigns={campaigns.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        discountType: f.discountType,
        discountValue: f.discountValue,
        startsAt: f.startsAt.toISOString(),
        endsAt: f.endsAt.toISOString(),
        productIds: f.productIds,
        isActive: f.isActive,
        ordersCount: f.ordersCount,
        totalDiscount: f.totalDiscount,
      }))}
    />
  );
}
