import { notFound } from "next/navigation";
import { getPublishedShopBySlug } from "@/lib/shop-data";
import ShopHero from "@/components/shop/ShopHero";
import ProductCard from "@/components/shop/ProductCard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ShopHomePage({ params }: Props) {
  const { slug } = await params;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) notFound();

  return (
    <>
      <ShopHero shop={shop} />

      <section className="shop-products-section" id="produits">
        <div className="shop-container">
          <header className="shop-products-header">
            <h2 className="shop-products-title">Nos produits</h2>
            <span className="shop-products-count">
              {shop.products.length} produit
              {shop.products.length > 1 ? "s" : ""}
            </span>
          </header>

          {shop.products.length === 0 ? (
            <div className="shop-products-empty">
              <p>Cette boutique n&apos;a pas encore de produits publiés.</p>
            </div>
          ) : (
            <div className="shop-products-grid">
              {shop.products.map((p) => (
                <ProductCard key={p.id} shopSlug={shop.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
