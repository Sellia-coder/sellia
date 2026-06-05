"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, ADMIN_ROLE } from "@/lib/auth/admin";
import type { ReportStatus } from "@prisma/client";
import { SELLIA_PLANS, type SelliaPlan } from "@/lib/cartevo/pricing";

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

export async function adminToggleUserBlockAction(
  userId: string,
  block: boolean
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  if (userId === admin.id) {
    return {
      ok: false as const,
      error: "Vous ne pouvez pas bloquer votre propre compte.",
    };
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) return { ok: false as const, error: "Utilisateur introuvable" };

  if (target.role === ADMIN_ROLE) {
    return {
      ok: false as const,
      error: "Impossible de bloquer un compte administrateur.",
    };
  }

  await db.user.update({
    where: { id: userId },
    data: block
      ? { isBlocked: true, blockedAt: new Date() }
      : { isBlocked: false, blockedAt: null },
  });

  if (block) {
    await db.session.deleteMany({ where: { userId } }).catch(() => {});
  }

  revalidatePath("/admin/utilisateurs");
  revalidatePath(`/admin/utilisateurs/${userId}`);
  return { ok: true as const, isBlocked: block };
}

const REPORT_STATUSES: ReportStatus[] = [
  "PENDING",
  "REVIEWING",
  "RESOLVED",
  "DISMISSED",
];

export async function adminUpdateReportStatusAction(
  reportId: string,
  status: ReportStatus
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };
  if (!REPORT_STATUSES.includes(status)) {
    return { ok: false as const, error: "Statut invalide" };
  }

  const report = await db.productReport.findUnique({
    where: { id: reportId },
    select: { id: true },
  });
  if (!report) return { ok: false as const, error: "Signalement introuvable" };

  await db.productReport.update({
    where: { id: reportId },
    data: { status },
  });

  revalidatePath("/admin/signalements");
  revalidatePath(`/admin/signalements/${reportId}`);
  return { ok: true as const };
}

export async function adminToggleProductVisibilityAction(
  productId: string,
  hide: boolean
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, status: true, shop: { select: { slug: true } } },
  });
  if (!product) return { ok: false as const, error: "Produit introuvable" };

  await db.product.update({
    where: { id: productId },
    data: { status: hide ? "draft" : "active" },
  });

  revalidatePath("/admin/signalements");
  if (product.shop.slug) {
    revalidatePath(`/shop/${product.shop.slug}`);
  }
  return { ok: true as const, isHidden: hide };
}

export async function adminReplySupportTicketAction(
  ticketId: string,
  content: string
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const trimmed = content?.trim();
  if (!trimmed || trimmed.length < 2) {
    return { ok: false as const, error: "Message trop court" };
  }
  if (trimmed.length > 5000) {
    return { ok: false as const, error: "Message trop long" };
  }

  const ticket = await db.supportTicket.findUnique({
    where: { id: ticketId },
    select: { id: true, status: true },
  });
  if (!ticket) return { ok: false as const, error: "Ticket introuvable" };
  if (ticket.status === "CLOSED") {
    return { ok: false as const, error: "Ce ticket est fermé" };
  }

  const senderName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email.split("@")[0];

  await db.$transaction(async (tx) => {
    await tx.supportMessage.create({
      data: {
        ticketId,
        senderId: admin.id,
        senderType: "SUPPORT",
        senderName,
        content: trimmed,
      },
    });
    await tx.supportTicket.update({
      where: { id: ticketId },
      data: {
        lastMessageAt: new Date(),
        lastMessageBy: "SUPPORT",
        status: "WAITING_USER",
        unreadByUser: { increment: 1 },
        unreadBySupport: 0,
      },
    });
  });

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  return { ok: true as const };
}

export async function adminChangeShopPlanAction(
  shopId: string,
  plan: SelliaPlan
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  if (!SELLIA_PLANS[plan]) {
    return { ok: false as const, error: "Plan invalide" };
  }

  const shop = await db.shop.findUnique({
    where: { id: shopId },
    select: { id: true, slug: true, plan: true },
  });
  if (!shop) return { ok: false as const, error: "Boutique introuvable" };
  if (shop.plan === plan) {
    return { ok: false as const, error: "La boutique est déjà sur ce plan." };
  }

  await db.shop.update({
    where: { id: shopId },
    data: {
      plan,
      planActivatedAt: new Date(),
      ...(plan === "pro" ? { proSince: new Date() } : {}),
      ...(plan === "business" ? { businessSince: new Date() } : {}),
    },
  });

  revalidatePath("/admin/boutiques");
  revalidatePath(`/admin/boutiques/${shopId}`);
  if (shop.slug) revalidatePath(`/shop/${shop.slug}`);

  return {
    ok: true as const,
    plan,
    commissionRate: SELLIA_PLANS[plan].commissionRate,
  };
}

export async function adminReopenSupportTicketAction(ticketId: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const ticket = await db.supportTicket.findUnique({
    where: { id: ticketId },
    select: { id: true, status: true },
  });
  if (!ticket) return { ok: false as const, error: "Ticket introuvable" };
  if (ticket.status !== "CLOSED") {
    return { ok: false as const, error: "Ce ticket n'est pas fermé." };
  }

  await db.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: "OPEN",
      closedAt: null,
      unreadBySupport: { increment: 1 },
    },
  });

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  return { ok: true as const };
}

export async function adminCloseSupportTicketAction(ticketId: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Non autorisé" };

  const ticket = await db.supportTicket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });
  if (!ticket) return { ok: false as const, error: "Ticket introuvable" };

  await db.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
  });

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  return { ok: true as const };
}
