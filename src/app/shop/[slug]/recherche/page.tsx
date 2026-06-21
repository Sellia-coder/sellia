import { notFound } from "next/navigation";
import {
  getPublishedShopBySlug,
  getProductReviewStatsForShop,
} from "@/lib/shop-data";
import {
  currencyDisplay,
  mapShopProductToHomeCard,
} from "@/lib/shopProductCard";
import ShopSearchPanel from "@/components/shop/ShopSearchPanel";
import ShopHomeProductCard, {
  ShopHomeProductsGrid,
} from "@/components/shop/ShopHomeProductCard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function RecherchePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { q } = await searchParams;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) notFound();

  const [reviewStats] = await Promise.all([
    getProductReviewStatsForShop(shop.id),
  ]);

  const currency = currencyDisplay(shop.currency);
  const query = (q ?? "").trim().toLowerCase();
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const filtered =
    query.length === 0
      ? shop.products
      : shop.products.filter((p) => {
          const hay = `${p.name} ${p.shortDescription ?? ""} ${p.category ?? ""}`.toLowerCase();
          return hay.includes(query);
        });

  const title = query.length === 0 ? "Tous les produits" : "Recherche";
  const tagline =
    query.length === 0
      ? "Parcourez l'ensemble de notre catalogue."
      : "Trouve un produit par nom ou mot-clé.";

  return (
    <section className="shop-page">
      <div className="shop-container">
        <h1 className="shop-page-title">{title}</h1>
        <p className="shop-page-tagline">{tagline}</p>
        <ShopSearchPanel slug={slug} initialQuery={q ?? ""} />

        {filtered.length === 0 ? (
          <div className="shop-products-empty" style={{ marginTop: 24 }}>
            <p>Aucun résultat pour « {query} ».</p>
          </div>
        ) : (
          <ShopHomeProductsGrid variant="catalog" style={{ marginTop: 28 }}>
            {filtered.map((p) => (
              <ShopHomeProductCard
                key={p.id}
                shopSlug={shop.slug}
                currency={currency}
                primaryColor={shop.primaryColor ?? undefined}
                product={mapShopProductToHomeCard(
                  p,
                  reviewStats.get(p.id),
                  { isNew: new Date(p.createdAt).getTime() > twoWeeksAgo }
                )}
              />
            ))}
          </ShopHomeProductsGrid>
        )}
      </div>
    </section>
  );
}
