"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Heart, ShoppingBag } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const { cartCount, favsCount } = useCartContext();

  const initial = (shop.name?.[0] ?? "S").toUpperCase();
  const homePath = `/shop/${shop.slug}`;
  const primaryColor = shop.primaryColor ?? "#E84B1F";

  return (
    <>
      <header className={styles.menuPro}>
        <div className={styles.menuProInner}>
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

          {/* SÉPARATEUR */}
          <div className={styles.separator} aria-hidden="true" />

          {/* CENTRE — Navigation desktop */}
          <nav className={styles.nav} aria-label="Navigation principale">
            <Link href={homePath} className={styles.navLink}>
              Accueil
            </Link>
            <Link href={`${homePath}#produits`} className={styles.navLink}>
              Produits
            </Link>
            <Link href={`${homePath}/a-propos`} className={styles.navLink}>
              À propos
            </Link>
            <Link href={`${homePath}/contact`} className={styles.navLink}>
              Contact
            </Link>
          </nav>

          {/* DROITE — Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={17} strokeWidth={2.2} />
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Favoris"
              onClick={() => router.push(`${homePath}/favoris`)}
            >
              <Heart size={17} strokeWidth={2.2} />
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
              <ShoppingBag size={17} strokeWidth={2.2} />
              {cartCount > 0 && (
                <span
                  className={styles.badge}
                  style={{ backgroundColor: primaryColor }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className={styles.mobileToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={20} strokeWidth={2.2} />
              ) : (
                <Menu size={20} strokeWidth={2.2} />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <nav className={styles.mobileMenu} aria-label="Menu mobile">
            <Link
              href={homePath}
              onClick={() => setMobileOpen(false)}
              className={styles.mobileLink}
            >
              Accueil
            </Link>
            <Link
              href={`${homePath}#produits`}
              onClick={() => setMobileOpen(false)}
              className={styles.mobileLink}
            >
              Produits
            </Link>
            <Link
              href={`${homePath}/a-propos`}
              onClick={() => setMobileOpen(false)}
              className={styles.mobileLink}
            >
              À propos
            </Link>
            <Link
              href={`${homePath}/contact`}
              onClick={() => setMobileOpen(false)}
              className={styles.mobileLink}
            >
              Contact
            </Link>
            <Link
              href={`${homePath}/favoris`}
              onClick={() => setMobileOpen(false)}
              className={styles.mobileLink}
            >
              Favoris {favsCount > 0 && `(${favsCount})`}
            </Link>
            <Link
              href={`${homePath}/panier`}
              onClick={() => setMobileOpen(false)}
              className={styles.mobileLink}
            >
              Panier {cartCount > 0 && `(${cartCount})`}
            </Link>
          </nav>
        )}
      </header>

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        shopSlug={shop.slug}
      />
    </>
  );
}
