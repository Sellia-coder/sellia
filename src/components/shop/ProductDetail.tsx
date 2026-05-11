"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Store,
  Check,
} from "lucide-react";
import type { ShopWithProducts } from "@/lib/shop-data";
import { currencyDisplay, mapShopProductToCard } from "@/lib/shopProductCard";
import ProductCard from "./ProductCard";
import Breadcrumbs from "./Breadcrumbs";
import StockIndicator from "./StockIndicator";
import UrgencyTimer from "./UrgencyTimer";
import TrustBadges from "./TrustBadges";
import PaymentLogos from "./PaymentLogos";
import { buildProductGalleryImages, parseShippingZones } from "@/lib/shop-data";
import { addToCart } from "@/lib/cart";
import { useCartContext } from "./CartProvider";
import QuantityPicker from "./QuantityPicker";
import FavoriteButton from "./FavoriteButton";
import ProductReviews from "./ProductReviews";

interface Props {
  shop: Record<string, unknown> & {
    id: string;
    slug: string;
    name: string;
    shippingZones: unknown;
    paymentCashOnDelivery: boolean;
    paymentOnlineEscrow: boolean;
  };
  product: Record<string, unknown> & {
    id: string;
    slug: string | null;
    name: string;
    price: number;
    comparePrice: number | null;
    imageUrl: string | null;
    emoji: string | null;
    description: string | null;
    shortDescription: string | null;
    category: string | null;
    customCategory: string | null;
    type: string;
    galleryUrls: unknown;
    stock: number | null;
    promoEndsAt: Date | string | null;
    unlimitedStock?: boolean;
  };
  related: Array<Record<string, unknown> & { id: string; slug: string | null }>;
}

