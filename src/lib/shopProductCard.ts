import type { ShopWithProducts } from "@/lib/shop-data";
import type { ProductCardProduct } from "@/components/shop/ProductCard";
import type { ShopHomeProductCardData } from "@/components/shop/ShopHomeProductCard";

export function categoryLabel(
  p: ShopWithProducts["products"][number]
): string | null {
  const c = p.customCategory?.trim() || p.category?.trim();
  return c || null;
}

function stripHtml(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.replace(/<[^>]+>/g, "").trim();
  return t || null;
}

export function currencyDisplay(c: string): string {
  return c === "XAF" ? "FCFA" : c;
}

export function mapShopProductToCard(
  p: ShopWithProducts["products"][number],
  currency: string,
  reviewStats?: { avg: number; count: number } | null
): ProductCardProduct {
  const tags = p.tags ?? [];
  const t = (x: string) => tags.some((tag) => tag.toLowerCase() === x);
  const stock = p.unlimitedStock ? null : p.stock ?? null;

  return {
    id: p.id,
    slug: p.slug ?? p.id,
    name: p.name,
    price: p.price,
    currency,
    imageUrl: p.imageUrl,
    description: stripHtml(p.shortDescription),
    category: categoryLabel(p),
    rating: reviewStats && reviewStats.count > 0 ? reviewStats.avg : null,
    reviewsCount: reviewStats && reviewStats.count > 0 ? reviewStats.count : null,
    isNew: t("nouveau") || t("new"),
    isBestSeller: tags.some((tag) =>
      /best|bestseller|vedette/i.test(tag)
    ),
    isLimited: false,
    stock,
    comparePrice: p.comparePrice,
    productType: p.type,
  };
}

export function mapShopProductToHomeCard(
  p: ShopWithProducts["products"][number],
  reviewStats?: { avg: number; count: number } | null,
  options?: { isNew?: boolean }
): ShopHomeProductCardData {
  const stats = reviewStats;
  return {
    id: p.id,
    slug: p.slug ?? p.id,
    name: p.name,
    price: p.price,
    comparePrice: p.comparePrice,
    imageUrl: p.imageUrl,
    type: p.type,
    isNew: options?.isNew ?? false,
    ratingAvg: stats && stats.count > 0 ? stats.avg : null,
    ratingCount: stats && stats.count > 0 ? stats.count : null,
  };
}
