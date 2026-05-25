import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import GiftCardsClient from "./GiftCardsClient";

export default async function GiftCardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, currency: true },
  });
  if (!shop) redirect("/personnaliser-ma-boutique");

  const giftCards = await db.giftCard.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
  });

  const totalIssued = giftCards.reduce((s, g) => s + g.initialAmount, 0);
  const totalRemaining = giftCards.reduce((s, g) => s + g.remainingAmount, 0);
  const totalUsed = totalIssued - totalRemaining;

  return (
    <GiftCardsClient
      currency={shop.currency || "FCFA"}
      stats={{ totalIssued, totalUsed, totalRemaining }}
      giftCards={giftCards.map((g) => ({
        id: g.id,
        code: g.code,
        initialAmount: g.initialAmount,
        remainingAmount: g.remainingAmount,
        buyerName: g.buyerName,
        recipientName: g.recipientName,
        expiresAt: g.expiresAt?.toISOString() || null,
        isActive: g.isActive,
        createdAt: g.createdAt.toISOString(),
      }))}
    />
  );
}
