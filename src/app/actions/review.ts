"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const createReviewSchema = z.object({
  shopId: z.string().min(1),
  productId: z.string().min(1),
  authorName: z.string().min(2).max(50),
  authorEmail: z.union([z.string().email().max(100), z.literal("")]).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.union([z.string().max(80), z.literal("")]).optional(),
  content: z.string().min(10).max(1000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export async function createReviewAction(input: CreateReviewInput) {
  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides" } as const;
  }
  const data = parsed.data;

  const product = await db.product.findUnique({
    where: { id: data.productId },
    select: {
      shopId: true,
      slug: true,
      shop: { select: { slug: true } },
    },
  });

  if (!product || product.shopId !== data.shopId) {
    return { ok: false, error: "Produit introuvable" } as const;
  }

  try {
    await db.review.create({
      data: {
        shopId: data.shopId,
        productId: data.productId,
        authorName: data.authorName,
        authorEmail: data.authorEmail?.trim() || null,
        rating: data.rating,
        title: data.title?.trim() || null,
        content: data.content,
        status: "pending",
      },
    });

    const slugSeg = product.slug ?? data.productId;
    revalidatePath(`/shop/${product.shop.slug}/produit/${slugSeg}`);

    return { ok: true } as const;
  } catch (e) {
    console.error("[createReview]", e);
    return { ok: false, error: "Erreur serveur" } as const;
  }
}

export async function listApprovedReviewsAction(productId: string) {
  try {
    const reviews = await db.review.findMany({
      where: {
        productId,
        status: "approved",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        authorName: true,
        rating: true,
        title: true,
        content: true,
        createdAt: true,
        merchantReply: true,
        merchantRepliedAt: true,
      },
    });
    return { ok: true as const, reviews };
  } catch (e) {
    console.error("[listReviews]", e);
    return { ok: false as const, reviews: [] };
  }
}
