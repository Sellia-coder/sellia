"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product, Shop } from "@prisma/client";
import {
  MessageCircle,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Banknote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ProductCard from "./ProductCard";
import {
  buildProductGalleryImages,
  parseShippingZones,
} from "@/lib/shop-data";

interface Props {
  shop: Shop & { shippingZones: unknown };
  product: Product;
  related: Product[];
}

export default function ProductDetail({ shop, product, related }: Props) {
  const allImages = buildProductGalleryImages(
    product.imageUrl,
    product.galleryUrls,
    5
  );
  const [activeImage, setActiveImage] = useState(0);

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

  const waNumber = shop.whatsappNumber?.replace(/[^0-9]/g, "") ?? "";
  const waMessage = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par : ${product.name} (${product.price.toLocaleString("fr-FR")} FCFA).`
  );
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null;

  const zones = parseShippingZones(shop.shippingZones);
  const showShippingBlock =
    product.type === "physical" &&
    zones.length > 0;

  const categoryLabel = product.category ?? product.customCategory;

  return (
    <article className="shop-product-detail">
      <div className="shop-container shop-product-detail-inner">
        <div className="shop-product-gallery">
          <div className="shop-product-gallery-main">
            {allImages.length > 0 ? (
              <img
                src={allImages[activeImage]}
                alt={product.name}
                key={allImages[activeImage]}
              />
            ) : (
              <span className="shop-product-gallery-emoji">
                {product.emoji ?? "🛍️"}
              </span>
            )}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="shop-product-gallery-arrow shop-product-gallery-arrow-prev"
                  onClick={() =>
                    setActiveImage(
                      (prev) =>
                        (prev - 1 + allImages.length) % allImages.length
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
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="shop-product-info">
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

          <div className="shop-product-actions">
            {showOnlineEscrow && (
              <Link
                href={`${orderPath}?method=online_escrow`}
                className="shop-btn shop-btn-primary"
              >
                <ShoppingCart size={16} strokeWidth={2} />
                Acheter en ligne
              </Link>
            )}
            {showCashOnDelivery && (
              <Link
                href={`${orderPath}?method=cash_on_delivery`}
                className="shop-btn shop-btn-secondary"
              >
                <Banknote size={16} strokeWidth={2} />
                Paiement à la livraison
              </Link>
            )}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="shop-btn shop-btn-whatsapp"
              >
                <MessageCircle size={16} strokeWidth={2} />
                WhatsApp
              </a>
            )}
          </div>

          {product.description && (
            <div className="shop-product-description">
              <h2 className="shop-product-section-title">Description</h2>
              <div
                className="shop-product-description-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {showShippingBlock && (
            <div className="shop-product-shipping">
              <h2 className="shop-product-section-title">
                <Truck size={14} strokeWidth={2} /> Livraison
              </h2>
              <ul className="shop-product-shipping-list">
                {zones.slice(0, 5).map((z) => (
                  <li key={z.id}>
                    <span>{z.name}</span>
                    <span>
                      {z.price.toLocaleString("fr-FR")} FCFA
                      {z.eta && (
                        <span className="shop-eta">· {z.eta}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showOnlineEscrow && (
            <div className="shop-product-trust">
              <ShieldCheck size={14} strokeWidth={2} />
              <span>
                Paiement sécurisé par Sellia · Remboursement automatique si non
                livré sous 6 jours
              </span>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="shop-related">
          <div className="shop-container">
            <h2 className="shop-related-title">Autres produits</h2>
            <div className="shop-products-grid">
              {related.map((p) => (
                <ProductCard key={p.id} shopSlug={shop.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
