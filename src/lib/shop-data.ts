import { db } from "@/lib/db";

export type ShopWithProducts = NonNullable<
  Awaited<ReturnType<typeof getPublishedShopBySlug>>
>;

export function parseShippingZones(raw: unknown): Array<{
  id: string;
  name: string;
  price: number;
  eta?: string;
}> {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.filter(
    (z): z is { id: string; name: string; price: number; eta?: string } =>
      z != null &&
      typeof z === "object" &&
      "id" in z &&
      "name" in z &&
      typeof (z as { id: unknown }).id === "string"
  );
}

export function shopHasPhysicalProducts(
  products: { type: string }[]
): boolean {
  return products.some((p) => p.type === "physical");
}

export async function getPublishedShopBySlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const shop = await db.shop.findUnique({
    where: { slug: normalized },
    include: {
      products: {
        where: { status: "active" },
        orderBy: { position: "asc" },
        include: {
          variants: {
            where: { isActive: true },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (!shop || shop.status !== "published" || !shop.isPublished) return null;
  return shop;
}

export async function getShopProductBySlug(
  shopSlug: string,
  productSlug: string
) {
  const shop = await getPublishedShopBySlug(shopSlug);
  if (!shop) return null;

  const product = shop.products.find(
    (p) =>
      (p.slug === productSlug || p.id === productSlug) && p.status === "active"
  );
  if (!product) return null;

  return { shop, product };
}

export async function getRelatedProducts(
  shopId: string,
  productId: string,
  limit = 4
) {
  return db.product.findMany({
    where: {
      shopId,
      id: { not: productId },
      status: "active",
    },
    orderBy: { position: "asc" },
    take: limit,
  });
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${ts}-${rand}`;
}

export function getShopCategoryTemplate(category?: string | null): string {
  const c = (category ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const is = (...keys: string[]) => keys.some((k) => c === k);
  const has = (re: RegExp) => re.test(category ?? "");

  if (is("mode", "luxe", "vetements", "vetement", "fashion") || has(/\b(mode|luxe|fashion|pret-a-porter|vetements)\b/i))
    return "mode";
  if (is("beaute", "beauty", "cosmetiques", "cosmetic") || has(/\b(beaute|beauty|cosmet)\b/i))
    return "beaute";
  if (is("alimentation", "food", "restauration") || has(/\b(aliment|food|restaurant)\b/i))
    return "alimentation";
  if (is("tech", "electronique") || has(/\b(tech|electronique|gsm|digital)\b/i))
    return "tech";
  if (is("artisanat", "art") || has(/\b(artisan|fait.main|handmade)\b/i))
    return "artisanat";

  return "default";
}

/** Jusqu’à 5 URLs pour la galerie produit */
export function buildProductGalleryImages(
  imageUrl: string | null | undefined,
  galleryUrls: unknown,
  max = 5
): string[] {
  const urls: string[] = [];
  if (imageUrl?.trim()) urls.push(imageUrl);
  let extras: string[] = [];
  if (Array.isArray(galleryUrls)) {
    extras = galleryUrls.filter((u): u is string => typeof u === "string" && !!u.trim());
  } else if (
    galleryUrls &&
    typeof galleryUrls === "object" &&
    "urls" in (galleryUrls as object)
  ) {
    const u = (galleryUrls as { urls?: unknown }).urls;
    if (Array.isArray(u)) {
      extras = u.filter((x): x is string => typeof x === "string" && !!x.trim());
    }
  }
  for (const u of extras) {
    if (!urls.includes(u)) urls.push(u);
    if (urls.length >= max) break;
  }
  return urls.slice(0, max);
}

export async function getApprovedProductReviews(productId: string) {
  return db.review.findMany({
    where: { productId, status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      authorName: true,
      rating: true,
      content: true,
      createdAt: true,
      merchantReply: true,
      merchantRepliedAt: true,
    },
  });
}

/** Stats d'avis réels par produit (boutique). */
export async function getProductReviewStatsForShop(shopId: string) {
  const rows = await db.review.groupBy({
    by: ["productId"],
    where: {
      shopId,
      status: "approved",
      productId: { not: null },
    },
    _avg: { rating: true },
    _count: { id: true },
  });

  const map = new Map<
    string,
    { avg: number; count: number }
  >();

  for (const row of rows) {
    if (!row.productId) continue;
    map.set(row.productId, {
      avg: Math.round((row._avg.rating ?? 0) * 10) / 10,
      count: row._count.id,
    });
  }

  return map;
}

const PAID_SALES_STATUSES = [
  "paid_escrow",
  "paid_offline",
  "paid_released",
  "delivered",
] as const;

/** Ventes réelles (commandes payées) pour un produit. */
export async function getProductPaidSalesCount(
  productId: string,
  shopId: string
): Promise<number> {
  const orders = await db.order.findMany({
    where: {
      shopId,
      paymentStatus: { in: [...PAID_SALES_STATUSES] },
      status: { not: "cancelled" },
    },
    select: { items: true },
  });

  let total = 0;
  for (const order of orders) {
    if (!Array.isArray(order.items)) continue;
    for (const item of order.items as Array<{
      productId?: string;
      quantity?: number;
    }>) {
      if (item.productId === productId) {
        total += Math.max(1, item.quantity ?? 1);
      }
    }
  }
  return total;
}
