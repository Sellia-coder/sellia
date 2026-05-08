import { notFound } from "next/navigation";
import { getPublishedShopBySlug } from "@/lib/shop-data";
import ShopSearchPanel from "@/components/shop/ShopSearchPanel";
import ProductCard from "@/components/shop/ProductCard";

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

  const query = (q ?? "").trim().toLowerCase();
  const filtered =
    query.length === 0
      ? shop.products
      : shop.products.filter((p) => {
          const hay = `${p.name} ${p.shortDescription ?? ""} ${p.category ?? ""}`.toLowerCase();
          return hay.includes(query);
        });

  return (
    <section className="shop-page">
      <div className="shop-container">
        <h1 className="shop-page-title">Recherche</h1>
        <p className="shop-page-tagline">
          Trouve un produit par nom ou mot-clé.
        </p>
        <ShopSearchPanel slug={slug} initialQuery={q ?? ""} />

        {filtered.length === 0 ? (
          <div className="shop-products-empty" style={{ marginTop: 24 }}>
            <p>Aucun résultat pour « {query} ».</p>
          </div>
        ) : (
          <div className="shop-products-grid" style={{ marginTop: 28 }}>
            {filtered.map((p) => (
              <ProductCard key={p.id} shopSlug={shop.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
