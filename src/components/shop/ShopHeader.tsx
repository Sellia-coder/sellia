"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search, Heart, ShoppingBag } from "lucide-react";

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
  const initial = (shop.name?.[0] ?? "S").toUpperCase();
  const homePath = `/shop/${shop.slug}`;

  return (
    <header className="shop-header">
      <div className="shop-container shop-header-inner">
        <Link href={homePath} className="shop-header-brand">
          <div
            className="shop-header-logo"
            style={{
              background: shop.logoUrl ? "transparent" : "var(--shop-primary)",
            }}
          >
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
          >
            <Search size={18} strokeWidth={1.8} />
          </button>
          <button type="button" className="shop-header-icon-btn" aria-label="Favoris">
            <Heart size={18} strokeWidth={1.8} />
          </button>
          <button type="button" className="shop-header-icon-btn" aria-label="Panier">
            <ShoppingBag size={18} strokeWidth={1.8} />
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
          <Link href={`${homePath}#produits`} onClick={() => setMobileOpen(false)}>
            Produits
          </Link>
          <Link href={`${homePath}/a-propos`} onClick={() => setMobileOpen(false)}>
            À propos
          </Link>
          <Link href={`${homePath}/contact`} onClick={() => setMobileOpen(false)}>
            Contact
          </Link>
        </nav>
      )}
    </header>
  );
}
