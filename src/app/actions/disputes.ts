"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction, getAdminRequestIp } from "@/lib/admin/audit-log";
import {
  DISPUTE_STATUSES,
  type DisputeStatus,
} from "@/lib/disputes/constants";

export async function merchantRespondDisputeAction(
  disputeId: string,
  response: string
) {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, error: "Non autorisé" };

  const text = response.trim();
  if (text.length < 10) {
    return { ok: false, error: "Réponse trop courte (10 caractères minimum)" };
  }

  const dispute = await db.dispute.findUnique({
    where: { id: disputeId },
    include: { shop: { select: { ownerId: true, slug: true } } },
  });

  if (!dispute || dispute.shop.ownerId !== user.id) {
    return { ok: false, error: "Litige introuvable" };
  }

  if (["RESOLVED_CUSTOMER", "RESOLVED_MERCHANT", "CLOSED"].includes(dispute.status)) {
    return { ok: false, error: "Ce litige est déjà tranché" };
  }

  await db.dispute.update({
    where: { id: disputeId },
    data: {
      merchantResponse: text.slice(0, 3000),
      merchantRespondedAt: new Date(),
      status: dispute.status === "OPEN" ? "IN_REVIEW" : dispute.status,
    },
  });

  revalidatePath("/dashboard/clients");
  return { ok: true };
}

export async function adminResolveDisputeAction(
  disputeId: string,
  decision: "customer" | "merchant" | "closed",
  resolutionNote: string
) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Non autorisé" };

  const note = resolutionNote.trim();
  if (note.length < 5) {
    return { ok: false, error: "Note de résolution requise" };
  }

  const dispute = await db.dispute.findUnique({
    where: { id: disputeId },
    select: { id: true, status: true, orderId: true, shopId: true },
  });
  if (!dispute) return { ok: false, error: "Litige introuvable" };

  let status: DisputeStatus;
  if (decision === "customer") status = "RESOLVED_CUSTOMER";
  else if (decision === "merchant") status = "RESOLVED_MERCHANT";
  else status = "CLOSED";

  if (!DISPUTE_STATUSES.includes(status)) {
    return { ok: false, error: "Décision invalide" };
  }

  await db.dispute.update({
    where: { id: disputeId },
    data: {
      status,
      adminResolution: note.slice(0, 4000),
      resolvedBy: admin.id,
      resolvedAt: new Date(),
    },
  });

  const ip = await getAdminRequestIp();
  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    action: "dispute.resolve",
    targetType: "dispute",
    targetId: disputeId,
    details: {
      decision: status,
      orderId: dispute.orderId,
      shopId: dispute.shopId,
      notePreview: note.slice(0, 200),
      moneyImpact: "none — décision statut uniquement, pas de remboursement automatique",
    },
    ipAddress: ip,
  });

  revalidatePath("/admin/litiges");
  revalidatePath(`/admin/litiges/${disputeId}`);
  revalidatePath("/dashboard/clients");
  return { ok: true };
}
