"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getPayoutOperators,
  PAYOUT_OPERATOR_LABELS,
} from "@/lib/cartevo/pricing";

// Codes opérateurs simples (Cartevo). On garde l'alias large pour la
// rétro-compatibilité avec d'anciens appelants.
export type PayoutOperatorKey = string;

interface SavePayoutMethodInput {
  operator: PayoutOperatorKey;
  country: string;
  phoneNumber: string;
  holderName: string;
}

// Normalise les anciens codes (orange_money, mtn_mobile_money…) vers les codes
// simples Cartevo, afin que la validation et le stockage soient cohérents.
function normalizeOperatorCode(op: string): string {
  const o = (op || "").toLowerCase();
  const legacy: Record<string, string> = {
    orange_money: "orange",
    mtn_mobile_money: "mtn",
    moov_money: "moov",
    wave: "wave",
  };
  return legacy[o] ?? o;
}

export async function savePayoutMethodAction(
  input: SavePayoutMethodInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });

    if (!shop) return { ok: false, error: "Aucune boutique trouvée" };

    const operatorCode = normalizeOperatorCode(input.operator);
    const allowed = getPayoutOperators(input.country);
    if (!operatorCode) return { ok: false, error: "Opérateur invalide" };
    if (allowed.length === 0) {
      return {
        ok: false,
        error: "Le retrait Mobile Money n'est pas disponible dans ce pays.",
      };
    }
    if (!allowed.includes(operatorCode)) {
      const label = PAYOUT_OPERATOR_LABELS[operatorCode] ?? operatorCode;
      return {
        ok: false,
        error: `${label} non disponible dans ce pays`,
      };
    }

    const cleanPhone = input.phoneNumber.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 8 || cleanPhone.length > 12) {
      return { ok: false, error: "Numéro de téléphone invalide" };
    }

    if (!input.holderName.trim() || input.holderName.trim().length < 2) {
      return { ok: false, error: "Nom du titulaire requis" };
    }

    await db.shop.update({
      where: { id: shop.id },
      data: {
        payoutOperator: operatorCode,
        payoutCountry: input.country,
        payoutPhone: cleanPhone,
        payoutHolderName: input.holderName.trim(),
      },
    });

    revalidatePath("/dashboard/paiements");

    return { ok: true };
  } catch (err: unknown) {
    console.error("[savePayoutMethodAction]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
