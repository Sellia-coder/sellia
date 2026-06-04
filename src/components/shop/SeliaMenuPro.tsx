"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag } from "lucide-react";
import { useCartContext } from "./CartProvider";
import SearchOverlay from "./SearchOverlay";
import styles from "./SeliaMenuPro.module.css";

interface Props {
  shop: {
    slug: string;
    name: string;
    tagline: string | null;
    logoUrl: string | null;
    primaryColor: string | null;
  };
}

export default function SeliaMenuPro({ shop }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const { cartCount, favsCount } = useCartContext();

  const initial = (shop.name?.[0] ?? "S").toUpperCase();
  const homePath = `/shop/${shop.slug}`;
  const primaryColor = shop.primaryColor ?? "#E84B1F";

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* GAUCHE — Brand */}
          <Link
            href={homePath}
            className={styles.brand}
            aria-label={`Accueil de ${shop.name}`}
          >
            <div className={styles.logo} style={{ backgroundColor: primaryColor }}>
              {shop.logoUrl ? (
                <img src={shop.logoUrl} alt={shop.name} />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>{shop.name}</span>
              {shop.tagline && (
                <span className={styles.brandTagline}>{shop.tagline}</span>
              )}
            </div>
          </Link>

          {/* DROITE — Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} strokeWidth={2.2} />
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Favoris"
              onClick={() => router.push(`${homePath}/favoris`)}
            >
              <Heart size={18} strokeWidth={2.2} />
              {favsCount > 0 && (
                <span className={styles.badge}>{favsCount}</span>
              )}
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Panier"
              onClick={() => router.push(`${homePath}/panier`)}
            >
              <ShoppingBag size={18} strokeWidth={2.2} />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className={styles.badge}
                  style={{ backgroundColor: primaryColor }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        shopSlug={shop.slug}
      />
    </>
  );
}
