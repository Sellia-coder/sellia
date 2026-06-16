"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/admin/audit-log";

export async function adminToggleReviewVisibilityAction(
  reviewId: string,
  hide: boolean
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { id: true, shopId: true, shop: { select: { slug: true } } },
  });
  if (!review) return { ok: false as const, error: "Avis introuvable" };

  await db.review.update({
    where: { id: reviewId },
    data: {
      status: hide ? "hidden" : "approved",
      rejectionReason: hide ? "Masqué par un administrateur" : null,
      approvedAt: hide ? null : new Date(),
    },
  });

  revalidatePath("/admin/avis");
  revalidatePath(`/admin/avis/${review.shopId}`);
  if (review.shop.slug) revalidatePath(`/shop/${review.shop.slug}`);

  await logAdminAction({
    admin,
    action: hide ? "review.hide" : "review.show",
    targetType: "review",
    targetId: reviewId,
    details: { shopId: review.shopId },
  });

  return { ok: true as const, hidden: hide };
}

export async function adminSetWithdrawalNoteAction(
  withdrawalGroupId: string,
  note: string
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const trimmed = note.trim().slice(0, 2000);
  const rows = await db.payout.findMany({
    where: { withdrawalGroupId },
    select: { id: true },
  });
  if (rows.length === 0) {
    return { ok: false as const, error: "Groupe introuvable" };
  }

  await db.payout.updateMany({
    where: { withdrawalGroupId },
    data: { adminInternalNote: trimmed || null },
  });

  revalidatePath("/admin/retraits");
  revalidatePath(`/admin/retraits/${withdrawalGroupId}`);

  await logAdminAction({
    admin,
    action: "withdrawal.note",
    targetType: "withdrawal_group",
    targetId: withdrawalGroupId,
    details: { hasNote: Boolean(trimmed) },
  });

  return { ok: true as const };
}

/** Lève manualReviewRequired après contrôle humain (pas une action money). */
export async function adminMarkWithdrawalVerifiedAction(
  withdrawalGroupId: string
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const rows = await db.payout.findMany({
    where: { withdrawalGroupId },
  });
  if (rows.length === 0) {
    return { ok: false as const, error: "Groupe introuvable" };
  }

  if (!rows.some((r) => r.manualReviewRequired)) {
    return { ok: false as const, error: "Ce retrait n'est pas marqué à vérifier." };
  }

  await db.payout.updateMany({
    where: { withdrawalGroupId },
    data: {
      manualReviewRequired: false,
      adminVerifiedAt: new Date(),
      adminVerifiedBy: admin.id,
    },
  });

  revalidatePath("/admin/retraits");
  revalidatePath(`/admin/retraits/${withdrawalGroupId}`);

  await logAdminAction({
    admin,
    action: "withdrawal.verify",
    targetType: "withdrawal_group",
    targetId: withdrawalGroupId,
  });

  return { ok: true as const };
}
