"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  RefreshCw,
  MessageCircle,
  Check,
} from "lucide-react";
import { addToCart } from "@/lib/cart";
import { usePixelTracking } from "@/lib/use-pixel-tracking";
import { useCartContext } from "./CartProvider";
import { buildProductGalleryImages } from "@/lib/shop-data";
import { getProductRating, getRatingAriaLabel } from "@/lib/utils/product-rating";
import ProductReviews from "./ProductReviews";
import styles from "./ProductDetail.module.css";

interface VariantAxis {
  name: string;
  values: string[];
  swatches?: string[];
}

interface Variant {
  id: string;
  attributes: Record<string, string>;
  label: string;
  stock: number | null;
  priceDelta: number;
  imageUrl: string | null;
  isActive: boolean;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR").format(price);
}

function currencyLabel(currency: string): string {
  return currency === "XAF" ? "FCFA" : currency;
}

interface ReviewVM {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
}

interface Props {
  shop: {
    id: string;
    slug: string;
    name: string;
    primaryColor?: string | null;
    currency?: string | null;
    paymentCashOnDelivery?: boolean;
    paymentOnlineEscrow?: boolean;
  };
  product: {
    id: string;
    slug: string | null;
    name: string;
    price: number;
    comparePrice: number | null;
    currency?: string | null;
    imageUrl: string | null;
    galleryUrls?: unknown;
    description: string | null;
    shortDescription: string | null;
    category: string | null;
    stock: number | null;
    unlimitedStock?: boolean;
    type?: string;
    emoji?: string | null;
    hasVariants?: boolean;
    variantAxes?: unknown;
    variants?: Variant[];
  };
  related: Array<{
    id: string;
    slug: string | null;
    name: string;
    price: number;
    imageUrl: string | null;
    currency?: string | null;
  }>;
  reviews: Array<{
    id: string;
    authorName: string;
    rating: number;
    content: string;
    createdAt: Date;
  }>;
}

