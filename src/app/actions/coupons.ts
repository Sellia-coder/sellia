"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { DiscountType } from "@prisma/client";

async function verifyShop(userId: string) {
  return db.shop.findFirst({
    where: { ownerId: userId },
    select: { id: true, slug: true, currency: true },
  });
}

export interface CreateCouponInput {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startsAt: string;
  endsAt?: string;
  maxUses?: number;
  maxUsesPerCustomer?: number;
  firstOrderOnly?: boolean;
}

export async function createCouponAction(input: CreateCouponInput) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await verifyShop(user.id);
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    const code = input.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (code.length < 3 || code.length > 30) {
      return {
        ok: false,
        error: "Code invalide (3-30 caractères alphanumériques)",
      };
    }

    if (input.discountValue <= 0) {
      return { ok: false, error: "Valeur de réduction invalide" };
    }
    if (input.discountType === "PERCENTAGE" && input.discountValue > 100) {
      return { ok: false, error: "Pourcentage max : 100%" };
    }

    const existing = await db.coupon.findUnique({
      where: { shopId_code: { shopId: shop.id, code } },
    });
    if (existing) return { ok: false, error: "Ce code existe déjà" };

    const coupon = await db.coupon.create({
      data: {
        shopId: shop.id,
        code,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        discountType: input.discountType,
        discountValue: input.discountValue,
        minOrderAmount: input.minOrderAmount || null,
        maxDiscount: input.maxDiscount || null,
        startsAt: new Date(input.startsAt),
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        maxUses: input.maxUses || null,
        maxUsesPerCustomer: input.maxUsesPerCustomer ?? 1,
        firstOrderOnly: input.firstOrderOnly || false,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/promotions/coupons");
    return { ok: true, couponId: coupon.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function updateCouponAction(
  couponId: string,
  input: Partial<CreateCouponInput>
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const coupon = await db.coupon.findUnique({
      where: { id: couponId },
      include: { shop: { select: { ownerId: true } } },
    });
    if (!coupon || coupon.shop.ownerId !== user.id) {
      return { ok: false, error: "Coupon introuvable" };
    }

    await db.coupon.update({
      where: { id: couponId },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.description !== undefined && {
          description: input.description?.trim() || null,
        }),
        ...(input.discountValue !== undefined && {
          discountValue: input.discountValue,
        }),
        ...(input.minOrderAmount !== undefined && {
          minOrderAmount: input.minOrderAmount || null,
        }),
        ...(input.maxDiscount !== undefined && {
          maxDiscount: input.maxDiscount || null,
        }),
        ...(input.endsAt !== undefined && {
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
        }),
        ...(input.maxUses !== undefined && {
          maxUses: input.maxUses || null,
        }),
        ...(input.maxUsesPerCustomer !== undefined && {
          maxUsesPerCustomer: input.maxUsesPerCustomer ?? 1,
        }),
      },
    });

    revalidatePath("/dashboard/promotions/coupons");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function toggleCouponActiveAction(
  couponId: string,
  isActive: boolean
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const coupon = await db.coupon.findUnique({
      where: { id: couponId },
      include: { shop: { select: { ownerId: true } } },
    });
    if (!coupon || coupon.shop.ownerId !== user.id) {
      return { ok: false, error: "Coupon introuvable" };
    }

    await db.coupon.update({ where: { id: couponId }, data: { isActive } });
    revalidatePath("/dashboard/promotions/coupons");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function deleteCouponAction(couponId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const coupon = await db.coupon.findUnique({
      where: { id: couponId },
      include: { shop: { select: { ownerId: true } } },
    });
    if (!coupon || coupon.shop.ownerId !== user.id) {
      return { ok: false, error: "Coupon introuvable" };
    }

    await db.coupon.delete({ where: { id: couponId } });
    revalidatePath("/dashboard/promotions/coupons");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
