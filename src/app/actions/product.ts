"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import {
  productEditSchema,
  type ProductEditInput,
} from "@/lib/validations/personnalisation";

async function verifyShopOwnership(
  userId: string,
  shopId: string
): Promise<boolean> {
  const shop = await db.shop.findFirst({
    where: { id: shopId, ownerId: userId },
    select: { id: true },
  });
  return !!shop;
}

async function getShopSlugById(shopId: string): Promise<string | null> {
  const shop = await db.shop.findUnique({
    where: { id: shopId },
    select: { slug: true },
  });
  return shop?.slug ?? null;
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

function galleryUrlsFromInput(urls: string[] | undefined) {
  const list = (urls ?? []).filter(Boolean);
  return list.length > 0 ? list : undefined;
}

function mapInputToPrismaData(input: ProductEditInput, shopId: string) {
  const trimmedSlug = input.slug?.trim();
  const slug =
    trimmedSlug && trimmedSlug.length > 0
      ? trimmedSlug.toLowerCase()
      : generateProductSlug(input.name, 0);

  const safeHasVariants = input.type === "physical" && (input.hasVariants ?? false);

  return {
    shopId,
    name: input.name.trim(),
    slug,
    description: input.description?.trim() ? input.description : null,
    shortDescription: input.shortDescription?.trim() ? input.shortDescription : null,
    emoji: input.emoji?.trim() ? input.emoji : null,
    price: input.price,
    comparePrice: input.comparePrice ?? null,
    promoEndsAt:
      input.promoEndsAt && input.promoEndsAt.trim()
        ? new Date(input.promoEndsAt)
        : null,
    currency: "XAF" as const,
    category: input.category ?? null,
    customCategory: input.customCategory?.trim() ? input.customCategory : null,
    tags: input.tags ?? [],
    type: input.type || "physical",
    sku: input.sku?.trim() ? input.sku : null,
    stock: input.unlimitedStock ? null : (input.stock ?? 0),
    unlimitedStock: input.unlimitedStock,
    weight: input.type === "physical" ? (input.weight ?? null) : null,
    digitalFileUrl:
      input.type === "digital"
        ? input.digitalFileUrl?.trim()
          ? input.digitalFileUrl
          : null
        : null,
    downloadLimit:
      input.type === "digital" ? (input.downloadLimit ?? null) : null,
    imageUrl: input.imageUrl?.trim() ? input.imageUrl : null,
    galleryUrls: galleryUrlsFromInput(input.galleryUrls),
    hasVariants: safeHasVariants,
    variantAxes: safeHasVariants ? input.variantAxes : undefined,
    feeMode: input.feeMode ?? "merchant_absorbs",
    codAvailable:
      input.type === "physical" ? (input.codAvailable ?? false) : false,
  };
}

async function syncVariants(productId: string, input: ProductEditInput) {
  const safeHasVariants = input.type === "physical" && (input.hasVariants ?? false);

  if (!safeHasVariants) {
    await db.productVariant.deleteMany({ where: { productId } });
    return;
  }

  const variants = input.variants ?? [];
  const inputVariantIds = variants
    .map((v) => v.id)
    .filter((id): id is string => Boolean(id && !id.startsWith("new-")));

  await db.productVariant.deleteMany({
    where: {
      productId,
      ...(inputVariantIds.length > 0 ? { id: { notIn: inputVariantIds } } : {}),
    },
  });

  for (const [idx, v] of variants.entries()) {
    const variantData = {
      productId,
      attributes: v.attributes,
      label: v.label,
      stock: v.stock ?? null,
      priceDelta: v.priceDelta ?? 0,
      imageUrl: v.imageUrl || null,
      sku: v.sku || null,
      isActive: v.isActive ?? true,
      position: idx,
    };

    if (v.id && !v.id.startsWith("new-")) {
      await db.productVariant.update({
        where: { id: v.id },
        data: variantData,
      });
    } else {
      await db.productVariant.create({ data: variantData });
    }
  }
}

function revalidateShopPaths(slug: string | null) {
  if (slug) {
    revalidatePath(`/shop/${slug}`, "page");
    revalidatePath(`/shop/${slug}/recherche`, "page");
  }
  revalidatePath("/dashboard/produits", "page");
}

async function generateUniqueDuplicateSlug(
  shopId: string,
  sourceName: string,
  sourceSlug: string | null
): Promise<string> {
  const baseFromSlug = sourceSlug?.trim()
    ? `${sourceSlug.trim().toLowerCase()}-copie`
    : `${generateProductSlug(sourceName, 0)}-copie`;

  let candidate = baseFromSlug.slice(0, 80);
  let suffix = 1;

  while (true) {
    const exists = await db.product.findFirst({
      where: { shopId, slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    suffix += 1;
    const extra = `-${suffix}`;
    candidate = `${baseFromSlug.slice(0, Math.max(1, 80 - extra.length))}${extra}`;
  }
}

function cloneGalleryUrls(galleryUrls: unknown): string[] | undefined {
  if (!Array.isArray(galleryUrls)) return undefined;
  const list = galleryUrls.filter((u): u is string => typeof u === "string" && u.length > 0);
  return list.length > 0 ? list : undefined;
}

export async function duplicateProductAction(
  productId: string
): Promise<
  | { ok: true; productId: string; slug: string; name: string }
  | { ok: false; error: string }
> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const source = await db.product.findUnique({
      where: { id: productId },
      include: {
        variants: { orderBy: { position: "asc" } },
        shop: { select: { id: true, slug: true, ownerId: true } },
      },
    });

    if (!source) return { ok: false, error: "Produit introuvable" };
    if (source.shop.ownerId !== user.id) {
      return { ok: false, error: "Accès refusé" };
    }

    const duplicateName = `${source.name.trim()} (copie)`;
    const slug = await generateUniqueDuplicateSlug(
      source.shopId,
      duplicateName,
      source.slug
    );

    const count = await db.product.count({ where: { shopId: source.shopId } });

    const duplicateStatus =
      source.status === "active" ? "draft" : source.status;

    const created = await db.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          shopId: source.shopId,
          name: duplicateName,
          slug,
          description: source.description,
          shortDescription: source.shortDescription,
          emoji: source.emoji,
          price: source.price,
          comparePrice: source.comparePrice,
          promoEndsAt: source.promoEndsAt,
          currency: source.currency,
          category: source.category,
          customCategory: source.customCategory,
          tags: [...source.tags],
          type: source.type,
          sku: source.sku ? `${source.sku}-copie` : null,
          stock: source.stock,
          unlimitedStock: source.unlimitedStock,
          weight: source.weight,
          digitalFileUrl: source.digitalFileUrl,
          downloadLimit: source.downloadLimit,
          imageUrl: source.imageUrl,
          galleryUrls: cloneGalleryUrls(source.galleryUrls),
          metaTitle: source.metaTitle,
          metaDescription: source.metaDescription,
          hasVariants: source.hasVariants,
          variantAxes: source.variantAxes ?? undefined,
          feeMode: source.feeMode,
          codAvailable: source.codAvailable,
          status: duplicateStatus,
          position: count,
          views: 0,
        },
      });

      if (source.hasVariants && source.variants.length > 0) {
        await tx.productVariant.createMany({
          data: source.variants.map((v, idx) => ({
            productId: product.id,
            attributes: (v.attributes ?? {}) as Prisma.InputJsonValue,
            label: v.label,
            stock: v.stock,
            priceDelta: v.priceDelta,
            imageUrl: v.imageUrl,
            sku: v.sku ? `${v.sku}-copie` : null,
            isActive: v.isActive,
            position: idx,
          })),
        });
      }

      return product;
    });

    revalidateShopPaths(source.shop.slug);
    revalidatePath(`/dashboard/produits/${created.id}`, "page");

    return {
      ok: true,
      productId: created.id,
      slug: created.slug ?? created.id,
      name: created.name,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[duplicateProductAction]", message);
    return { ok: false, error: message || "Erreur serveur" };
  }
}

