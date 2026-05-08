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

    if (draft.userId) {
      return { success: false, error: "Brouillon déjà associé à un compte" };
    }

    if (draft.expiresAt < new Date()) {
      return { success: false, error: "Brouillon expiré" };
    }

    if (draft.status !== "ready") {
      return { success: false, error: "Brouillon pas prêt" };
    }

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
      status: "ready",
    },
    orderBy: {
      claimedAt: "desc",
    },
  });
}
