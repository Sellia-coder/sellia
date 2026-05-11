import type { ShopWithProducts } from "@/lib/shop-data";
import type { ProductCardProduct } from "@/components/shop/ProductCard";

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
  currency: string
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
    rating: null,
    reviewsCount: null,
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
