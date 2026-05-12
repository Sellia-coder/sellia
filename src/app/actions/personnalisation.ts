"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import {
  publishShopSchema,
  RESERVED_SLUGS,
  SLUG_REGEX,
  type PublishShopInput,
} from "@/lib/validations/personnalisation";

type DraftGeneratedProduct = {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  emoji?: string;
};

type DraftGeneratedData = {
  name?: string;
  tagline?: string;
  description?: string;
  category?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundStyle?: string | null;
  fontStyle?: string | null;
  products?: DraftGeneratedProduct[];
};

function bgHexFromAppearanceStyle(style: string): string {
  if (style === "white") return "#FFFFFF";
  if (style === "cream") return "#F8F6F0";
  return "#FAFAF7";
}

function fontsFromAppearanceStyle(fontStyle: string): {
  displayFont: string;
  bodyFont: string;
} {
  if (fontStyle === "modern") return { displayFont: "Inter", bodyFont: "Inter" };
  if (fontStyle === "editorial")
    return { displayFont: "Fraunces", bodyFont: "Fraunces" };
  return { displayFont: "Fraunces", bodyFont: "Inter" };
}

export async function getActiveDraftShopAction() {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, error: "Non authentifié" } as const;

  const draft = await db.draftShop.findFirst({
    where: {
      userId: user.id,
      status: { not: "consumed" },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!draft) return { ok: false, error: "Aucune boutique générée" } as const;

  const generatedData =
    draft.generatedData && typeof draft.generatedData === "object"
      ? (draft.generatedData as DraftGeneratedData)
      : null;

  const normalizedDraft = {
    id: draft.id,
    shopName: draft.shopName,
    prompt: draft.prompt,
    status: draft.status,
    primaryColor: generatedData?.primaryColor ?? "#E84B1F",
    secondaryColor: generatedData?.secondaryColor ?? "#404552",
    accentColor: generatedData?.accentColor ?? "#0A0E13",
    backgroundStyle:
      (generatedData?.backgroundStyle as "ivory" | "white" | "cream" | undefined) ??
      "ivory",
    fontStyle:
      (generatedData?.fontStyle as "classic" | "modern" | "editorial" | undefined) ??
      "classic",
    name: generatedData?.name ?? draft.shopName,
    tagline: generatedData?.tagline ?? null,
    description: generatedData?.description ?? draft.prompt,
    category: generatedData?.category ?? null,
    products: Array.isArray(generatedData?.products) ? generatedData.products : [],
  };

  return { ok: true, draft: normalizedDraft } as const;
}

export async function checkSlugAvailabilityAction(slug: string) {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, available: false, reason: "auth" } as const;

  const normalized = slug.trim().toLowerCase();
  if (!SLUG_REGEX.test(normalized)) return { ok: true, available: false, reason: "format" } as const;
  if (RESERVED_SLUGS.includes(normalized)) return { ok: true, available: false, reason: "reserved" } as const;

  const existing = await db.shop.findUnique({
    where: { slug: normalized },
    select: { id: true, ownerId: true },
  });

  if (existing && existing.ownerId !== user.id) {
    return { ok: true, available: false, reason: "taken" } as const;
  }
  return { ok: true, available: true } as const;
}

export async function suggestSlugsAction(baseSlug: string, country?: string) {
  const base = baseSlug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 25);
  if (!base) return { ok: true, suggestions: [] } as const;

  const candidates = [
    `${base}-${country?.toLowerCase() ?? "shop"}`,
    `${base}-${new Date().getFullYear()}`,
    `${base}2`,
    `${base}-pro`,
    `${base}-store`,
    `${base}-officiel`,
  ].filter((s) => SLUG_REGEX.test(s) && !RESERVED_SLUGS.includes(s));

  const taken = await db.shop.findMany({
    where: { slug: { in: candidates } },
    select: { slug: true },
  });
  const takenSet = new Set(taken.map((t) => t.slug));
  const suggestions = candidates.filter((s) => !takenSet.has(s)).slice(0, 4);
  return { ok: true, suggestions } as const;
}

