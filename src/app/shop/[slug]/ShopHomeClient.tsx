"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Star } from "lucide-react";
import styles from "./shop-home.module.css";
import TrustSection from "@/components/shop/TrustSection";
import BuyerProtectionModal from "@/components/shop/BuyerProtectionModal";
import ShopHomeProductCard, {
  ShopHomeProductsGrid,
  type ShopHomeProductCardData,
} from "@/components/shop/ShopHomeProductCard";
import { getHeroBackground } from "@/components/shop/HeroTemplate";
import { MomoLogosBar } from "@/components/icons/momo-operators";

export interface ShopHomeCategory {
  name: string;
  emoji: string;
  count: number;
}

export type ShopHomeProduct = ShopHomeProductCardData & { emoji: string };

export interface ShopHomeTestimonial {
  name: string;
  comment: string;
  rating: number;
  productName?: string;
}

interface Props {
  shopSlug: string;
  shopName: string;
  shopTagline: string;
  shopDescription: string;
  shopLogoUrl: string | null;
  shopHeroImageUrl: string | null;
  shopHeroTemplate: string | null;
  shopPrimaryColor: string;
  shopSecondaryColor: string;
  shopWhatsapp: string | null;
  shopCurrency: string;
  categories: ShopHomeCategory[];
  products: ShopHomeProduct[];
  testimonials: ShopHomeTestimonial[];
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function ShopHomeClient(props: Props) {
  const [protectionOpen, setProtectionOpen] = useState(false);
  const primary = props.shopPrimaryColor || "#E84B1F";
  const showCategories = props.categories.length >= 3;
  const showTestimonials = props.testimonials.length >= 2;

  const descriptionPlain = stripHtml(props.shopDescription);
  const heroDescription =
    descriptionPlain.length > 180
      ? `${descriptionPlain.slice(0, 177)}...`
      : descriptionPlain ||
        "Une expérience d'achat premium, des produits soigneusement sélectionnés, livrés rapidement chez vous.";

  const heroStyle: CSSProperties = {
    background: getHeroBackground({
      template: props.shopHeroTemplate,
      customImageUrl: props.shopHeroImageUrl,
      primaryColor: primary,
    }),
  };

  return (
    <div
      className={styles.wrap}
      style={
        {
          "--shop-primary": primary,
          "--shop-secondary": props.shopSecondaryColor,
        } as CSSProperties
      }
    >
      <section className={styles.hero} style={heroStyle}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Boutique officielle</p>
          <h1 className={styles.heroTitle}>{props.shopName}</h1>
          <p className={styles.heroTagline}>
            {props.shopTagline || "Découvrez notre sélection unique."}
          </p>
          <p className={styles.heroDescription}>{heroDescription}</p>
          <div className={styles.heroCtas}>
            <Link
              href={`/shop/${props.shopSlug}/recherche`}
              className={styles.heroCtaPrimary}
            >
              Découvrir la collection
              <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              className={styles.heroCtaSecondary}
              onClick={() => setProtectionOpen(true)}
            >
              <ShieldCheck size={14} />
              Acheter en confiance
            </button>
          </div>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeText}>Paiements acceptés</span>
            <MomoLogosBar size={28} gap={6} />
          </div>
        </div>
      </section>

      {showCategories && (
        <section className={styles.categoriesSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Nos univers</span>
            <h2 className={styles.sectionTitle}>
              Explorez nos catégories phares
            </h2>
          </div>
          <div className={styles.categoriesGrid}>
            {props.categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/shop/${props.shopSlug}/recherche?cat=${encodeURIComponent(cat.name)}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryEmoji}>{cat.emoji}</div>
                <div className={styles.categoryName}>{cat.name}</div>
                <div className={styles.categoryCount}>
                  {cat.count} produit{cat.count > 1 ? "s" : ""}
                </div>
                <div className={styles.categoryDiscover}>
                  Découvrir <ArrowRight size={11} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.productsSection}>
        <div className={styles.productsSectionHeader}>
          <div>
            <span className={styles.eyebrow}>Sélection du moment</span>
            <h2 className={styles.sectionTitle}>
              Les produits les plus recherchés
            </h2>
          </div>
          <Link
            href={`/shop/${props.shopSlug}/recherche`}
            className={styles.viewAllLink}
            style={{ color: primary }}
          >
            Voir tous les produits <ArrowRight size={12} />
          </Link>
        </div>
        <ShopHomeProductsGrid>
          {props.products.slice(0, 8).map((product) => (
            <ShopHomeProductCard
              key={product.id}
              shopSlug={props.shopSlug}
              currency={props.shopCurrency}
              primaryColor={primary}
              product={product}
            />
          ))}
        </ShopHomeProductsGrid>
      </section>

      <TrustSection />

      {showTestimonials && (
        <section className={styles.testimonialsSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Avis clients</span>
            <h2 className={styles.sectionTitle}>Ils nous font confiance</h2>
          </div>
          <div className={styles.testimonialsGrid}>
            {props.testimonials.slice(0, 3).map((t, idx) => (
              <div key={idx} className={styles.testimonialCard}>
                <div className={styles.testimonialName}>{t.name}</div>
                <div className={styles.testimonialRating}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={12} fill="#F5A623" color="#F5A623" />
                  ))}
                </div>
                <p className={styles.testimonialText}>{t.comment}</p>
                {t.productName && (
                  <div className={styles.testimonialProduct}>
                    {t.productName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <BuyerProtectionModal
        open={protectionOpen}
        onClose={() => setProtectionOpen(false)}
      />
    </div>
  );
}
