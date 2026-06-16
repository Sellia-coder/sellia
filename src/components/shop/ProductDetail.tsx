"use client";

import { useState, useEffect, useMemo, useTransition, useRef } from "react";
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
  ShoppingBag,
} from "lucide-react";
import { Flag, X } from "@phosphor-icons/react";
import { createReportAction } from "@/app/actions/report";
import { addToCart } from "@/lib/cart";
import { usePixelTracking } from "@/lib/use-pixel-tracking";
import { useCartContext } from "./CartProvider";
import { buildProductGalleryImages } from "@/lib/shop-data";
import { computeProductRating, computeStarDistribution, getRatingAriaLabel } from "@/lib/utils/product-rating";
import ProductReviews from "./ProductReviews";
import PromoCountdown from "./PromoCountdown";
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

const REPORT_REASONS = [
  { value: "COUNTERFEIT", label: "Contrefaçon" },
  { value: "INAPPROPRIATE", label: "Contenu inapproprié" },
  { value: "MISLEADING", label: "Description trompeuse" },
  { value: "SCAM", label: "Arnaque / fraude" },
  { value: "PROHIBITED", label: "Produit interdit" },
  { value: "OTHER", label: "Autre" },
];

interface ReviewVM {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
  merchantReply?: string | null;
  merchantRepliedAt?: string | Date | null;
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
    promoEndsAt?: string | Date | null;
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
    merchantReply?: string | null;
    merchantRepliedAt?: Date | null;
  }>;
  salesCount?: number;
  shippingEta?: string | null;
}

