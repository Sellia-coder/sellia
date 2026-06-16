"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  requireSuperAdmin,
  ADMIN_ROLE,
  isProtectedSuperAdmin,
  isSuperAdminEmail,
} from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/admin/audit-log";

export async function adminPromoteUserAction(email: string) {
  const superAdmin = await requireSuperAdmin();
  if (!superAdmin) return { ok: false as const, error: "Accès réservé au super admin." };

  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    return { ok: false as const, error: "Email invalide." };
  }

  const target = await db.user.findUnique({
    where: { email: normalized },
    select: { id: true, email: true, role: true },
  });
  if (!target) {
    return { ok: false as const, error: "Utilisateur introuvable." };
  }
  if (target.role === ADMIN_ROLE) {
    return { ok: false as const, error: "Cet utilisateur est déjà administrateur." };
  }

  await db.user.update({
    where: { id: target.id },
    data: { role: ADMIN_ROLE },
  });

  await logAdminAction({
    admin: superAdmin,
    action: "admin.promote",
    targetType: "user",
    targetId: target.id,
    details: { email: target.email },
  });

  revalidatePath("/admin/administrateurs");
  revalidatePath("/admin/utilisateurs");
  return { ok: true as const, email: target.email };
}

export async function adminDemoteAdminAction(userId: string) {
  const superAdmin = await requireSuperAdmin();
  if (!superAdmin) return { ok: false as const, error: "Accès réservé au super admin." };

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!target) {
    return { ok: false as const, error: "Administrateur introuvable." };
  }
  if (target.role !== ADMIN_ROLE) {
    return { ok: false as const, error: "Ce compte n'est pas administrateur." };
  }
  if (isProtectedSuperAdmin(target)) {
    return {
      ok: false as const,
      error: "Le super administrateur ne peut pas être rétrogradé.",
    };
  }
  if (target.id === superAdmin.id && isSuperAdminEmail(target.email)) {
    return { ok: false as const, error: "Action interdite sur le super admin." };
  }

  await db.user.update({
    where: { id: target.id },
    data: { role: "user" },
  });

  await logAdminAction({
    admin: superAdmin,
    action: "admin.demote",
    targetType: "user",
    targetId: target.id,
    details: { email: target.email },
  });

  revalidatePath("/admin/administrateurs");
  revalidatePath("/admin/utilisateurs");
  return { ok: true as const };
}
