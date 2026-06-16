import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

/** Valeur exacte en BDD (String?, pas d'enum Prisma) pour un compte administrateur. */
export const ADMIN_ROLE = "admin" as const;

/** Super admin pinglé — non modifiable via l'UI. */
export const SUPER_ADMIN_EMAIL = "sekuretechnologies@gmail.com";

export function isAdminRole(role: string | null | undefined): boolean {
  return role === ADMIN_ROLE;
}

type AdminUserLike = {
  email: string;
  role?: string | null;
};

export function isSuperAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

export function isSuperAdmin(user: AdminUserLike | null | undefined): boolean {
  if (!user) return false;
  return isAdminRole(user.role) && isSuperAdminEmail(user.email);
}

export function isProtectedSuperAdmin(user: AdminUserLike): boolean {
  return isSuperAdmin(user);
}

/**
 * Les comptes admin passent toujours par l'OTP email à la connexion
 * (Trust Device court-circuité). N'affecte pas les utilisateurs normaux.
 */
export function adminRequiresOtpAtLogin(user: {
  role?: string | null;
}): boolean {
  return isAdminRole(user.role);
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    return null;
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAdmin();
  if (!user || !isSuperAdmin(user)) {
    return null;
  }
  return user;
}

/** Garde page : redirige vers /admin si pas super admin. */
export async function requireSuperAdminPage() {
  const user = await requireSuperAdmin();
  if (!user) redirect("/admin");
  return user;
}
