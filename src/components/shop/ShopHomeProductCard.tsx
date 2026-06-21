import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Heart } from "lucide-react";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import styles from "./shop-home-product-card.module.css";

export interface ShopHomeProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice: number | null;
  imageUrl: string | null;
  type?: string;
  isNew?: boolean;
  ratingAvg?: number | null;
  ratingCount?: number | null;
}

interface Props {
  shopSlug: string;
  currency: string;
  primaryColor?: string;
  product: ShopHomeProductCardData;
}

function formatPrice(n: number): string {
  return n.toLocaleString("fr-FR");
}

function productTypeLabel(type: string): string {
  if (type === "digital") return "Produit numérique";
  if (type === "service") return "Service";
  return "Produit physique";
}

export function ShopHomeProductsGrid({
  children,
  className,
  style,
  variant = "home",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: "home" | "catalog";
}) {
  const gridClass =
    variant === "catalog" ? styles.productsGridCatalog : styles.productsGrid;

  return (
    <div className={`${gridClass}${className ? ` ${className}` : ""}`} style={style}>
      {children}
    </div>
  );
}

export default function ShopHomeProductCard({
  shopSlug,
  currency,
  primaryColor = "#E84B1F",
  product,
}: Props) {
  const rating = product.ratingAvg ?? 0;
  const reviewsCount = product.ratingCount ?? 0;

  return (
    <Link
      href={`/shop/${shopSlug}/produit/${product.slug}`}
      className={styles.productCard}
      style={{ "--shop-primary": primaryColor } as CSSProperties}
    >
      {product.isNew && (
        <div className={styles.productBadge} style={{ background: primaryColor }}>
          Nouveau
        </div>
      )}
      <span className={styles.productFav} aria-hidden>
        <Heart size={14} />
      </span>
      <div className={styles.productImageWrap}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
        ) : (
          <ProductImagePlaceholder size="lg" />
        )}
      </div>
      <div className={styles.productInfo}>
        <div className={styles.productName}>{product.name}</div>
        {product.type && (
          <span className={styles.productType}>{productTypeLabel(product.type)}</span>
        )}
        {reviewsCount > 0 && (
          <div className={styles.productRating}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < Math.round(rating) ? "#F5A623" : "none"}
                color="#F5A623"
              />
            ))}
            <span className={styles.productRatingCount}>
              {rating.toFixed(1)} ({reviewsCount})
            </span>
          </div>
        )}
        <div className={styles.productPriceRow}>
          <span className={styles.productPrice} style={{ color: primaryColor }}>
            {formatPrice(product.price)}{" "}
            <span className={styles.productCurrency}>{currency}</span>
          </span>
          {product.comparePrice != null && product.comparePrice > product.price && (
            <span className={styles.productComparePrice}>
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
      <div className={styles.productCardCta}>
        <ShoppingBag size={13} />
        <span>Voir le produit</span>
      </div>
    </Link>
  );
}
