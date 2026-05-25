import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import ProductsListClient from "./ProductsListClient";

export default async function ProductsListPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      slug: true,
      name: true,
      primaryColor: true,
      currency: true,
    },
  });

  if (!shop) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Aucune boutique trouvée</h2>
        <p>Créez d&apos;abord votre boutique pour ajouter des produits.</p>
      </div>
    );
  }

  const products = await db.product.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    include: {
      variants: {
        select: { id: true, stock: true },
      },
    },
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    lowStock: products.filter(
      (p) =>
        p.status === "active" &&
        p.stock !== null &&
        p.stock <= 5 &&
        !p.unlimitedStock
    ).length,
    drafts: products.filter((p) => p.status !== "active").length,
  };

  return (
    <ProductsListClient
      shop={{
        id: shop.id,
        slug: shop.slug,
        name: shop.name,
        primaryColor: shop.primaryColor,
        defaultCurrency: shop.currency,
      }}
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        emoji: p.emoji,
        imageUrl: p.imageUrl,
        galleryUrls: Array.isArray(p.galleryUrls)
          ? (p.galleryUrls as string[])
          : [],
        price: p.price,
        comparePrice: p.comparePrice,
        currency: p.currency,
        category: p.category,
        customCategory: p.customCategory,
        stock: p.stock,
        unlimitedStock: p.unlimitedStock,
        type: p.type,
        isActive: p.status === "active",
        variantsCount: p.variants.length,
        createdAt: p.createdAt.toISOString(),
      }))}
      stats={stats}
    />
  );
}
