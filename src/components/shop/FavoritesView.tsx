"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { getFavorites } from "@/lib/cart";
import { currencyDisplay, mapShopProductToCard } from "@/lib/shopProductCard";
import ProductCard from "./ProductCard";
import type { ShopWithProducts } from "@/lib/shop-data";

interface Props {
  shop: ShopWithProducts;
}

export default function FavoritesView({ shop }: Props) {
  const [favIds, setFavIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavIds(getFavorites(shop.slug));

    const onFavs = (e: Event) => {
      const ce = e as CustomEvent<{ shopSlug?: string }>;
      if (ce.detail?.shopSlug === shop.slug) {
        setFavIds(getFavorites(shop.slug));
      }
    };
    window.addEventListener("sellia-favs-change", onFavs);
    return () => window.removeEventListener("sellia-favs-change", onFavs);
  }, [shop.slug]);

  if (!mounted) return null;

  const favProducts = shop.products.filter((p) => favIds.includes(p.id));
  const currency = currencyDisplay(shop.currency);

  return (
    <section className="shop-favorites">
      <div className="shop-container shop-favorites-inner">
        <Link href={`/shop/${shop.slug}`} className="shop-order-back">
          <ArrowLeft size={14} strokeWidth={2} />
          Continuer mes achats
        </Link>

        <h1 className="shop-cart-title">Mes favoris</h1>

        {favProducts.length === 0 ? (
          <div className="shop-cart-empty">
            <div className="shop-cart-empty-icon">
              <Heart size={48} strokeWidth={1.5} />
            </div>
            <h2>Pas encore de favoris</h2>
            <p>
              Clique sur le cœur des produits que tu aimes pour les retrouver
              ici.
            </p>
            <Link
              href={`/shop/${shop.slug}`}
              className="shop-btn shop-btn-primary shop-btn-lg"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <div className="shop-products-grid">
            {favProducts.map((p) => (
              <ProductCard
                key={p.id}
                shopSlug={shop.slug}
                product={mapShopProductToCard(p, currency)}
                primaryColor={shop.primaryColor ?? undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
