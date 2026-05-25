"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";

export interface ConfigLoyaltyInput {
  isEnabled: boolean;
  pointsPerCurrency: number;
  currencyPerPoint: number;
  redemptionPointsRequired: number;
  redemptionDiscountAmount: number;
  silverThreshold: number;
  goldThreshold: number;
  platinumThreshold: number;
  welcomeBonusPoints: number;
}

export async function updateLoyaltyConfigAction(input: ConfigLoyaltyInput) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    await db.loyaltyConfig.upsert({
      where: { shopId: shop.id },
      create: {
        shopId: shop.id,
        ...input,
      },
      update: input,
    });

    revalidatePath("/dashboard/promotions/fidelite");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
