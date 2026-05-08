import Link from "next/link";

interface Props {
  shop: {
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    primaryColor: string | null;
  };
}

function plainSnippet(htmlOrText: string | null | undefined, max: number): string {
  if (!htmlOrText) return "";
  const t = htmlOrText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max) + "…";
}

export default function ShopHero({ shop }: Props) {
  const desc = plainSnippet(shop.description, 280);

  return (
    <section className="shop-hero">
      <div className="shop-container shop-hero-inner">
        <div className="shop-hero-eyebrow">Bienvenue chez</div>
        <h1 className="shop-hero-title">{shop.name}</h1>
        {shop.tagline && <p className="shop-hero-tagline">{shop.tagline}</p>}
        {desc && <p className="shop-hero-desc">{desc}</p>}
        <Link href={`/shop/${shop.slug}#produits`} className="shop-hero-cta">
          Découvrir les produits
        </Link>
      </div>
    </section>
  );
}
