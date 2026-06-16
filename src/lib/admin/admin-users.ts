import { db } from "@/lib/db";
import { ADMIN_ROLE, isProtectedSuperAdmin } from "@/lib/auth/admin";

export type AdminAccountRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
  isSuperAdmin: boolean;
  promotedAt: Date | null;
  promotedByEmail: string | null;
};

export async function listAdminAccounts(): Promise<AdminAccountRow[]> {
  const admins = await db.user.findMany({
    where: { role: ADMIN_ROLE },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      lastLoginAt: true,
      role: true,
    },
    orderBy: { email: "asc" },
  });

  let promotions: {
    targetId: string | null;
    adminEmail: string;
    createdAt: Date;
  }[] = [];
  try {
    promotions = await db.adminAuditLog.findMany({
      where: { action: "admin.promote" },
      orderBy: { createdAt: "desc" },
      select: {
        targetId: true,
        adminEmail: true,
        createdAt: true,
      },
    });
  } catch {
    // Table absente tant que la migration audit n'est pas appliquée.
  }

  const promoMap = new Map<
    string,
    { at: Date; by: string }
  >();
  for (const p of promotions) {
    if (p.targetId && !promoMap.has(p.targetId)) {
      promoMap.set(p.targetId, { at: p.createdAt, by: p.adminEmail });
    }
  }

  return admins.map((a) => {
    const promo = promoMap.get(a.id);
    return {
      id: a.id,
      email: a.email,
      firstName: a.firstName,
      lastName: a.lastName,
      createdAt: a.createdAt,
      lastLoginAt: a.lastLoginAt,
      isSuperAdmin: isProtectedSuperAdmin(a),
      promotedAt: promo?.at ?? null,
      promotedByEmail: promo?.by ?? null,
    };
  });
}
