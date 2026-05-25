"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { DiscountType } from "@prisma/client";

export interface CreateFlashInput {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  productIds?: string[];
}

export async function createFlashCampaignAction(input: CreateFlashInput) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true, slug: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    if (endsAt <= startsAt) {
      return {
        ok: false,
        error: "Date de fin doit être après date de début",
      };
    }

    if (
      input.discountType === "PERCENTAGE" &&
      (input.discountValue < 1 || input.discountValue > 100)
    ) {
      return { ok: false, error: "Pourcentage invalide (1-100)" };
    }

    const flash = await db.flashCampaign.create({
      data: {
        shopId: shop.id,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        discountType: input.discountType,
        discountValue: input.discountValue,
        startsAt,
        endsAt,
        productIds: input.productIds || [],
        isActive: true,
      },
    });

    revalidatePath("/dashboard/promotions/campagnes-flash");
    if (shop.slug) revalidatePath(`/shop/${shop.slug}`);

    return { ok: true, flashId: flash.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function toggleFlashActiveAction(flashId: string, isActive: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const flash = await db.flashCampaign.findUnique({
      where: { id: flashId },
      include: { shop: { select: { ownerId: true, slug: true } } },
    });
    if (!flash || flash.shop.ownerId !== user.id) {
      return { ok: false, error: "Campagne introuvable" };
    }

    await db.flashCampaign.update({
      where: { id: flashId },
      data: { isActive },
    });
    revalidatePath("/dashboard/promotions/campagnes-flash");
    if (flash.shop.slug) revalidatePath(`/shop/${flash.shop.slug}`);

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function deleteFlashCampaignAction(flashId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const flash = await db.flashCampaign.findUnique({
      where: { id: flashId },
      include: { shop: { select: { ownerId: true, slug: true } } },
    });
    if (!flash || flash.shop.ownerId !== user.id) {
      return { ok: false, error: "Campagne introuvable" };
    }

    await db.flashCampaign.delete({ where: { id: flashId } });
    revalidatePath("/dashboard/promotions/campagnes-flash");
    if (flash.shop.slug) revalidatePath(`/shop/${flash.shop.slug}`);

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
