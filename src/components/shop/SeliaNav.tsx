"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Heart, ShoppingBag } from "lucide-react";
import { useCartContext } from "./CartProvider";
import SearchOverlay from "./SearchOverlay";
import styles from "./SeliaNav.module.css";

interface Props {
  shop: {
    slug: string;
    name: string;
    tagline: string | null;
    logoUrl: string | null;
    primaryColor: string | null;
  };
}

export default function SeliaNav({ shop }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const { cartCount, favsCount } = useCartContext();

  const initial = (shop.name?.[0] ?? "S").toUpperCase();
  const homePath = `/shop/${shop.slug}`;
  const primaryColor = shop.primaryColor ?? "#E84B1F";

  const navStyle = {
    ["--selia-nav-primary"]: primaryColor,
    ["--selia-nav-text"]: "#0E1116",
    ["--selia-nav-text-mute"]: "#6E7178",
    ["--selia-nav-bg"]: "#FFFFFF",
    ["--selia-nav-hover-bg"]: "#F2F0EA",
    ["--selia-nav-border"]: "#ECEAE3",
  } as CSSProperties;

  return (
    <>
      <header className={styles.seliaNav} style={navStyle}>
        <div className={styles.seliaNavInner}>
          <Link href={homePath} className={styles.seliaNavBrand}>
            <div className={styles.seliaNavLogo}>
              {shop.logoUrl ? (
                <img src={shop.logoUrl} alt={shop.name} />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className={styles.seliaNavText}>
              <span className={styles.seliaNavName}>{shop.name}</span>
              {shop.tagline && (
                <span className={styles.seliaNavTagline}>{shop.tagline}</span>
              )}
            </div>
          </Link>

          <nav
            className={styles.seliaNavLinks}
            aria-label="Navigation principale"
          >
            <Link href={homePath} className={styles.seliaNavLink}>
              Accueil
            </Link>
            <Link href={`${homePath}#produits`} className={styles.seliaNavLink}>
              Produits
            </Link>
            <Link
              href={`${homePath}/a-propos`}
              className={styles.seliaNavLink}
            >
              À propos
            </Link>
            <Link href={`${homePath}/contact`} className={styles.seliaNavLink}>
              Contact
            </Link>
          </nav>

          <div className={styles.seliaNavActions}>
            <button
              type="button"
              className={styles.seliaNavIconBtn}
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} strokeWidth={2} />
            </button>
            <button
              type="button"
              className={styles.seliaNavIconBtn}
              aria-label="Favoris"
              onClick={() => router.push(`${homePath}/favoris`)}
            >
              <Heart size={18} strokeWidth={2} />
              {favsCount > 0 && (
                <span className={styles.seliaNavBadge}>{favsCount}</span>
              )}
            </button>
            <button
              type="button"
              className={styles.seliaNavIconBtn}
              aria-label="Panier"
              onClick={() => router.push(`${homePath}/panier`)}
            >
              <ShoppingBag size={18} strokeWidth={2} />
              {cartCount > 0 && (
                <span className={styles.seliaNavBadge}>{cartCount}</span>
              )}
            </button>
            <button
              type="button"
              className={styles.seliaNavMobileToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={20} strokeWidth={2} />
              ) : (
                <Menu size={20} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className={styles.seliaNavMobile} aria-label="Menu mobile">
            <Link href={homePath} onClick={() => setMobileOpen(false)}>
              Accueil
            </Link>
            <Link
              href={`${homePath}#produits`}
              onClick={() => setMobileOpen(false)}
            >
              Produits
            </Link>
            <Link
              href={`${homePath}/a-propos`}
              onClick={() => setMobileOpen(false)}
            >
              À propos
            </Link>
            <Link
              href={`${homePath}/contact`}
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </Link>
            <Link
              href={`${homePath}/favoris`}
              onClick={() => setMobileOpen(false)}
            >
              Favoris {favsCount > 0 && `(${favsCount})`}
            </Link>
            <Link
              href={`${homePath}/panier`}
              onClick={() => setMobileOpen(false)}
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
