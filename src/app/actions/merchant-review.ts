"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

const replySchema = z.object({
  reviewId: z.string().min(1),
  reply: z.string().min(2).max(2000),
});

async function getOwnerShop() {
  const user = await getCurrentUser();
  if (!user) return null;
  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, slug: true },
  });
  if (!shop) return null;
  return { user, shop };
}

export async function merchantReplyToReviewAction(
  reviewId: string,
  reply: string
) {
  const ctx = await getOwnerShop();
  if (!ctx) return { ok: false as const, error: "Non autorisé" };

  const parsed = replySchema.safeParse({ reviewId, reply });
  if (!parsed.success) {
    return { ok: false as const, error: "Réponse invalide (2–2000 caractères)." };
  }

  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: {
      shopId: true,
      product: { select: { slug: true } },
    },
  });

  if (!review || review.shopId !== ctx.shop.id) {
    return { ok: false as const, error: "Avis introuvable." };
  }

  const trimmed = parsed.data.reply.trim();

  try {
    await db.review.update({
      where: { id: reviewId },
      data: {
        merchantReply: trimmed,
        merchantRepliedAt: new Date(),
      },
    });
  } catch {
    return {
      ok: false as const,
      error:
        "Impossible d'enregistrer la réponse. Migration merchant_reply requise.",
    };
  }

  revalidatePath("/dashboard/clients");
  if (review.product?.slug) {
    revalidatePath(
      `/shop/${ctx.shop.slug}/produit/${review.product.slug}`
    );
  }

  return { ok: true as const };
}
