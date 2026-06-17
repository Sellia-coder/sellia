"use server";

import { z } from "zod/v3";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getCodUnlockPrice, refreshMoneyConfigCache } from "@/lib/admin/money-config";
import {
  cartevoCountrySchema,
  cartevoOperatorSchema,
  validatePhoneForCountry,
} from "@/lib/cartevo/validation";
import {
  normalizePhoneNumber,
  getCountryInfo,
} from "@/lib/cartevo/operators-catalog";
import {
  initCodUnlockCollect,
  resolveCodUnlockPayment,
  findPendingCodUnlockTx,
} from "@/lib/cartevo/cod-unlock";

export async function getCodUnlockPriceAction() {
  try {
    await refreshMoneyConfigCache();
    return { ok: true as const, amount: getCodUnlockPrice() };
  } catch {
    return { ok: true as const, amount: 1900 };
  }
}

export async function checkFeatureUnlockedAction(shopId: string, feature: "COD") {
  try {
    const unlock = await db.shopFeatureUnlock.findUnique({
      where: { shopId_feature: { shopId, feature } },
      select: { id: true, unlockedAt: true },
    });
    return {
      ok: true,
      unlocked: Boolean(unlock),
      unlockedAt: unlock?.unlockedAt?.toISOString() ?? null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, unlocked: false, error: message };
  }
}

const payCodUnlockSchema = z.object({
  country: cartevoCountrySchema,
  operator: cartevoOperatorSchema,
  phoneNumber: z.string().min(8).max(20),
});

export async function payCodUnlockAction(input: z.infer<typeof payCodUnlockSchema>) {
  try {
    await refreshMoneyConfigCache();

    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "Non autorisé" };

    const parsed = payCodUnlockSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false as const, error: "Informations de paiement invalides" };
    }

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: false as const, error: "Boutique introuvable" };

    const existing = await db.shopFeatureUnlock.findUnique({
      where: { shopId_feature: { shopId: shop.id, feature: "COD" } },
    });
    if (existing) {
      return {
        ok: false as const,
        error: "Cette fonctionnalité est déjà débloquée pour votre boutique",
      };
    }

    const pendingTx = await findPendingCodUnlockTx(shop.id);
    if (pendingTx) {
      const countryInfo = getCountryInfo(parsed.data.country);
      return {
        ok: true as const,
        amount: getCodUnlockPrice(),
        currency: countryInfo?.currency ?? "XAF",
        cartevoTransactionId: pendingTx.id,
        operator: parsed.data.operator,
        country: parsed.data.country,
        resumed: true as const,
      };
    }

    const countryInfo = getCountryInfo(parsed.data.country);
    if (!countryInfo) {
      return { ok: false as const, error: "Pays non supporté" };
    }

    const operatorExists = countryInfo.operators.some(
      (op) => op.code === parsed.data.operator
    );
    if (!operatorExists) {
      return {
        ok: false as const,
        error: `Opérateur non disponible au ${countryInfo.name}`,
      };
    }

    const normalizedPhone = normalizePhoneNumber(
      parsed.data.phoneNumber,
      parsed.data.country
    );
    if (!validatePhoneForCountry(normalizedPhone, parsed.data.country)) {
      return {
        ok: false as const,
        error: "Format du numéro de téléphone invalide pour ce pays",
      };
    }

    const collectResult = await initCodUnlockCollect({
      shopId: shop.id,
      userId: user.id,
      country: parsed.data.country,
      operator: parsed.data.operator,
      phoneNumber: normalizedPhone,
    });

    if (!collectResult.ok || !collectResult.cartevoTransactionId) {
      return {
        ok: false as const,
        error: collectResult.error || "Échec d'initialisation du paiement",
      };
    }

    return {
      ok: true as const,
      amount: collectResult.amount ?? getCodUnlockPrice(),
      currency: collectResult.currency ?? countryInfo.currency,
      cartevoTransactionId: collectResult.cartevoTransactionId,
      operator: parsed.data.operator,
      country: parsed.data.country,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false as const, error: message };
  }
}

export async function pollCodUnlockPaymentAction(cartevoTransactionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "Non autorisé" };

    const result = await resolveCodUnlockPayment(cartevoTransactionId, user.id);
    if (!result.ok) {
      return { ok: false as const, error: result.error };
    }

    if (result.unlocked) {
      revalidatePath("/personnaliser-ma-boutique");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/produits/livraisons");
    }

    return {
      ok: true as const,
      status: result.status,
      unlocked: result.unlocked,
      amount: result.amount,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false as const, error: message };
  }
}

/** Dev-only bypass — jamais en production. */
export async function devUnlockCodAction() {
  if (process.env.NODE_ENV !== "development") {
    return { ok: false as const, error: "Non disponible" };
  }

  try {
    await refreshMoneyConfigCache();

    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: false as const, error: "Boutique introuvable" };

    await db.shopFeatureUnlock.upsert({
      where: { shopId_feature: { shopId: shop.id, feature: "COD" } },
      create: {
        shopId: shop.id,
        feature: "COD",
        paidAmount: getCodUnlockPrice(),
        paymentMethod: "manual_dev",
        paymentRef: "DEV_UNLOCK_" + Date.now(),
      },
      update: {},
    });

    revalidatePath("/personnaliser-ma-boutique");
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false as const, error: message };
  }
}
