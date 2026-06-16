import { db } from "@/lib/db";

export const SHOP_NAME_TAKEN_MESSAGE =
  "Ce nom de boutique est déjà utilisé, choisis-en un autre.";

/** Trim, collapse spaces, lowercase — used for uniqueness comparison. */
export function normalizeShopName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function suggestShopNameAlternative(name: string): string {
  const base = name.trim().replace(/\s+/g, " ");
  if (!base) return "Ma boutique 2";
  return `${base} 2`;
}

export async function isShopNameTaken(
  name: string,
  excludeShopId?: string
): Promise<boolean> {
  const normalized = normalizeShopName(name);
  if (!normalized) return false;

  const shops = await db.shop.findMany({
    where: excludeShopId ? { id: { not: excludeShopId } } : undefined,
    select: { name: true },
  });

  return shops.some((s) => normalizeShopName(s.name) === normalized);
}

export async function assertShopNameAvailable(
  name: string,
  excludeShopId?: string
): Promise<
  | { ok: true; normalizedName: string }
  | { ok: false; error: string; suggestion?: string }
> {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return { ok: false, error: "Le nom de la boutique est requis" };
  }

  const taken = await isShopNameTaken(trimmed, excludeShopId);
  if (taken) {
    return {
      ok: false,
      error: SHOP_NAME_TAKEN_MESSAGE,
      suggestion: suggestShopNameAlternative(trimmed),
    };
  }

  return { ok: true, normalizedName: trimmed };
}
