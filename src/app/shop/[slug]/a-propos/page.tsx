import { notFound } from "next/navigation";
import { getPublishedShopBySlug } from "@/lib/shop-data";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AboutPage({ params }: Props) {
  const { slug } = await params;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) notFound();

  const plain = shop.description
    ? shop.description.replace(/<[^>]+>/g, "\n").replace(/\s+/g, " ").trim()
    : "";

  return (
    <section className="shop-page">
      <div className="shop-container shop-container-narrow">
        <h1 className="shop-page-title">À propos de {shop.name}</h1>
        {shop.tagline && <p className="shop-page-tagline">{shop.tagline}</p>}
        {plain && (
          <div className="shop-page-prose">
            {plain.split("\n").map((line, i) =>
              line.trim() ? <p key={i}>{line.trim()}</p> : null
            )}
          </div>
        )}
        {!plain && shop.description && (
          <div
            className="shop-page-prose shop-product-description-content"
            dangerouslySetInnerHTML={{ __html: shop.description }}
          />
        )}
      </div>
    </section>
  );
}
