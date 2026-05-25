"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";

function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GC-";
  for (let i = 0; i < 9; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 2 || i === 5) code += "-";
  }
  return code;
}

export interface CreateGiftCardInput {
  amount: number;
  buyerName?: string;
  buyerPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  message?: string;
  expiresInMonths?: number;
}

export async function createGiftCardAction(input: CreateGiftCardInput) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    if (input.amount < 1000) {
      return { ok: false, error: "Montant minimum : 1 000 FCFA" };
    }
    if (input.amount > 1_000_000) {
      return { ok: false, error: "Montant maximum : 1 000 000 FCFA" };
    }

    let code = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateGiftCardCode();
      const exists = await db.giftCard.findUnique({
        where: { code: candidate },
      });
      if (!exists) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      return { ok: false, error: "Impossible de générer un code unique" };
    }

    const months = input.expiresInMonths ?? 12;
    const expiresAt = new Date(
      Date.now() + months * 30 * 24 * 3600 * 1000
    );

    const giftCard = await db.giftCard.create({
      data: {
        shopId: shop.id,
        code,
        initialAmount: input.amount,
        remainingAmount: input.amount,
        buyerName: input.buyerName || null,
        buyerPhone: input.buyerPhone || null,
        recipientName: input.recipientName || null,
        recipientPhone: input.recipientPhone || null,
        message: input.message || null,
        expiresAt,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/promotions/cartes-cadeaux");
    return { ok: true, giftCardId: giftCard.id, code };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function toggleGiftCardActiveAction(
  giftCardId: string,
  isActive: boolean
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const giftCard = await db.giftCard.findUnique({
      where: { id: giftCardId },
      include: { shop: { select: { ownerId: true } } },
    });
    if (!giftCard || giftCard.shop.ownerId !== user.id) {
      return { ok: false, error: "Carte cadeau introuvable" };
    }

    await db.giftCard.update({
      where: { id: giftCardId },
      data: { isActive },
    });
    revalidatePath("/dashboard/promotions/cartes-cadeaux");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
