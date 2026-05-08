import Link from "next/link";

interface Props {
  shopSlug: string;
  product: {
    id: string;
    slug: string | null;
    name: string;
    shortDescription: string | null;
    price: number;
    comparePrice: number | null;
    emoji: string | null;
    imageUrl: string | null;
    type: string;
  };
}

export default function ProductCard({ shopSlug, product }: Props) {
  const segment = product.slug ?? product.id;
  const productPath = `/shop/${shopSlug}/produit/${segment}`;
  const hasPromo =
    product.comparePrice != null && product.comparePrice > product.price;
  const promoPercent = hasPromo
    ? Math.round(
        ((product.comparePrice! - product.price) / product.comparePrice!) * 100
      )
    : 0;

  return (
    <Link href={productPath} className="shop-product-card">
      <div className="shop-product-card-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <span className="shop-product-card-emoji">{product.emoji ?? "🛍️"}</span>
        )}
        {hasPromo && (
          <span className="shop-product-card-badge">-{promoPercent}%</span>
        )}
        {product.type === "digital" && (
          <span className="shop-product-card-tag">Digital</span>
        )}
        {product.type === "service" && (
          <span className="shop-product-card-tag">Service</span>
        )}
      </div>
      <div className="shop-product-card-body">
        <h3 className="shop-product-card-name">{product.name}</h3>
        {product.shortDescription && (
          <p className="shop-product-card-desc">{product.shortDescription}</p>
        )}
        <div className="shop-product-card-pricing">
          <span className="shop-product-card-price">
            {product.price.toLocaleString("fr-FR")} FCFA
          </span>
          {hasPromo && (
            <span className="shop-product-card-compare">
              {product.comparePrice!.toLocaleString("fr-FR")} FCFA
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
