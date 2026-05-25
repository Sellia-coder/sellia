"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";

export type PayoutOperatorKey =
  | "orange_money"
  | "mtn_mobile_money"
  | "moov_money"
  | "wave";

interface SavePayoutMethodInput {
  operator: PayoutOperatorKey;
  country: string;
  phoneNumber: string;
  holderName: string;
}

const OPERATOR_CONFIG: Record<
  PayoutOperatorKey,
  { label: string; countries: string[] }
> = {
  orange_money: {
    label: "Orange Money",
    countries: ["CM", "CI", "SN", "ML", "BF", "MG"],
  },
  mtn_mobile_money: {
    label: "MTN Mobile Money",
    countries: ["CM", "CI", "BJ", "GH", "UG", "RW"],
  },
  moov_money: {
    label: "Moov Money",
    countries: ["CI", "BJ", "BF", "TG", "ML", "NE"],
  },
  wave: {
    label: "Wave",
    countries: ["CI", "SN", "UG"],
  },
};

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

    const opCfg = OPERATOR_CONFIG[input.operator];
    if (!opCfg) return { ok: false, error: "Opérateur invalide" };
    if (!opCfg.countries.includes(input.country)) {
      return {
        ok: false,
        error: `${opCfg.label} non disponible dans ce pays`,
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
        payoutOperator: input.operator,
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
