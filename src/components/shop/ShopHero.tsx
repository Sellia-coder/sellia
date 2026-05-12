"use client";

import styles from "./ShopHero.module.css";

interface Props {
  shop: {
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    primaryColor: string | null;
  };
}

export default function ShopHero({ shop }: Props) {
  return (
    <section className={styles.shopHero}>
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
