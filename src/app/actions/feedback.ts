"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/admin";
import {
  FEEDBACK_STATUSES,
  FEEDBACK_TYPES,
  type FeedbackStatus,
  type FeedbackType,
} from "@/lib/feedback/constants";
import type { MerchantFeedbackStatus } from "@prisma/client";

export async function submitMerchantFeedbackAction(
  type: string,
  message: string
) {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, error: "Non autorisé" };

  const text = message.trim();
  if (text.length < 10) {
    return { ok: false, error: "Message trop court (10 caractères minimum)" };
  }
  if (text.length > 4000) {
    return { ok: false, error: "Message trop long (4000 caractères max)" };
  }

  const feedbackType = FEEDBACK_TYPES.find((t) => t.value === type)?.value ?? "SUGGESTION";

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  await db.merchantFeedback.create({
    data: {
      userId: user.id,
      shopId: shop?.id ?? null,
      type: feedbackType as FeedbackType,
      message: text,
      status: "NEW",
    },
  });

  return { ok: true };
}

export async function adminUpdateFeedbackStatusAction(
  feedbackId: string,
  status: MerchantFeedbackStatus
) {
  await requireAdmin();

  if (!FEEDBACK_STATUSES.includes(status as FeedbackStatus)) {
    return { ok: false, error: "Statut invalide" };
  }

  const existing = await db.merchantFeedback.findUnique({
    where: { id: feedbackId },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Retour introuvable" };

  await db.merchantFeedback.update({
    where: { id: feedbackId },
    data: { status },
  });

  revalidatePath("/admin/feedback");
  revalidatePath(`/admin/feedback/${feedbackId}`);
  return { ok: true };
}