export default function ProductDetail({ shop, product, related }: Props) {
  const router = useRouter();
  const { refresh: refreshCart } = useCartContext();
  const [quantity, setQuantity] = useState(1);
  const [addedFlash, setAddedFlash] = useState(false);

  const allImages = buildProductGalleryImages(
    product.imageUrl,
    product.galleryUrls,
    5
  );
  const [activeImage, setActiveImage] = useState(0);
  const [viewerCount, setViewerCount] = useState(1);

  useEffect(() => {
    const seed = product.id?.charCodeAt(0) ?? 1;
    const hour = new Date().getHours();
    const base = ((seed * 7 + hour * 3) % 8) + 2;
    setViewerCount(base);

    const interval = setInterval(() => {
      setViewerCount((c) => {
        const drift = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.max(2, Math.min(12, c + drift));
      });
    }, 8000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [product.id]);

  const hasPromo =
    product.comparePrice != null && product.comparePrice > product.price;
  const promoPercent = hasPromo
    ? Math.round(
        ((product.comparePrice! - product.price) / product.comparePrice!) * 100
      )
    : 0;

  const showCashOnDelivery = shop.paymentCashOnDelivery;
  const showOnlineEscrow = shop.paymentOnlineEscrow;
  const segment = product.slug ?? product.id;
  const orderPath = `/shop/${shop.slug}/commander/${segment}`;
  const cardCurrency = currencyDisplay(
    String((shop as { currency?: string }).currency ?? "XAF")
  );
  const shopPrimary = (shop as { primaryColor?: string | null }).primaryColor;

  const zones = parseShippingZones(shop.shippingZones);
  const firstZone = zones[0];
  const isPhysical = product.type === "physical";
  const isOutOfStock = product.stock != null && product.stock <= 0;

  const categoryLabel = product.category ?? product.customCategory;
  const showStockCounter = product.stock != null;

  const promoEnd =
    product.promoEndsAt instanceof Date
      ? product.promoEndsAt
      : product.promoEndsAt
        ? new Date(product.promoEndsAt as string)
        : null;

  const cartLinePayload = () => ({
    productId: product.id,
    productSlug: product.slug ?? product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl ?? null,
    emoji: product.emoji ?? null,
    productType: product.type,
  });

  const handleAddToCart = () => {
    addToCart(shop.slug, cartLinePayload(), quantity);
    refreshCart();
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1800);
  };

  const handleBuyNowOnline = () => {
    addToCart(shop.slug, cartLinePayload(), quantity);
    refreshCart();
    router.push(`/shop/${shop.slug}/panier?method=online_escrow`);
  };

  const handleBuyNowCash = () => {
    addToCart(shop.slug, cartLinePayload(), quantity);
    refreshCart();
    router.push(`/shop/${shop.slug}/panier?method=cash_on_delivery`);
  };

  return (
    <article className="shop-product-detail">
      <div className="shop-container">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: `/shop/${shop.slug}` },
            ...(categoryLabel
              ? [{ label: categoryLabel, href: `/shop/${shop.slug}` }]
              : []),
            { label: product.name },
          ]}
        />
      </div>

      <div className="shop-container shop-product-detail-inner">
        <div className="shop-product-gallery">
          <div className="shop-product-gallery-main">
            <div className="shop-product-gallery-fav">
              <FavoriteButton
                shopSlug={shop.slug}
                productId={product.id}
                variant="detail"
              />
            </div>
            {allImages.length > 0 ? (
              <img
                src={allImages[activeImage]}
                alt={product.name}
                key={activeImage}
              />
            ) : (
              <span className="shop-product-gallery-emoji">
                {(product.emoji as string) ?? "🛍️"}
              </span>
            )}

            {hasPromo && (
              <span className="shop-product-gallery-badge">-{promoPercent}%</span>
            )}

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="shop-product-gallery-arrow shop-product-gallery-arrow-prev"
                  onClick={() =>
                    setActiveImage(
                      (prev) => (prev - 1 + allImages.length) % allImages.length
                    )
                  }
                  aria-label="Image précédente"
                >
                  <ChevronLeft size={20} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className="shop-product-gallery-arrow shop-product-gallery-arrow-next"
                  onClick={() =>
                    setActiveImage((prev) => (prev + 1) % allImages.length)
                  }
                  aria-label="Image suivante"
                >
                  <ChevronRight size={20} strokeWidth={2} />
                </button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="shop-product-gallery-thumbs">
              {allImages.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  className={`shop-product-gallery-thumb ${
                    i === activeImage ? "is-active" : ""
                  }`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="shop-product-info">
          <Link href={`/shop/${shop.slug}/a-propos`} className="shop-product-vendor">
            <Store size={12} strokeWidth={2} />
            <span>
              Vendu par <strong>{shop.name}</strong>
            </span>
          </Link>

          {categoryLabel && (
            <div className="shop-product-category">{categoryLabel}</div>
          )}
          <h1 className="shop-product-name">{product.name}</h1>

          {product.shortDescription && (
            <p className="shop-product-short-desc">{product.shortDescription}</p>
          )}

          <div className="shop-product-pricing">
            <span className="shop-product-price">
              {product.price.toLocaleString("fr-FR")} FCFA
            </span>
            {hasPromo && (
              <>
                <span className="shop-product-compare">
                  {product.comparePrice!.toLocaleString("fr-FR")} FCFA
                </span>
                <span className="shop-product-promo-badge">-{promoPercent}%</span>
              </>
            )}
          </div>

          <div className="shop-product-meta-row">
            {showStockCounter ? (
              <StockIndicator stock={product.stock} />
            ) : null}
            <div className="shop-product-viewers">
              <Eye size={12} strokeWidth={2} />
              <span>
                <strong>{viewerCount}</strong> personnes consultent ce produit
              </span>
            </div>
          </div>

          {hasPromo && promoEnd && !isNaN(promoEnd.getTime()) && (
            <UrgencyTimer promoEndsAt={promoEnd} />
          )}

          <div className="shop-product-qty-row">
            <span className="shop-product-qty-label">Quantité</span>
            <QuantityPicker
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={99}
              disabled={isOutOfStock}
            />
          </div>

          <div className="shop-product-actions">
            {!isOutOfStock && (
              <button
                type="button"
                className="shop-btn shop-btn-add-cart shop-btn-lg shop-btn-full"
                onClick={handleAddToCart}
              >
                {addedFlash ? (
                  <>
                    <Check size={16} strokeWidth={2.5} />
                    Ajouté au panier
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} strokeWidth={2} />
                    Ajouter au panier (
                    {(product.price * quantity).toLocaleString("fr-FR")} FCFA)
                  </>
                )}
              </button>
            )}

            {!isOutOfStock && showOnlineEscrow && (
              <button
                type="button"
                onClick={handleBuyNowOnline}
                className="shop-btn shop-btn-primary shop-btn-lg shop-btn-full"
              >
                <ShoppingCart size={16} strokeWidth={2} />
                Acheter maintenant
              </button>
            )}
            {!isOutOfStock &&
              showCashOnDelivery &&
              !showOnlineEscrow && (
                <button
                  type="button"
                  onClick={handleBuyNowCash}
                  className="shop-btn shop-btn-secondary shop-btn-lg shop-btn-full"
                >
                  <Banknote size={16} strokeWidth={2} />
                  Paiement à la livraison
                </button>
              )}

            {isOutOfStock && (
              <button
                type="button"
                className="shop-btn shop-btn-secondary shop-btn-lg shop-btn-full"
                disabled
              >
                Produit en rupture
              </button>
            )}
          </div>

          {(showOnlineEscrow || showCashOnDelivery) && (
            <div className="shop-product-payment-info">
              <PaymentLogos showCashOnDelivery={showCashOnDelivery} />
              <p className="shop-product-payment-note">
                <ShieldCheck size={11} strokeWidth={2} />
                Paiement sécurisé · Tes données sont protégées
              </p>
            </div>
          )}

          <TrustBadges
            shippingEta={isPhysical ? (firstZone?.eta ?? null) : null}
            hasEscrow={showOnlineEscrow}
          />

          {product.description && (
            <div className="shop-product-description">
              <h2 className="shop-product-section-title">Description</h2>
              <div
                className="shop-product-description-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {zones.length > 0 && isPhysical && (
            <div className="shop-product-shipping">
              <h2 className="shop-product-section-title">Livraison</h2>
              <ul className="shop-product-shipping-list">
                {zones.slice(0, 5).map((z) => (
                  <li key={z.id}>
                    <span>{z.name}</span>
                    <span>
                      {z.price.toLocaleString("fr-FR")} FCFA
                      {z.eta && <span className="shop-eta">· {z.eta}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ProductReviews shopId={shop.id} productId={product.id} />
        </div>
      </div>

      {!isOutOfStock && (showOnlineEscrow || showCashOnDelivery) && (
        <div className="shop-sticky-cta">
          <div className="shop-sticky-cta-info">
            <div className="shop-sticky-cta-name">{product.name}</div>
            <div className="shop-sticky-cta-price">
              {product.price.toLocaleString("fr-FR")} FCFA
            </div>
          </div>
          <Link
            href={`${orderPath}${
              showOnlineEscrow ? "?method=online_escrow" : "?method=cash_on_delivery"
            }`}
            className="shop-btn shop-btn-primary"
          >
            <ShoppingCart size={14} strokeWidth={2} />
            Acheter
          </Link>
        </div>
      )}

      {related.length > 0 && (
        <section className="shop-related">
          <div className="shop-container">
            <h2 className="shop-related-title">Tu pourrais aussi aimer</h2>
            <div className="shop-products-grid">
              {related.map((p) => (
                <ProductCard
                  key={String(p.id)}
                  shopSlug={shop.slug}
                  product={mapShopProductToCard(
                    p as ShopWithProducts["products"][number],
                    cardCurrency
                  )}
                  primaryColor={shopPrimary ?? undefined}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
