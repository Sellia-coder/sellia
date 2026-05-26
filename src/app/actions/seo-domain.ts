"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";

export interface SeoUpdate {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImageUrl?: string | null;
}

export async function updateSeoAction(input: SeoUpdate) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true, slug: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    if (input.seoTitle && input.seoTitle.length > 60) {
      return { ok: false, error: "Titre SEO max 60 caractères" };
    }
    if (input.seoDescription && input.seoDescription.length > 160) {
      return { ok: false, error: "Description SEO max 160 caractères" };
    }

    await db.shop.update({
      where: { id: shop.id },
      data: {
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        seoKeywords: input.seoKeywords?.trim() || null,
        ogImageUrl: input.ogImageUrl?.trim() || null,
      },
    });

    revalidatePath("/dashboard/domaine");
    if (shop.slug) revalidatePath(`/shop/${shop.slug}`);

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export interface TrackingUpdate {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  facebookCapiToken?: string;
  tiktokPixelId?: string;
  snapchatPixelId?: string;
}

export async function updateTrackingAction(input: TrackingUpdate) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true, slug: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    if (
      input.googleAnalyticsId &&
      !/^G-[A-Z0-9]+$/.test(input.googleAnalyticsId)
    ) {
      return {
        ok: false,
        error: "Format Google Analytics invalide (ex: G-XXXXXXXXX)",
      };
    }
    if (input.facebookPixelId && !/^\d{15,17}$/.test(input.facebookPixelId)) {
      return { ok: false, error: "Format Facebook Pixel invalide (15-17 chiffres)" };
    }
    if (
      input.tiktokPixelId &&
      !/^[A-Z0-9]{15,25}$/i.test(input.tiktokPixelId)
    ) {
      return { ok: false, error: "Format TikTok Pixel invalide" };
    }

    await db.shop.update({
      where: { id: shop.id },
      data: {
        ga4MeasurementId: input.googleAnalyticsId?.trim() || null,
        fbPixelId: input.facebookPixelId?.trim() || null,
        fbCapiToken: input.facebookCapiToken?.trim() || null,
        tiktokPixelId: input.tiktokPixelId?.trim() || null,
        snapPixelId: input.snapchatPixelId?.trim() || null,
      },
    });

    revalidatePath("/dashboard/domaine");
    if (shop.slug) revalidatePath(`/shop/${shop.slug}`);

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function updateCustomDomainAction(customDomain: string | null) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true, slug: true, plan: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    if (shop.plan === "free" && customDomain) {
      return {
        ok: false,
        error: "Le domaine personnalisé est réservé aux plans Pro et Business",
      };
    }

    if (customDomain) {
      const domain = customDomain
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
      if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(domain)) {
        return { ok: false, error: "Format domaine invalide (ex: maboutique.com)" };
      }

      const existing = await db.shop.findUnique({
        where: { customDomain: domain },
      });
      if (existing && existing.id !== shop.id) {
        return { ok: false, error: "Ce domaine est déjà utilisé par une autre boutique" };
      }

      await db.shop.update({
        where: { id: shop.id },
        data: { customDomain: domain, customDomainVerifiedAt: null },
      });
    } else {
      await db.shop.update({
        where: { id: shop.id },
        data: { customDomain: null, customDomainVerifiedAt: null },
      });
    }

    revalidatePath("/dashboard/domaine");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