export async function publishShopAction(input: PublishShopInput) {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, error: "Non authentifié" } as const;
  const userId = user.id;

  const parsed = publishShopSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides", issues: parsed.error.flatten() } as const;
  }
  const data = parsed.data;

  const draft = await db.draftShop.findFirst({
    where: {
      userId,
      status: { not: "consumed" },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!draft) return { ok: false, error: "Aucune boutique générée" } as const;

  const generatedData =
    draft.generatedData && typeof draft.generatedData === "object"
      ? (draft.generatedData as DraftGeneratedData)
      : null;

  const slug = data.step1.slug.toLowerCase();
  const slugTaken = await db.shop.findUnique({ where: { slug }, select: { id: true } });
  if (slugTaken) {
    return { ok: false, error: "Ce sous-domaine vient d'être pris.", field: "slug" } as const;
  }

  const existingShop = await db.shop.findFirst({
    where: {
      ownerId: userId,
      OR: [{ status: "published" }, { isPublished: true }],
    },
    select: { id: true },
  });
  if (existingShop) return { ok: false, error: "Tu as déjà une boutique publiée." } as const;

  try {
    const includedProducts = data.step2.products.filter((p) => p.included);
    const appearance = data.stepAppearance;
    const { displayFont, bodyFont } = fontsFromAppearanceStyle(
      appearance.fontStyle
    );
    const bgHex = bgHexFromAppearanceStyle(appearance.backgroundStyle);

    const shop = await db.$transaction(async (tx) => {
      const createdShop = await tx.shop.create({
        data: {
          ownerId: userId,
          name:
            draft.shopName?.trim() ||
            generatedData?.name?.trim() ||
            "Ma boutique",
          slug,
          tagline: generatedData?.tagline ?? null,
          description: data.step4.description,
          category: generatedData?.category ?? null,
          primaryColor: appearance.primaryColor,
          secondaryColor: generatedData?.secondaryColor ?? "#404552",
          accentColor: appearance.accentColor,
          bgColor: bgHex,
          displayFont,
          bodyFont,
          backgroundStyle: appearance.backgroundStyle,
          fontStyle: appearance.fontStyle,
          logoUrl: data.step1.logoUrl ?? null,
          whatsappNumber: data.step3.whatsappNumber,
          contactEmail: data.step3.contactEmail,
          city: data.step3.city,
          country: data.step3.country,
          address: data.step3.address || null,
          instagramUrl: data.step3.instagramUrl || null,
          facebookUrl: data.step3.facebookUrl || null,
          shippingZones: data.step35?.shippingZones
            ? (data.step35.shippingZones as any)
            : null,
          paymentCashOnDelivery: data.step35?.paymentCashOnDelivery ?? true,
          paymentOnlineEscrow: data.step35?.paymentOnlineEscrow ?? true,
          currency: "XAF",
          status: "published",
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      if (includedProducts.length > 0) {
        for (let i = 0; i < includedProducts.length; i++) {
          const p = includedProducts[i];
          const trimmedSlug = p.slug?.trim();
          const productSlug =
            trimmedSlug && trimmedSlug.length > 0 ? trimmedSlug.toLowerCase() : generateProductSlug(p.name, i);
          const safeHasVariants = p.type === "physical" && (p.hasVariants ?? false);
          const safeAxes = safeHasVariants ? p.variantAxes : undefined;
          const safeVariants: any[] | undefined =
            safeHasVariants && Array.isArray(p.variants) && p.variants.length > 0
              ? p.variants
              : undefined;

          await tx.product.create({
            data: {
              shopId: createdShop.id,
              name: p.name,
              slug: productSlug,
              description: p.description?.trim() ? p.description : null,
              shortDescription: p.shortDescription?.trim() ? p.shortDescription : null,
              emoji: p.emoji?.trim() ? p.emoji : null,
              price: p.price,
              comparePrice: p.comparePrice ?? null,
              currency: "XAF",
              category: p.category ?? null,
              customCategory: p.customCategory?.trim() ? p.customCategory : null,
              tags: p.tags ?? [],
              type: p.type,
              sku: p.sku?.trim() ? p.sku : null,
              stock: p.unlimitedStock ? null : (p.stock ?? 0),
              unlimitedStock: p.unlimitedStock,
              weight: p.type === "physical" ? (p.weight ?? null) : null,
              digitalFileUrl: p.type === "digital" ? (p.digitalFileUrl?.trim() ? p.digitalFileUrl : null) : null,
              downloadLimit: p.type === "digital" ? (p.downloadLimit ?? null) : null,
              imageUrl: p.imageUrl?.trim() ? p.imageUrl : null,
              galleryUrls:
                Array.isArray(p.galleryUrls) && p.galleryUrls.length > 0 ? p.galleryUrls : undefined,
              hasVariants: safeHasVariants,
              variantAxes: safeAxes ?? undefined,
              variants: safeVariants
                ? {
                    create: safeVariants.map((v: any, vi: number) => ({
                      attributes: v.attributes,
                      label: v.label,
                      stock: v.stock ?? null,
                      priceDelta: v.priceDelta ?? 0,
                      imageUrl: v.imageUrl ?? null,
                      sku: v.sku ?? null,
                      isActive: v.isActive ?? true,
                      position: vi,
                    })),
                  }
                : undefined,
              status: "active",
              position: i,
            },
          });
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true },
      });

      await tx.draftShop.update({
        where: { id: draft.id },
        data: { status: "consumed", consumedAt: new Date() },
      });

      return createdShop;
    });

    revalidatePath("/dashboard");
    revalidatePath("/personnaliser-ma-boutique");

    return {
      ok: true,
      shop: {
        id: shop.id,
        slug: shop.slug,
        name: shop.name,
        publicUrl: `https://${shop.slug}.getsellia.com`,
      },
    } as const;
  } catch (e) {
    console.error("[publishShopAction]", e);
    return { ok: false, error: "Une erreur est survenue. Réessaye dans un instant." } as const;
  }
}

function generateProductSlug(name: string, index: number): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return base ? `${base}-${index + 1}` : `produit-${index + 1}`;
}