export default function ProductDetail({
  shop,
  product,
  related,
  reviews: reviewsProp,
}: Props) {
  const router = useRouter();
  const { refresh } = useCartContext();
  const { trackViewContent, trackAddToCart } = usePixelTracking();
  const primaryColor = shop.primaryColor ?? "#E84B1F";
  const currencyCode = product.currency ?? shop.currency ?? "XAF";
  const currency = currencyLabel(currencyCode);

  const variantAxes: VariantAxis[] = Array.isArray(product.variantAxes)
    ? (product.variantAxes as VariantAxis[])
    : [];
  const hasVariants = Boolean(product.hasVariants) && variantAxes.length > 0;
  const productVariants: Variant[] = product.variants ?? [];

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    if (hasVariants && variantAxes.length > 0) {
      const init: Record<string, string> = {};
      for (const axis of variantAxes) {
        if (axis.values.length > 0) init[axis.name] = axis.values[0];
      }
      return init;
    }
    return {};
  });

  const activeVariant = useMemo(() => {
    if (!hasVariants || productVariants.length === 0) return null;
    return productVariants.find((v) =>
      Object.entries(v.attributes).every(([k, val]) => selectedAttributes[k] === val)
    ) ?? null;
  }, [hasVariants, productVariants, selectedAttributes]);

  const effectivePrice = activeVariant ? product.price + activeVariant.priceDelta : product.price;
  const effectiveStock = activeVariant
    ? (activeVariant.stock ?? product.stock ?? 0)
    : (product.stock ?? 0);
  const variantImage = activeVariant?.imageUrl ?? null;

  const allImages = buildProductGalleryImages(
    variantImage ?? product.imageUrl,
    product.galleryUrls,
    8
  );
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  useEffect(() => {
    setActiveImageIdx(0);
  }, [product.id, activeVariant?.id]);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description"
  );

  useEffect(() => {
    trackViewContent({
      productId: product.id,
      productName: product.name,
      price: effectivePrice,
      currency: currencyCode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, effectivePrice]);

  const segment = product.slug ?? product.id;

  const reviews: ReviewVM[] = reviewsProp.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    comment: r.content,
    createdAt: r.createdAt,
  }));

  const syntheticRating = getProductRating(product.id);
  const ratingValue =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : syntheticRating.value;
  const reviewsCountDisplay =
    reviews.length > 0 ? reviews.length : syntheticRating.count;
  const ratingFormatted =
    reviews.length > 0 ? ratingValue.toFixed(1) : syntheticRating.formatted;
  const ratingAria =
    reviews.length > 0
      ? `Note moyenne : ${ratingFormatted} étoiles sur 5 (${reviewsCountDisplay} avis)`
      : getRatingAriaLabel(syntheticRating);

  const unlimited = product.unlimitedStock ?? true;
  const rawStock = hasVariants ? effectiveStock : (product.stock ?? 0);
  const maxQty = (unlimited && !hasVariants) ? 99 : Math.min(99, Math.max(1, rawStock));
  const isOutOfStock = hasVariants
    ? effectiveStock <= 0
    : (!unlimited && product.stock !== null && product.stock <= 0);

  const showOnlineEscrow = Boolean(shop.paymentOnlineEscrow);
  const showCashOnDelivery = Boolean(shop.paymentCashOnDelivery);

  const cartLinePayload = () => ({
    productId: product.id,
    productSlug: segment,
    name: activeVariant ? `${product.name} — ${activeVariant.label}` : product.name,
    price: effectivePrice,
    imageUrl: variantImage ?? product.imageUrl ?? null,
    emoji: product.emoji ?? null,
    productType: product.type ?? "physical",
  });

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(shop.slug, cartLinePayload(), quantity);
    trackAddToCart({
      productId: product.id,
      productName: product.name,
      price: effectivePrice,
      currency: currencyCode,
      quantity,
    });
    refresh();
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(shop.slug, cartLinePayload(), quantity);
    trackAddToCart({
      productId: product.id,
      productName: product.name,
      price: effectivePrice,
      currency: currencyCode,
      quantity,
    });
    refresh();
    router.push(`/shop/${shop.slug}/commander`);
  };

  return (
    <>
      <article className={styles.detail}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.gallery}>
              <div className={styles.galleryMain}>
                {allImages.length > 0 ? (
                  <img
                    src={allImages[activeImageIdx]}
                    alt={product.name}
                    className={styles.galleryImage}
                  />
                ) : (
                  <div className={styles.galleryPlaceholder}>
                    <span>
                      {product.emoji
                        ? String(product.emoji).charAt(0).toUpperCase()
                        : product.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className={styles.galleryThumbs}>
                  {allImages.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      className={`${styles.galleryThumb} ${i === activeImageIdx ? styles.galleryThumbActive : ""}`}
                      onClick={() => setActiveImageIdx(i)}
                      style={
                        i === activeImageIdx
                          ? { borderColor: primaryColor }
                          : undefined
                      }
                      aria-label={`Image ${i + 1}`}
                    >
                      <img src={url} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.info}>
              <h1 className={styles.name}>{product.name}</h1>

              <div className={styles.ratingRow}>
                <div
                  className="shop-product-detail-rating"
                  aria-label={ratingAria}
                >
                  <div className="shop-product-detail-stars">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = star <= Math.floor(ratingValue);
                      const halfFilled =
                        !filled &&
                        star === Math.ceil(ratingValue) &&
                        ratingValue % 1 >= 0.3;
                      return (
                        <svg
                          key={star}
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill={filled || halfFilled ? "#FBBF24" : "none"}
                          stroke="#FBBF24"
                          strokeWidth="1.5"
                          aria-hidden
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      );
                    })}
                  </div>
                  <span className="shop-product-detail-rating-value">
                    {ratingFormatted}/5
                  </span>
                  <span className="shop-product-detail-rating-count">
                    ({reviewsCountDisplay} avis)
                  </span>
                </div>
                <div className={styles.securePay}>
                  <ShieldCheck size={13} strokeWidth={2.4} />
                  <span>Paiement sécurisé</span>
                </div>
              </div>

              {product.shortDescription && (
                <p className={styles.shortDesc}>{product.shortDescription}</p>
              )}

              <div className={styles.priceWrap}>
                <span className={styles.price} style={{ color: primaryColor }}>
                  {formatPrice(effectivePrice)}
                </span>
                <span className={styles.currency}>{currency}</span>
                {product.comparePrice != null &&
                  product.comparePrice > effectivePrice && (
                    <span className={styles.comparePrice}>
                      {formatPrice(product.comparePrice)} {currency}
                    </span>
                  )}
              </div>

              {hasVariants && variantAxes.map((axis) => (
                <div key={axis.name} className={styles.variantBlock}>
                  <span className={styles.variantLabel}>{axis.name}</span>
                  {axis.swatches ? (
                    <div className={styles.colorOptions}>
                      {axis.values.map((val, i) => {
                        const isActive = selectedAttributes[axis.name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            className={`${styles.colorOption} ${isActive ? styles.colorOptionActive : ""}`}
                            onClick={() => setSelectedAttributes({ ...selectedAttributes, [axis.name]: val })}
                            style={isActive ? { borderColor: primaryColor } : undefined}
                            aria-label={val}
                            title={val}
                          >
                            <span className={styles.colorSwatch} style={{ backgroundColor: axis.swatches?.[i] }} />
                            {isActive && (
                              <Check size={12} strokeWidth={3} className={styles.colorCheck} style={{ color: "#FFFFFF" }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.sizeOptions}>
                      {axis.values.map((val) => {
                        const isActive = selectedAttributes[axis.name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            className={`${styles.sizeOption} ${isActive ? styles.sizeOptionActive : ""}`}
                            onClick={() => setSelectedAttributes({ ...selectedAttributes, [axis.name]: val })}
                            style={isActive ? { backgroundColor: primaryColor, borderColor: primaryColor, color: "#FFFFFF" } : undefined}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div className={styles.quantityBlock}>
                <span className={styles.variantLabel}>
                  Quantité{" "}
                  <span className={styles.stockNote}>
                    (
                    {unlimited && !hasVariants
                      ? "En stock"
                      : `${rawStock} disponible${rawStock !== 1 ? "s" : ""}`}
                    )
                  </span>
                </span>
                <div className={styles.quantityControl}>
                  <button
                    type="button"
                    className={styles.quantityBtn}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Diminuer"
                  >
                    <Minus size={14} strokeWidth={2.4} />
                  </button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button
                    type="button"
                    className={styles.quantityBtn}
                    onClick={() =>
                      setQuantity((q) => Math.min(maxQty, q + 1))
                    }
                    disabled={quantity >= maxQty}
                    aria-label="Augmenter"
                  >
                    <Plus size={14} strokeWidth={2.4} />
                  </button>
                </div>
              </div>

              <div className={styles.ctas}>
                {!isOutOfStock && (showOnlineEscrow || showCashOnDelivery) && (
                  <button
                    type="button"
                    className={styles.buyBtn}
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    }}
                    onClick={handleBuyNow}
                  >
                    Acheter maintenant
                  </button>
                )}
                <button
                  type="button"
                  className={styles.addCartBtn}
                  onClick={handleAddToCart}
                  style={{ color: primaryColor, borderColor: primaryColor }}
                  disabled={isOutOfStock}
                >
                  Ajouter au panier
                </button>
              </div>

              <div className={styles.paymentsBlock}>
                <span className={styles.paymentsLabel}>
                  Moyens de paiement disponibles
                </span>
                <div className={styles.paymentsLogos}>
                  <div className={styles.payLogo} aria-label="Visa">
                    <svg
                      viewBox="0 0 48 16"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                    >
                      <path
                        d="M19.9 0.5L17.3 15.5H13.7L16.3 0.5H19.9Z"
                        fill="#1A1F71"
                      />
                      <path
                        d="M32 0.9C31.3 0.6 30.2 0.3 28.9 0.3C25.6 0.3 23.3 2.1 23.3 4.7C23.3 6.6 25 7.7 26.3 8.3C27.6 8.9 28 9.3 28 9.9C28 10.8 26.9 11.2 25.9 11.2C24.5 11.2 23.7 11 22.5 10.5L22 10.3L21.5 13.6C22.4 14 24 14.4 25.7 14.4C29.2 14.4 31.5 12.7 31.5 9.9C31.5 8.4 30.6 7.2 28.5 6.3C27.2 5.7 26.5 5.3 26.5 4.6C26.5 4 27.1 3.5 28.5 3.5C29.6 3.5 30.5 3.7 31.1 4L31.5 4.2L32 0.9Z"
                        fill="#1A1F71"
                      />
                      <path
                        d="M37.8 0.5H40.4C41.2 0.5 41.8 0.7 42.2 1.6L46.7 15.5H43.2L42.5 13.3H37.7L36.9 15.5H33.4L37.8 0.5ZM41.5 10.5L40.2 5.4L38.8 10.5H41.5Z"
                        fill="#1A1F71"
                      />
                      <path
                        d="M10.7 0.5L7.3 10.7L7 9C6.3 6.8 4.4 4.4 2.2 3.2L5.4 15.4H9L14.3 0.5H10.7Z"
                        fill="#1A1F71"
                      />
                    </svg>
                  </div>
                  <div className={styles.payLogo} aria-label="Mastercard">
                    <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="13" cy="12" r="9" fill="#EB001B" />
                      <circle cx="23" cy="12" r="9" fill="#F79E1B" />
                      <path
                        d="M18 5.2C16.2 6.8 15 9.3 15 12C15 14.7 16.2 17.2 18 18.8C19.8 17.2 21 14.7 21 12C21 9.3 19.8 6.8 18 5.2Z"
                        fill="#FF5F00"
                      />
                    </svg>
                  </div>
                  <div
                    className={styles.payLogoText}
                    style={{ backgroundColor: "#FF6900" }}
                  >
                    <span>Orange Money</span>
                  </div>
                  <div
                    className={styles.payLogoText}
                    style={{
                      backgroundColor: "#FFCC00",
                      color: "#0A0E13",
                    }}
                  >
                    <span>MTN MoMo</span>
                  </div>
                  <div
                    className={styles.payLogoText}
                    style={{ backgroundColor: "#1DC8FF" }}
                  >
                    <span>Wave</span>
                  </div>
                </div>
              </div>

              <div className={styles.trustGrid}>
                <div className={styles.trustItem}>
                  <div className={styles.trustIcon} style={{ color: primaryColor }}>
                    <Truck size={18} strokeWidth={2} />
                  </div>
                  <div className={styles.trustText}>
                    <span className={styles.trustTitle}>Livraison rapide</span>
                    <span className={styles.trustDesc}>
                      24-48h dans votre région
                    </span>
                  </div>
                </div>
                <div className={styles.trustItem}>
                  <div className={styles.trustIcon} style={{ color: primaryColor }}>
                    <RefreshCw size={18} strokeWidth={2} />
                  </div>
                  <div className={styles.trustText}>
                    <span className={styles.trustTitle}>Retours gratuits</span>
                    <span className={styles.trustDesc}>Sous 7 jours</span>
                  </div>
                </div>
                <div className={styles.trustItem}>
                  <div className={styles.trustIcon} style={{ color: primaryColor }}>
                    <ShieldCheck size={18} strokeWidth={2} />
                  </div>
                  <div className={styles.trustText}>
                    <span className={styles.trustTitle}>Paiement sécurisé</span>
                    <span className={styles.trustDesc}>Protégé par Sellia</span>
                  </div>
                </div>
                <div className={styles.trustItem}>
                  <div className={styles.trustIcon} style={{ color: primaryColor }}>
                    <MessageCircle size={18} strokeWidth={2} />
                  </div>
                  <div className={styles.trustText}>
                    <span className={styles.trustTitle}>Support 24/7</span>
                    <span className={styles.trustDesc}>Réponse sous 24h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className={styles.tabsSection}>
            <div className={styles.tabsHeader}>
              <button
                type="button"
                className={`${styles.tab}`}
                onClick={() => setActiveTab("description")}
                style={
                  activeTab === "description"
                    ? {
                        color: primaryColor,
                        borderBottomColor: primaryColor,
                      }
                    : undefined
                }
              >
                Description
              </button>
              <button
                type="button"
                className={`${styles.tab}`}
                onClick={() => setActiveTab("reviews")}
                style={
                  activeTab === "reviews"
                    ? {
                        color: primaryColor,
                        borderBottomColor: primaryColor,
                      }
                    : undefined
                }
              >
                Avis ({reviewsProp.length})
              </button>
            </div>

            <div className={styles.tabsContent}>
              {activeTab === "description" && (
                <div className={styles.descContent}>
                  {product.description ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.description,
                      }}
                    />
                  ) : (
                    <p>
                      {product.shortDescription ??
                        "Pas de description disponible."}
                    </p>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <>
                  <div className={styles.reviewsList}>
                    {reviews.length === 0 ? (
                      <p className={styles.reviewsEmpty}>
                        Aucun avis pour ce produit pour le moment.
                      </p>
                    ) : (
                      reviews.map((review) => (
                        <div key={review.id} className={styles.reviewItem}>
                          <div className={styles.reviewHeader}>
                            <span className={styles.reviewAuthor}>
                              {review.authorName}
                            </span>
                            <div className={styles.reviewStars}>
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  strokeWidth={0}
                                  fill={
                                    i <= review.rating ? "#FFB800" : "#E5E2DA"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          <p className={styles.reviewComment}>
                            {review.comment}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className={styles.reviewSubmitWrap}>
                    <ProductReviews
                      shopId={shop.id}
                      productId={product.id}
                      embedded
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {related.length > 0 && (
            <section className={styles.relatedSection}>
              <div className={styles.relatedHeader}>
                <h2 className={styles.relatedTitle}>Vous aimerez aussi</h2>
                <Link
                  href={`/shop/${shop.slug}`}
                  className={styles.relatedSeeAll}
                  style={{ color: primaryColor }}
                >
                  Voir tout
                </Link>
              </div>
              <div className={styles.relatedGrid}>
                {related.slice(0, 5).map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/shop/${shop.slug}/produit/${rel.slug ?? rel.id}`}
                    className={styles.relatedCard}
                  >
                    <div className={styles.relatedImage}>
                      {rel.imageUrl ? (
                        <img src={rel.imageUrl} alt={rel.name} />
                      ) : (
                        <div className={styles.relatedPlaceholder}>
                          <span>{rel.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.relatedInfo}>
                      <span className={styles.relatedName}>{rel.name}</span>
                      <span className={styles.relatedShop}>{shop.name}</span>
                      <span className={styles.relatedPrice}>
                        {formatPrice(rel.price)}{" "}
                        {currencyLabel(rel.currency ?? shop.currency ?? "XAF")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      {!isOutOfStock && (showOnlineEscrow || showCashOnDelivery) && (
        <div className={styles.stickyCtaBar}>
          <div className={styles.stickyCtaInner}>
            <div className={styles.stickyCtaInfo}>
              <span className={styles.stickyCtaName}>{product.name}</span>
              <span
                className={styles.stickyCtaPrice}
                style={{ color: primaryColor }}
              >
                {formatPrice(effectivePrice)} {currency}
              </span>
            </div>
            <button
              type="button"
              className={styles.stickyCtaBtn}
              style={{
                backgroundColor: primaryColor,
                borderColor: primaryColor,
              }}
              onClick={handleBuyNow}
            >
              Acheter maintenant
            </button>
          </div>
        </div>
      )}
    </>
  );
}
