"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, ADMIN_ROLE } from "@/lib/auth/admin";

export async function adminToggleShopVisibilityAction(shopId: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const shop = await db.shop.findUnique({
    where: { id: shopId },
    select: { id: true, slug: true, isPublished: true },
  });
  if (!shop) return { ok: false as const, error: "Boutique introuvable" };

  const willSuspend = shop.isPublished;
  await db.shop.update({
    where: { id: shopId },
    data: willSuspend
      ? { isPublished: false, status: "MAINTENANCE" }
      : { isPublished: true, status: "published" },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/boutiques");
  if (shop.slug) revalidatePath(`/shop/${shop.slug}`);

  return { ok: true as const, isPublished: !willSuspend };
}

export async function adminSetUserRoleAction(
  userId: string,
  role: "admin" | "user"
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  if (userId === admin.id && role !== ADMIN_ROLE) {
    return {
      ok: false as const,
      error: "Vous ne pouvez pas vous rétrograder vous-même.",
    };
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!target) return { ok: false as const, error: "Utilisateur introuvable" };

  await db.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/utilisateurs");
  return { ok: true as const };
}
