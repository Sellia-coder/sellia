import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/admin";
import { getPlatformSettings } from "@/lib/admin/platform-settings";
import { PUBLIC_MAINTENANCE_COOKIE } from "./constants";

export { PUBLIC_MAINTENANCE_COOKIE } from "./constants";

let cache: { active: boolean; message: string; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

/**
 * Lecture fail-safe du mode maintenance.
 * Défaut : site EN LIGNE (active=false) si DB absente ou erreur.
 */
export async function getPublicMaintenanceStatus(): Promise<{
  active: boolean;
  message: string;
}> {
  try {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      return { active: cache.active, message: cache.message };
    }
    const settings = await getPlatformSettings();
    cache = {
      active: settings.maintenanceMode,
      message: settings.maintenanceMessage,
      at: Date.now(),
    };
    return { active: cache.active, message: cache.message };
  } catch {
    return { active: false, message: "" };
  }
}

export function invalidateMaintenanceCache(): void {
  cache = null;
}

/** Garde le cookie middleware aligné sur la DB (ex. après redémarrage serveur). Fail-safe. */
export async function ensurePublicMaintenanceCookieSynced(): Promise<void> {
  try {
    const { active } = await getPublicMaintenanceStatus();
    await syncPublicMaintenanceCookie(active);
  } catch {
    // Pas de cookie → site en ligne
  }
}

/** Synchronise le cookie middleware avec le réglage (server action / settings). */
export async function syncPublicMaintenanceCookie(
  maintenanceMode: boolean
): Promise<void> {
  try {
    const cookieStore = await cookies();
    if (maintenanceMode) {
      cookieStore.set(PUBLIC_MAINTENANCE_COOKIE, "1", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    } else {
      cookieStore.delete(PUBLIC_MAINTENANCE_COOKIE);
    }
  } catch {
    // Fail-safe : pas de cookie → middleware laisse passer
  }
}

const AUTH_PREFIXES = [
  "/connexion",
  "/inscription",
  "/verifier-email",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
];

/**
 * Garde layout (complément du middleware) — admins et pages auth exemptés.
 * Fail-safe : toute erreur → pas de redirect.
 */
export async function enforcePublicMaintenance(pathname?: string): Promise<void> {
  try {
    const { active } = await getPublicMaintenanceStatus();
    if (!active) return;

    const path = pathname ?? "";
    if (
      path.startsWith("/maintenance") ||
      path.startsWith("/admin") ||
      path.startsWith("/dashboard") ||
      path.startsWith("/api") ||
      AUTH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))
    ) {
      return;
    }

    const user = await getCurrentUser();
    if (user && isAdminRole(user.role)) return;

    redirect("/maintenance");
  } catch {
    // Fail-safe absolu : ne jamais bloquer le site sur une exception
  }
}
