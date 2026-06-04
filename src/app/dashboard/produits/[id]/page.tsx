import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import ProductEditClient from "./ProductEditClient";
import {
  PRODUCT_CATEGORY_CODES,
  type ProductEditInput,
} from "@/lib/validations/personnalisation";

function parseCategory(
  value: string | null
): ProductEditInput["category"] {
  if (!value) return undefined;
  if (
    (PRODUCT_CATEGORY_CODES as readonly string[]).includes(value)
  ) {
    return value as ProductEditInput["category"];
  }
  return undefined;
}

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const product = await db.product.findUnique({
    where: { id },
    include: {
      shop: {
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
          primaryColor: true,
          ownerId: true,
        },
      },
      variants: { orderBy: { position: "asc" } },
    },
  });

  if (!product || product.shop.ownerId !== user.id) {
    notFound();
  }

  const variantAxes = Array.isArray(product.variantAxes)
    ? (product.variantAxes as ProductEditInput["variantAxes"])
    : [];

  const initialProduct: ProductEditInput = {
    id: product.id,
    name: product.name,
    slug: product.slug || "",
    shortDescription: product.shortDescription || "",
    description: product.description || "",
    emoji: product.emoji || "",
    price: product.price,
    comparePrice: product.comparePrice,
    promoEndsAt: product.promoEndsAt
      ? new Date(product.promoEndsAt).toISOString().slice(0, 16)
      : "",
    category: parseCategory(product.category),
    customCategory: product.customCategory || "",
    tags: product.tags || [],
    type: (product.type as ProductEditInput["type"]) || "physical",
    sku: product.sku || "",
    stock: product.stock,
    unlimitedStock: product.unlimitedStock,
    weight: product.weight,
    digitalFileUrl: product.digitalFileUrl || "",
    downloadLimit: product.downloadLimit,
    imageUrl: product.imageUrl,
    galleryUrls: Array.isArray(product.galleryUrls)
      ? (product.galleryUrls as string[])
      : [],
    hasVariants: product.hasVariants,
    variantAxes,
    variants: product.variants.map((v) => ({
      id: v.id,
      attributes: v.attributes as Record<string, string>,
      label: v.label,
      stock: v.stock,
      priceDelta: v.priceDelta,
      imageUrl: v.imageUrl,
      sku: v.sku,
      isActive: v.isActive,
      position: v.position,
    })),
    feeMode: product.feeMode as ProductEditInput["feeMode"],
    codAvailable: product.codAvailable,
    included: true,
  };

  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Chargement…</div>}>
      <ProductEditClient
        productId={product.id}
        initialProduct={initialProduct}
        shopId={product.shop.id}
        shopSlug={product.shop.slug}
        shopName={product.shop.name}
        shopCategory={product.shop.category}
        shopPrimaryColor={product.shop.primaryColor || "#E84B1F"}
        isActive={product.status === "active"}
      />
    </Suspense>
  );
}
