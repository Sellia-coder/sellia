"use client";

import styles from "./ShopHero.module.css";
import ShopHeroPattern from "./ShopHeroPattern";
import type { ShopCategory } from "./ShopHeroPattern";

interface Props {
  shop: {
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    primaryColor: string | null;
    category?: string | null;
  };
}

function resolveShopCategory(category?: string | null): ShopCategory {
  if (!category) return "default";
  const c = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/\b(mode|fashion|vetement|robe|pret-a-porter|chaussure|sac|accessoire|bijou)\b/.test(c)) return "mode";
  if (/\b(beaut|cosmet|skincare|soin|maquill|parfum|coiff)\b/.test(c)) return "beaute";
  if (/\b(aliment|food|gastro|cafe|epicerie|restaurant|patisserie|boulang)\b/.test(c)) return "alimentation";
  if (/\b(tech|digital|saas|logiciel|electroniq|gadget|informatique)\b/.test(c)) return "tech";
  if (/\b(formation|cours|coaching|ebook|consult|service)\b/.test(c)) return "formation";
  if (/\b(artisan|handmade|craft|creation|deco)\b/.test(c)) return "artisanat";
  return "default";
}

function getPrimaryWithAlpha(color: string, alpha: number): string {
  let hex = color.startsWith("#") ? color.slice(1) : color;
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }
  if (hex.length !== 6) return color;
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return `#${hex}${alphaHex}`;
}

export default function ShopHero({ shop }: Props) {
  const primaryColor = shop.primaryColor ?? "#E84B1F";
  const category = resolveShopCategory(shop.category);

  return (
    <section
      className={styles.shopHero}
      style={{
        background: `
          radial-gradient(
            circle at 50% 40%,
            ${getPrimaryWithAlpha(primaryColor, 0.10)} 0%,
            ${getPrimaryWithAlpha(primaryColor, 0.05)} 25%,
            ${getPrimaryWithAlpha(primaryColor, 0.02)} 50%,
            rgba(250, 250, 247, 1) 80%
          ),
          linear-gradient(180deg, #FAFAF7 0%, #F7F4ED 100%)
        `,
      }}
    >
      <ShopHeroPattern category={category} />

      <div className={styles.shopHeroInner}>
        <div className={styles.shopHeroDecor} aria-hidden="true">
          <span className={styles.shopHeroDecorLine} />
          <span className={styles.shopHeroDecorDot} />
          <span className={styles.shopHeroDecorLine} />
        </div>

        <span className={styles.shopHeroEyebrow}>
          BIENVENUE CHEZ
        </span>

        <h1 className={styles.shopHeroName}>
          <em>{shop.name}</em>
        </h1>

        {shop.tagline && (
          <p className={styles.shopHeroTagline}>
            {shop.tagline}
          </p>
        )}

        {shop.description && (
          <p className={styles.shopHeroDescription}>
            {shop.description}
          </p>
        )}

        <a
          href={`/shop/${shop.slug}/produits`}
          className={styles.shopHeroCta}
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById("produits");
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
        >
          <span>Découvrir les produits</span>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M1 7H17M17 7L11 1M17 7L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
          </svg>
        </a>

        <div className={styles.shopHeroDecor} aria-hidden="true">
          <span className={styles.shopHeroDecorLine} />
          <span className={styles.shopHeroDecorDot} />
          <span className={styles.shopHeroDecorLine} />
        </div>
      </div>
    </section>
  );
}
