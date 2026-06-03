import { db } from "@/lib/db";

/**
 * Lie un DraftShop à un User après inscription.
 * Vérifie que la draft existe, n'est pas déjà claimed, n'est pas expirée.
 */
export async function claimDraftShop(
  userId: string,
  draftShopId: string
): Promise<{ success: boolean; error?: string }> {
  if (!draftShopId) {
    return { success: false, error: "ID brouillon manquant" };
  }

  try {
    const draft = await db.draftShop.findUnique({
      where: { id: draftShopId },
    });

    if (!draft) {
      return { success: false, error: "Brouillon introuvable" };
    }

    // Idempotent : déjà rattaché à ce user → OK
    if (draft.userId === userId) {
      return { success: true };
    }

    // Rattaché à un AUTRE user → refus
    if (draft.userId && draft.userId !== userId) {
      return { success: false, error: "Brouillon déjà associé à un autre compte" };
    }

    if (draft.expiresAt < new Date()) {
      return { success: false, error: "Brouillon expiré" };
    }

    // La génération échouée est inutilisable
    if (draft.status === "failed") {
      return { success: false, error: "Génération échouée" };
    }

    // ✅ On rattache même si "pending" (génération async en cours) — bulletproof.
    await db.draftShop.update({
      where: { id: draftShopId },
      data: {
        userId,
        claimedAt: new Date(),
      },
    });

    return { success: true };
  } catch (err) {
    console.error("[claimDraftShop] Exception:", err);
    return { success: false, error: "Erreur serveur" };
  }
}

/**
 * Trouve le DraftShop claimed le plus récent d'un user
 * (pour l'onboarding /personnaliser-ma-boutique).
 */
export async function getActiveDraftShopForUser(userId: string) {
  return db.draftShop.findFirst({
    where: {
      userId,
      status: { notIn: ["failed", "consumed"] },
    },
    orderBy: {
      claimedAt: "desc",
    },
  });
}
