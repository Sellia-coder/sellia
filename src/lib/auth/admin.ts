import { getCurrentUser } from "@/lib/auth/session";

/** Valeur exacte en BDD (String?, pas d'enum Prisma) pour un compte administrateur. */
export const ADMIN_ROLE = "admin" as const;

export function isAdminRole(role: string | null | undefined): boolean {
  return role === ADMIN_ROLE;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    return null;
  }
  return user;
}
