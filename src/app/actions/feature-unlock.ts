"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";

const COD_PRICE_FCFA = 1900;

export async function checkFeatureUnlockedAction(shopId: string, feature: "COD") {
  try {
    const unlock = await db.shopFeatureUnlock.findUnique({
      where: { shopId_feature: { shopId, feature } },
      select: { id: true, unlockedAt: true },
    });
    return {
      ok: true,
      unlocked: Boolean(unlock),
      unlockedAt: unlock?.unlockedAt?.toISOString() ?? null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, unlocked: false, error: message };
  }
}

export async function initiateCodUnlockAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    const existing = await db.shopFeatureUnlock.findUnique({
      where: { shopId_feature: { shopId: shop.id, feature: "COD" } },
    });
    if (existing) {
      return { ok: false, error: "Cette fonctionnalité est déjà débloquée pour votre boutique" };
    }

    return {
      ok: true,
      amount: COD_PRICE_FCFA,
      paymentUrl: `/api/feature-unlock/cod/checkout?shopId=${shop.id}`,
      shopId: shop.id,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function devUnlockCodAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    await db.shopFeatureUnlock.upsert({
      where: { shopId_feature: { shopId: shop.id, feature: "COD" } },
      create: {
        shopId: shop.id,
        feature: "COD",
        paidAmount: COD_PRICE_FCFA,
        paymentMethod: "manual",
        paymentRef: "DEV_UNLOCK_" + Date.now(),
      },
      update: {},
    });

    revalidatePath("/personnaliser-ma-boutique");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
