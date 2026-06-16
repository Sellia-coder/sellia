import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "secret",
  "otp",
  "code",
  "session",
]);

/** Tout objet sérialisable JSON (stats typées, Record, tableaux, etc.). */
export type AdminAuditDetailsInput = string | object;

function sanitizeDetails(
  details: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) continue;
    if (typeof value === "string" && value.length > 500) {
      out[key] = `${value.slice(0, 500)}…`;
    } else {
      out[key] = value;
    }
  }
  return out;
}

/** Normalise details → string stockée en BDD (sanitize + JSON.stringify). */
function serializeDetails(
  details: AdminAuditDetailsInput | undefined
): string | null {
  if (details === undefined || details === null) return null;
  if (typeof details === "string") {
    return details.slice(0, 4000);
  }
  try {
    const sanitized = sanitizeDetails(
      details as Record<string, unknown>
    );
    const json = JSON.stringify(sanitized);
    return json.length > 4000 ? `${json.slice(0, 4000)}…` : json;
  } catch {
    return null;
  }
}

export async function getAdminRequestIp(): Promise<string | undefined> {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      undefined
    );
  } catch {
    return undefined;
  }
}

/** Best-effort : ne bloque jamais l'action appelante si le log échoue. */
export async function logAdminAction(params: {
  admin: { id: string; email: string };
  action: string;
  targetType?: string;
  targetId?: string;
  details?: AdminAuditDetailsInput;
  ipAddress?: string;
}): Promise<void> {
  try {
    const detailsStr = serializeDetails(params.details);

    await db.adminAuditLog.create({
      data: {
        adminId: params.admin.id,
        adminEmail: params.admin.email,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        details: detailsStr,
        ipAddress: params.ipAddress ?? (await getAdminRequestIp()) ?? null,
      },
    });
  } catch (err) {
    console.warn("[admin-audit] log failed (non-blocking):", err);
  }
}

export type AdminAuditListRow = {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: Date;
};

export async function listAdminAuditLogs(opts?: {
  q?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  adminEmail?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  skip?: number;
}): Promise<AdminAuditListRow[]> {
  const where: Prisma.AdminAuditLogWhereInput = {};
  if (opts?.action) where.action = opts.action;
  if (opts?.targetType) where.targetType = opts.targetType;
  if (opts?.targetId) where.targetId = opts.targetId;
  if (opts?.adminEmail?.trim()) {
    where.adminEmail = {
      contains: opts.adminEmail.trim(),
      mode: "insensitive",
    };
  }
  if (opts?.from || opts?.to) {
    where.createdAt = {
      ...(opts.from ? { gte: opts.from } : {}),
      ...(opts.to ? { lte: opts.to } : {}),
    };
  }
  if (opts?.q?.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { adminEmail: { contains: q, mode: "insensitive" } },
      { action: { contains: q, mode: "insensitive" } },
      { targetId: { contains: q, mode: "insensitive" } },
      { details: { contains: q, mode: "insensitive" } },
    ];
  }

  try {
    return await db.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: opts?.skip ?? 0,
      take: opts?.limit ?? 200,
      select: {
        id: true,
        adminEmail: true,
        action: true,
        targetType: true,
        targetId: true,
        details: true,
        ipAddress: true,
        createdAt: true,
      },
    });
  } catch {
    return [];
  }
}

export async function countAdminAuditLogs(opts?: {
  q?: string;
  action?: string;
  targetType?: string;
  from?: Date;
  to?: Date;
}): Promise<number> {
  const where: Prisma.AdminAuditLogWhereInput = {};
  if (opts?.action) where.action = opts.action;
  if (opts?.targetType) where.targetType = opts.targetType;
  if (opts?.from || opts?.to) {
    where.createdAt = {
      ...(opts.from ? { gte: opts.from } : {}),
      ...(opts.to ? { lte: opts.to } : {}),
    };
  }
  if (opts?.q?.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { adminEmail: { contains: q, mode: "insensitive" } },
      { action: { contains: q, mode: "insensitive" } },
      { targetId: { contains: q, mode: "insensitive" } },
      { details: { contains: q, mode: "insensitive" } },
    ];
  }
  try {
    return await db.adminAuditLog.count({ where });
  } catch {
    return 0;
  }
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  "shop.suspend": "Boutique suspendue",
  "shop.reactivate": "Boutique réactivée",
  "shop.change_plan": "Plan boutique modifié",
  "user.block": "Marchand bloqué",
  "user.unblock": "Marchand débloqué",
  "withdrawal.approve": "Retrait validé",
  "withdrawal.reject": "Retrait rejeté",
  "withdrawal.reconcile": "Réconciliation retrait",
  "withdrawal.verify": "Retrait marqué vérifié",
  "withdrawal.note": "Note interne retrait",
  "review.hide": "Avis masqué",
  "review.show": "Avis réaffiché",
  "platform.settings": "Paramètres plateforme",
  "platform.money_settings": "Réglages money modifiés",
  "platform.money_settings_reset": "Réglages money réinitialisés",
  "admin.promote": "Promotion admin",
  "admin.demote": "Rétrogradation admin",
  "dispute.resolve": "Litige tranché",
};
