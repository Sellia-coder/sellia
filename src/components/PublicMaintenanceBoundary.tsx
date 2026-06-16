import { headers } from "next/headers";
import { enforcePublicMaintenance } from "@/lib/maintenance/public";

/**
 * Garde fail-safe pour pages marketing (complément cookie middleware).
 * Lit x-pathname injecté par le middleware — toute erreur → site en ligne.
 */
export default async function PublicMaintenanceBoundary() {
  try {
    const h = await headers();
    const pathname = h.get("x-pathname") ?? "";
    await enforcePublicMaintenance(pathname);
  } catch {
    // Fail-safe absolu
  }
  return null;
}
