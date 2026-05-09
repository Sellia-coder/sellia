"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Heart, ShoppingBag } from "lucide-react";
import { useCartContext } from "./CartProvider";
import SearchOverlay from "./SearchOverlay";

interface Props {
  shop: {
    slug: string;
    name: string;
    tagline: string | null;
    logoUrl: string | null;
    primaryColor: string | null;
  };
}

export default function ShopHeader({ shop }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const { cartCount, favsCount } = useCartContext();

  const initial = (shop.name?.[0] ?? "S").toUpperCase();
  const homePath = `/shop/${shop.slug}`;

  return (
    <>
      <header className="shop-header">
        <div className="shop-container shop-header-inner">
          <Link href={homePath} className="shop-header-brand">
            <div className="shop-header-logo">
              {shop.logoUrl ? (
                <img src={shop.logoUrl} alt={shop.name} />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="shop-header-text">
              <span className="shop-header-name">{shop.name}</span>
              {shop.tagline && (
                <span className="shop-header-tagline">{shop.tagline}</span>
              )}
            </div>
          </Link>

          <nav className="shop-header-nav" aria-label="Navigation principale">
            <Link href={homePath} className="shop-header-nav-link">
              Accueil
            </Link>
            <Link href={`${homePath}#produits`} className="shop-header-nav-link">
              Produits
            </Link>
            <Link href={`${homePath}/a-propos`} className="shop-header-nav-link">
              À propos
            </Link>
            <Link href={`${homePath}/contact`} className="shop-header-nav-link">
              Contact
            </Link>
          </nav>

          <div className="shop-header-actions">
            <button
              type="button"
              className="shop-header-icon-btn"
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="shop-header-icon-btn"
              aria-label="Favoris"
              onClick={() => router.push(`${homePath}/favoris`)}
            >
              <Heart size={18} strokeWidth={2} />
              {favsCount > 0 && (
                <span className="shop-header-icon-badge">{favsCount}</span>
              )}
            </button>
            <button
              type="button"
              className="shop-header-icon-btn"
              aria-label="Panier"
              onClick={() => router.push(`${homePath}/panier`)}
            >
              <ShoppingBag size={18} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="shop-header-icon-badge">{cartCount}</span>
              )}
            </button>
            <button
              type="button"
              className="shop-header-mobile-toggle"
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
          <nav className="shop-header-mobile-nav" aria-label="Menu mobile">
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
