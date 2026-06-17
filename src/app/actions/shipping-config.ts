"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import {
  step35Schema,
  type Step35Input,
} from "@/lib/validations/personnalisation";

export async function saveShippingConfigAction(input: Step35Input) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "Non autorisé" };

    const parsed = step35Schema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false as const,
        error: parsed.error.issues[0]?.message ?? "Configuration invalide",
      };
    }

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: false as const, error: "Boutique introuvable" };

    const codUnlock = await db.shopFeatureUnlock.findUnique({
      where: { shopId_feature: { shopId: shop.id, feature: "COD" } },
      select: { id: true },
    });
    const codUnlocked = Boolean(codUnlock);
    const enableCodAtCheckout =
      codUnlocked && parsed.data.paymentCashOnDelivery;

    await db.shop.update({
      where: { id: shop.id },
      data: {
        shippingZones: parsed.data.shippingZones,
        paymentCashOnDelivery: enableCodAtCheckout,
        paymentOnlineEscrow: parsed.data.paymentOnlineEscrow,
        codEnabled: enableCodAtCheckout,
      },
    });

    revalidatePath("/dashboard/produits/livraisons");
    revalidatePath("/dashboard/produits");
    revalidatePath(`/shop`);

    return { ok: true as const };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false as const, error: msg };
  }
}
