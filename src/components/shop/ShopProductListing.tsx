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

const PRODUCTS_PER_PAGE = 12;

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
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Tous les produits") return products;
    return products.filter(
      (p) => categoryLabel(p) === activeCategory
    );
  }, [products, activeCategory]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const showPagination = filteredProducts.length > PRODUCTS_PER_PAGE;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const grid = document.getElementById("produits");
    if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
          onChange={handleCategoryChange}
        />

        <div className="shop-products-header">
          <h2 className="shop-products-title">Notre sélection</h2>
          <span className="shop-products-count">
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="shop-products-grid">
          {paginatedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={mapShopProductToCard(p, currency)}
              shopSlug={shop.slug}
              primaryColor={shop.primaryColor ?? undefined}
            />
          ))}
        </div>

        {showPagination && (
          <nav className="shop-pagination" aria-label="Navigation produits">
            <button
              type="button"
              className="shop-pagination-btn"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-label="Page précédente"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Précédent</span>
            </button>

            <div className="shop-pagination-pages">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;

                if (!showPage) {
                  const isEllipsis =
                    (page === 2 && currentPage > 3) ||
                    (page === totalPages - 1 && currentPage < totalPages - 2);
                  if (isEllipsis) {
                    return (
                      <span key={`e-${page}`} className="shop-pagination-ellipsis">
                        …
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    type="button"
                    className={`shop-pagination-page ${page === currentPage ? "is-active" : ""}`}
                    onClick={() => handlePageChange(page)}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="shop-pagination-btn"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              aria-label="Page suivante"
            >
              <span>Suivant</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </nav>
        )}

        {showPagination && (
          <div className="shop-pagination-info">
            Affichage de {(currentPage - 1) * PRODUCTS_PER_PAGE + 1} à{" "}
            {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} sur{" "}
            {filteredProducts.length} produits
          </div>
        )}
      </div>
    </section>
  );
}