export default function ProductDetail({
  shop,
  product,
  related,
  reviews: reviewsProp,
  salesCount = 0,
  shippingEta = null,
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
  const [showReviewForm, setShowReviewForm] = useState(false);
  const reviewsSectionRef = useRef<HTMLElement>(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isReporting, startReport] = useTransition();

  const closeReport = () => {
    setReportOpen(false);
    setReportError(null);
    setReportSuccess(false);
    setReportReason("");
    setReportDescription("");
    setReporterName("");
    setReporterEmail("");
  };

  const handleSubmitReport = () => {
    setReportError(null);
    if (!reportReason) {
      setReportError("Veuillez sélectionner un motif");
      return;
    }
    if (reportDescription.trim().length < 10) {
      setReportError("Veuillez détailler votre signalement (10 caractères min)");
      return;
    }
    startReport(async () => {
      const res = await createReportAction({
        productId: product.id,
        reason: reportReason,
        description: reportDescription,
        reporterName: reporterName || undefined,
        reporterEmail: reporterEmail || undefined,
      });
      if (res.ok) {
        setReportSuccess(true);
      } else {
        setReportError(res.error || "Une erreur est survenue");
      }
    });
  };

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
    merchantReply: r.merchantReply,
    merchantRepliedAt: r.merchantRepliedAt,
  }));

  const productRating = computeProductRating(reviews);
  const starDistribution = computeStarDistribution(reviews);

  const unlimited = product.unlimitedStock ?? true;
  const rawStock = hasVariants ? effectiveStock : (product.stock ?? 0);
  const maxQty = (unlimited && !hasVariants) ? 99 : Math.min(99, Math.max(1, rawStock));
  const isOutOfStock = hasVariants
    ? effectiveStock <= 0
    : (!unlimited && product.stock !== null && product.stock <= 0);

  const ratingValue = productRating?.value ?? 0;
  const reviewsCountDisplay = productRating?.count ?? 0;
  const ratingFormatted = productRating?.formatted ?? null;
  const ratingAria = productRating
    ? getRatingAriaLabel(productRating)
    : "Aucun avis pour ce produit";

  const scrollToReviews = (openForm = false) => {
    setActiveTab("reviews");
    if (openForm) setShowReviewForm(true);
    requestAnimationFrame(() => {
      reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const isPhysical = (product.type ?? "physical") === "physical";
  const lowStock =
    !unlimited &&
    !hasVariants &&
    product.stock != null &&
    product.stock > 0 &&
    product.stock <= 5;

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
                {productRating ? (
                  <button
                    type="button"
                    className={styles.ratingLink}
                    onClick={() => scrollToReviews()}
                    aria-label={ratingAria}
                  >
                    <div className="shop-product-detail-rating">
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
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.ratingLinkMuted}
                    onClick={() => scrollToReviews(true)}
                  >
                    Soyez le premier à laisser un avis
                  </button>
                )}
                <div className={styles.securePay}>
                  <ShieldCheck size={13} strokeWidth={2.4} />
                  <span>Paiement sécurisé</span>
                </div>
              </div>

              <div className={styles.reassuranceBanner}>
                <ShieldCheck size={16} strokeWidth={2.2} style={{ color: primaryColor, flexShrink: 0 }} />
                <span>
                  Commande et paiement 100% sur le site — sécurisé et couvert par Sellia.
                </span>
              </div>

              {salesCount > 0 && (
                <p className={styles.socialProof}>
                  <ShoppingBag size={14} strokeWidth={2.2} />
                  {salesCount} vente{salesCount > 1 ? "s" : ""} confirmée{salesCount > 1 ? "s" : ""}
                </p>
              )}

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

              {product.promoEndsAt && (
                <PromoCountdown
                  endsAt={product.promoEndsAt}
                  primaryColor={primaryColor}
                />
              )}

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
                      {isOutOfStock
                        ? "(Rupture de stock)"
                        : lowStock
                          ? `(Plus que ${rawStock} en stock)`
                          : unlimited && !hasVariants
                            ? "(En stock)"
                            : `(${rawStock} disponible${rawStock !== 1 ? "s" : ""})`}
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
                    <span className={styles.trustTitle}>Livraison</span>
                    <span className={styles.trustDesc}>
                      {isPhysical
                        ? shippingEta
                          ? `Délai indicatif : ${shippingEta}`
                          : "Selon votre zone de livraison"
                        : "Produit numérique — accès immédiat"}
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

              <button
                type="button"
                onClick={() => setReportOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                  fontSize: "12.5px",
                  padding: "8px 0",
                }}
              >
                <Flag size={14} weight="regular" /> Signaler ce produit
              </button>
              <button
                type="button"
                className={styles.leaveReviewCta}
                style={{ borderColor: primaryColor, color: primaryColor }}
                onClick={() => scrollToReviews(true)}
              >
                <MessageCircle size={16} strokeWidth={2.2} />
                Laisser un avis
              </button>
            </div>
          </div>

          <section ref={reviewsSectionRef} className={styles.tabsSection}>
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
                  {productRating && starDistribution.length > 0 && (
                    <div className={styles.reviewsSummary}>
                      <div className={styles.reviewsSummaryScore}>
                        <span className={styles.reviewsSummaryValue}>
                          {ratingFormatted}
                        </span>
                        <div className={styles.reviewStarsLarge}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={16}
                              strokeWidth={0}
                              fill={
                                i <= Math.round(ratingValue) ? "#FFB800" : "#E5E2DA"
                              }
                            />
                          ))}
                        </div>
                        <span className={styles.reviewsSummaryCount}>
                          {reviewsCountDisplay} avis vérifiés
                        </span>
                      </div>
                      <div className={styles.starDistribution}>
                        {starDistribution.map((d) => (
                          <div key={d.star} className={styles.starDistRow}>
                            <span>{d.star}★</span>
                            <div className={styles.starDistBar}>
                              <div
                                className={styles.starDistFill}
                                style={{
                                  width: `${d.pct}%`,
                                  background: primaryColor,
                                }}
                              />
                            </div>
                            <span>{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.reviewsSectionHead}>
                    <h3 className={styles.reviewsSectionTitle}>
                      Avis clients
                    </h3>
                    <button
                      type="button"
                      className={styles.leaveReviewCtaPrimary}
                      style={{ background: primaryColor }}
                      onClick={() => setShowReviewForm(true)}
                    >
                      <MessageCircle size={16} strokeWidth={2.2} />
                      Laisser un avis
                    </button>
                  </div>

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
                            <div className={styles.reviewStars} aria-label={`${review.rating} sur 5`}>
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  strokeWidth={0}
                                  fill={
                                    i <= review.rating ? "#FFB800" : "#E5E2DA"
                                  }
                                />
                              ))}
                              <span className={styles.reviewRatingLabel}>
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                          <p className={styles.reviewComment}>
                            {review.comment}
                          </p>
                          {review.merchantReply ? (
                            <div className={styles.merchantReply}>
                              <strong>Réponse du vendeur</strong>
                              <p>{review.merchantReply}</p>
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                  <div className={styles.reviewSubmitWrap}>
                    <ProductReviews
                      shopId={shop.id}
                      productId={product.id}
                      embedded
                      hideTrigger
                      forceOpen={showReviewForm}
                      onFormClose={() => setShowReviewForm(false)}
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

      {reportOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeReport}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(14,17,22,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "460px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 12px 48px rgba(14,17,22,0.22)",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={closeReport}
              aria-label="Fermer"
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9CA3AF",
                padding: "4px",
                lineHeight: 0,
              }}
            >
              <X size={20} weight="bold" />
            </button>

            {reportSuccess ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "#DCFCE7",
                    color: "#16A34A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Check size={26} strokeWidth={3} />
                </div>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#0E1116",
                    margin: "0 0 8px",
                  }}
                >
                  Merci, votre signalement a été transmis
                </h3>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "#6B7280",
                    margin: "0 0 20px",
                    lineHeight: 1.5,
                  }}
                >
                  Notre équipe va examiner ce produit dans les plus brefs délais.
                </p>
                <button
                  type="button"
                  onClick={closeReport}
                  style={{
                    background: primaryColor,
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    padding: "11px 24px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "6px",
                  }}
                >
                  <Flag size={18} weight="fill" color={primaryColor} />
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#0E1116",
                      margin: 0,
                    }}
                  >
                    Signaler ce produit
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "12.5px",
                    color: "#6B7280",
                    margin: "0 0 18px",
                    lineHeight: 1.5,
                  }}
                >
                  Aidez-nous à garder la plateforme sûre. Décrivez le problème
                  rencontré avec ce produit.
                </p>

                <label
                  style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  Motif <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #E5E5E0",
                    fontSize: "14px",
                    color: "#0E1116",
                    marginBottom: "14px",
                    background: "#FFFFFF",
                  }}
                >
                  <option value="">Sélectionnez un motif…</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>

                <label
                  style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  Description <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                  placeholder="Décrivez le problème (10 caractères min)…"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #E5E5E0",
                    fontSize: "14px",
                    color: "#0E1116",
                    marginBottom: "14px",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Votre nom
                    </label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="Optionnel"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #E5E5E0",
                        fontSize: "14px",
                        color: "#0E1116",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Votre email
                    </label>
                    <input
                      type="email"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      placeholder="Optionnel"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #E5E5E0",
                        fontSize: "14px",
                        color: "#0E1116",
                      }}
                    />
                  </div>
                </div>

                {reportError && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#DC2626",
                      margin: "0 0 12px",
                    }}
                  >
                    {reportError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={isReporting}
                  style={{
                    width: "100%",
                    background: primaryColor,
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: isReporting ? "wait" : "pointer",
                    opacity: isReporting ? 0.7 : 1,
                  }}
                >
                  {isReporting ? "Envoi…" : "Envoyer le signalement"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
