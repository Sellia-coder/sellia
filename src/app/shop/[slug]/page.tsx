import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getPublishedShopBySlug } from "@/lib/shop-data";
import { categoryLabel, currencyDisplay } from "@/lib/shopProductCard";
import ShopHomeClient from "./ShopHomeClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

const CATEGORY_EMOJI: Record<string, string> = {
  mode: "👗",
  beauté: "💄",
  beaute: "💄",
  alimentation: "🍽️",
  tech: "💻",
  formation: "📚",
  artisanat: "🎨",
  default: "🏷️",
};

function categoryEmoji(name: string): string {
  const key = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [k, emoji] of Object.entries(CATEGORY_EMOJI)) {
    if (key.includes(k)) return emoji;
  }
  return "🏷️";
}

export default async function ShopHomePage({ params }: Props) {
  const { slug } = await params;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) notFound();

  const reviews = await db.review.findMany({
    where: { shopId: shop.id, status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { product: { select: { name: true } } },
  });

  const categoriesMap = new Map<
    string,
    { name: string; emoji: string; count: number }
  >();

  for (const p of shop.products) {
    const label = categoryLabel(p);
    if (!label) continue;
    const existing = categoriesMap.get(label);
    if (existing) {
      existing.count += 1;
    } else {
      categoriesMap.set(label, {
        name: label,
        emoji: categoryEmoji(label),
        count: 1,
      });
    }
  }

  const categories = Array.from(categoriesMap.values()).slice(0, 6);
  const currency = currencyDisplay(shop.currency);
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

  const products = shop.products.map((p) => ({
    id: p.id,
    slug: p.slug ?? p.id,
    name: p.name,
    price: p.price,
    comparePrice: p.comparePrice,
    imageUrl: p.imageUrl,
    emoji: p.emoji || "📦",
    type: p.type,
    isNew: new Date(p.createdAt).getTime() > twoWeeksAgo,
  }));

  const testimonials = reviews.map((r) => ({
    name: r.authorName,
    comment: r.content,
    rating: Math.min(5, Math.max(1, r.rating)),
    productName: r.product?.name,
  }));

  return (
    <ShopHomeClient
      shopSlug={shop.slug}
      shopName={shop.name}
      shopTagline={shop.tagline ?? ""}
      shopDescription={shop.description ?? ""}
      shopLogoUrl={shop.logoUrl}
      shopHeroImageUrl={shop.heroImageUrl ?? shop.ogImageUrl}
      shopHeroTemplate={shop.heroTemplate ?? "universal"}
      shopPrimaryColor={shop.primaryColor ?? "#E84B1F"}
      shopSecondaryColor={shop.secondaryColor ?? shop.bgColor ?? "#FAFAF7"}
      shopWhatsapp={shop.whatsappNumber ?? shop.phone}
      shopCurrency={currency}
      categories={categories}
      products={products}
      testimonials={testimonials}
    />
  );
}
