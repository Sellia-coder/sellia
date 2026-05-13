"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Plus, Check, Star } from "lucide-react";
import {
  addToCart,
  isFavorite,
  toggleFavorite,
} from "@/lib/cart";
import { getProductRating, getRatingAriaLabel } from "@/lib/utils/product-rating";
import { useCartContext } from "./CartProvider";
import styles from "./ProductCard.module.css";

export interface ProductCardProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency?: string;
  imageUrl: string | null;
  description?: string | null;
  category?: string | null;
  badge?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  isLimited?: boolean;
  stock?: number | null;
  comparePrice?: number | null;
  productType?: string | null;
}

interface Props {
  product: ProductCardProduct;
  shopSlug: string;
  primaryColor?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR").format(price);
}

function getBadge(
  product: ProductCardProduct
): { label: string; type: "new" | "best" | "limited" | "custom" } | null {
  if (product.badge) {
    return { label: product.badge.toUpperCase(), type: "custom" };
  }
  if (
    product.comparePrice != null &&
    product.comparePrice > product.price
  ) {
    const pct = Math.round(
      ((product.comparePrice - product.price) / product.comparePrice) * 100
    );
    return { label: `-${pct}%`, type: "custom" };
  }
  if (product.isNew) return { label: "NOUVEAU", type: "new" };
  if (product.isBestSeller) return { label: "BEST-SELLER", type: "best" };
  if (product.isLimited) return { label: "LIMITÉ", type: "limited" };
  if (
    product.stock !== undefined &&
    product.stock !== null &&
    product.stock <= 5 &&
    product.stock > 0
  ) {
    return { label: "LIMITÉ", type: "limited" };
  }
  return null;
}

export default function ProductCard({
  product,
  shopSlug,
  primaryColor = "#E84B1F",
}: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const { refresh } = useCartContext();

  const segment = product.slug ?? product.id;
  const productPath = `/shop/${shopSlug}/produit/${segment}`;
  const currency = product.currency ?? "FCFA";
  const badge = getBadge(product);
  const rating = getProductRating(product.id);

  useEffect(() => {
    setFavorited(isFavorite(shopSlug, product.id));
  }, [shopSlug, product.id]);

  useEffect(() => {
    const onFavs = () => setFavorited(isFavorite(shopSlug, product.id));
    window.addEventListener("sellia-favs-change", onFavs);
    return () => window.removeEventListener("sellia-favs-change", onFavs);
  }, [shopSlug, product.id]);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(shopSlug, product.id);
    setFavorited(isFavorite(shopSlug, product.id));
    refresh();
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    addToCart(shopSlug, {
      productId: product.id,
      productSlug: segment,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      emoji: null,
      productType: product.productType ?? "physical",
    });
    refresh();
    window.dispatchEvent(
      new CustomEvent("sellia:toast", {
        detail: { message: `${product.name} ajouté au panier`, type: "success" },
      })
    );
    setTimeout(() => setIsAdding(false), 2000);
  };

  return (
    <Link href={productPath} className={styles.card} prefetch={false}>
      <div className={styles.media}>
        {badge && (
          <span
            className={`${styles.badge} ${styles[`badge_${badge.type}`]}`}
            style={
              badge.type === "custom"
                ? { backgroundColor: primaryColor }
                : undefined
            }
          >
            {badge.label}
          </span>
        )}

        <button
          type="button"
          className={`${styles.favBtn} ${favorited ? styles.favBtnActive : ""}`}
          onClick={handleFav}
          aria-label={
            favorited ? "Retirer des favoris" : "Ajouter aux favoris"
          }
        >
          <Heart size={16} strokeWidth={2.2} fill={favorited ? "currentColor" : "none"} />
        </button>

        <div className={styles.mediaInner}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt=""
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>{product.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {product.category && (
          <span className={styles.category}>{product.category.toUpperCase()}</span>
        )}

        <h3 className={styles.name}>{product.name}</h3>

        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}

        <div className={styles.metaRow}>
          <div className={styles.rating} aria-label={getRatingAriaLabel(rating)}>
            <Star size={13} strokeWidth={0} fill="#FFB800" />
            <span className={styles.ratingValue}>{rating.formatted}</span>
            <span className={styles.ratingCount}>({rating.count})</span>
          </div>
          <div className={styles.priceWrap}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            <span className={styles.currency}>{currency}</span>
          </div>
        </div>

        <div className={styles.productActions}>
          <span
            className={styles.productBtnView}
            style={{ "--shop-primary": primaryColor } as React.CSSProperties}
          >
            Voir le produit
          </span>
          <button
            type="button"
            className={`${styles.productBtnAdd} ${isAdding ? styles.productBtnAddSuccess : ""}`}
            onClick={handleQuickAdd}
            disabled={isAdding}
            aria-label="Ajouter au panier"
            style={{ "--shop-primary": primaryColor } as React.CSSProperties}
          >
            {isAdding ? (
              <Check size={16} strokeWidth={2.6} />
            ) : (
              <Plus size={16} strokeWidth={2.6} />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