export async function createProductAction(input: {
  shopId: string;
  product: ProductEditInput;
}): Promise<
  { ok: true; productId: string; slug: string } | { ok: false; error: string }
> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const isOwner = await verifyShopOwnership(user.id, input.shopId);
    if (!isOwner) {
      return { ok: false, error: "Boutique introuvable ou accès refusé" };
    }

    const parsed = productEditSchema.safeParse(input.product);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message || "Validation échouée";
      return { ok: false, error: firstError };
    }

    const count = await db.product.count({
      where: { shopId: input.shopId },
    });

    const product = await db.product.create({
      data: {
        ...mapInputToPrismaData(parsed.data, input.shopId),
        status: "active",
        position: count,
      },
    });

    await syncVariants(product.id, parsed.data);

    const shopSlug = await getShopSlugById(input.shopId);
    revalidateShopPaths(shopSlug);

    return { ok: true, productId: product.id, slug: product.slug ?? product.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[createProductAction]", message);
    return { ok: false, error: message || "Erreur serveur" };
  }
}

export async function updateProductAction(input: {
  productId: string;
  product: ProductEditInput;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const existing = await db.product.findUnique({
      where: { id: input.productId },
      select: {
        shopId: true,
        shop: { select: { slug: true, ownerId: true } },
      },
    });

    if (!existing) return { ok: false, error: "Produit introuvable" };
    if (existing.shop.ownerId !== user.id) {
      return { ok: false, error: "Accès refusé" };
    }

    const parsed = productEditSchema.safeParse(input.product);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message || "Validation échouée";
      return { ok: false, error: firstError };
    }

    const { shopId: _shopId, ...updateData } = mapInputToPrismaData(
      parsed.data,
      existing.shopId
    );

    await db.product.update({
      where: { id: input.productId },
      data: updateData,
    });

    await syncVariants(input.productId, parsed.data);

    revalidateShopPaths(existing.shop.slug);
    revalidatePath(`/dashboard/produits/${input.productId}`, "page");

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[updateProductAction]", message);
    return { ok: false, error: message || "Erreur serveur" };
  }
}

export async function deleteProductAction(
  productId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const existing = await db.product.findUnique({
      where: { id: productId },
      select: { shop: { select: { slug: true, ownerId: true } } },
    });

    if (!existing) return { ok: false, error: "Produit introuvable" };
    if (existing.shop.ownerId !== user.id) {
      return { ok: false, error: "Accès refusé" };
    }

    await db.product.delete({ where: { id: productId } });

    revalidateShopPaths(existing.shop.slug);

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[deleteProductAction]", message);
    return { ok: false, error: message || "Erreur serveur" };
  }
}

export async function toggleProductActiveAction(
  productId: string,
  isActive: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const existing = await db.product.findUnique({
      where: { id: productId },
      select: { shop: { select: { slug: true, ownerId: true } } },
    });

    if (!existing) return { ok: false, error: "Produit introuvable" };
    if (existing.shop.ownerId !== user.id) {
      return { ok: false, error: "Accès refusé" };
    }

    await db.product.update({
      where: { id: productId },
      data: { status: isActive ? "active" : "draft" },
    });

    revalidateShopPaths(existing.shop.slug);

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message || "Erreur serveur" };
  }
}
