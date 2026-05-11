"use client";

import { useMemo, useState } from "react";
import type { ShopWithProducts } from "@/lib/shop-data";
import {
  categoryLabel,
  currencyDisplay,
  mapShopProductToCard,
} from "@/lib/shopProductCard";
import ProductCard from "./ProductCard";
import CategoryFilter from "./CategoryFilter";

interface Props {
  shop: ShopWithProducts;
}

export default function ShopProductListing({ shop }: Props) {
  const products = shop.products;
  const currency = currencyDisplay(shop.currency);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      const c = categoryLabel(p);
      if (c) set.add(c);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "fr"));
  }, [products]);

  const [activeCategory, setActiveCategory] = useState("Tous les produits");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Tous les produits") return products;
    return products.filter(
      (p) => categoryLabel(p) === activeCategory
    );
  }, [products, activeCategory]);

  if (products.length === 0) {
    return (
      <section className="shop-products-section" id="produits">
        <div className="shop-products-container">
          <div className="shop-products-empty">
            <p>Cette boutique n&apos;a pas encore de produits publiés.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="shop-products-section" id="produits">
      <div className="shop-products-container">
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        <div className="shop-products-header">
          <h2 className="shop-products-title">Notre sélection</h2>
          <span className="shop-products-count">
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="shop-products-grid">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={mapShopProductToCard(p, currency)}
              shopSlug={shop.slug}
              primaryColor={shop.primaryColor ?? undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
