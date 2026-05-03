"use client";

import Link from "next/link";
import { useState } from "react";
import { productsList } from "@/lib/mock-data";

export default function ProductsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "low_stock" | "out_of_stock" | "draft">("all");
  const [search, setSearch] = useState("");

  const filtered = productsList.filter(p => {
    if (filter === "all") return true;
    return p.status === filter;
  }).filter(p => {
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
  });

  const stats = {
    total: productsList.length,
    active: productsList.filter(p => p.status === "active").length,
    low: productsList.filter(p => p.status === "low_stock").length,
    draft: productsList.filter(p => p.status === "draft").length,
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { class: string; label: string }> = {
      active: { class: "success", label: "Actif" },
      low_stock: { class: "warning", label: "Stock faible" },
      out_of_stock: { class: "danger", label: "Rupture" },
      draft: { class: "neutral", label: "Brouillon" },
    };
    return map[status] || { class: "neutral", label: status };
  };

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Catalogue</div>
          <h1 className="dash-page-title">Produits</h1>
          <p className="dash-page-subtitle">Gérez votre catalogue, suivez les stocks et organisez vos collections.</p>
        </div>
        <div className="dash-page-actions">
          <button className="dash-btn dash-btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Importer CSV
          </button>
          <Link href="/dashboard/produits/nouveau" className="dash-btn dash-btn-ember">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Nouveau produit
          </Link>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Total produits</span></div>
          <div className="dash-stat-value">{stats.total}</div>
          <div className="dash-stat-trend dash-stat-trend-neutral">Tous statuts</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Actifs</span></div>
          <div className="dash-stat-value" style={{color:"var(--dash-success)"}}>{stats.active}</div>
          <div className="dash-stat-trend dash-stat-trend-up">Disponibles</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Stock faible</span></div>
          <div className="dash-stat-value" style={{color:"rgb(180, 83, 9)"}}>{stats.low}</div>
          <div className="dash-stat-trend" style={{background:"var(--dash-warning-bg)",color:"rgb(180, 83, 9)"}}>⚠ Action requise</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-header"><span className="dash-stat-label">Brouillons</span></div>
          <div className="dash-stat-value" style={{color:"var(--dash-text-tertiary)"}}>{stats.draft}</div>
          <div className="dash-stat-trend dash-stat-trend-neutral">Non publié</div>
        </div>
      </div>

      <div className="dash-table-container dash-animate-fade-up dash-animate-delay-2">
        <div className="dash-table-header">
          <div className="dash-table-filters">
            <button className={`dash-filter-pill ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Tous <span className="dash-filter-count">{stats.total}</span></button>
            <button className={`dash-filter-pill ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>Actifs <span className="dash-filter-count">{stats.active}</span></button>
            <button className={`dash-filter-pill ${filter === "low_stock" ? "active" : ""}`} onClick={() => setFilter("low_stock")}>Stock faible <span className="dash-filter-count">{stats.low}</span></button>
            <button className={`dash-filter-pill ${filter === "draft" ? "active" : ""}`} onClick={() => setFilter("draft")}>Brouillons <span className="dash-filter-count">{stats.draft}</span></button>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <div className="dash-table-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th style={{width:"40px"}}></th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th>Ventes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const badge = statusBadge(p.status);
                return (
                  <tr key={p.id}>
                    <td><input type="checkbox" /></td>
                    <td>
                      <div className="dash-cell-product">
                        <div className="dash-cell-product-img" style={{background: p.imageGradient}}></div>
                        <div>
                          <div className="dash-cell-product-name">{p.name}</div>
                          <div className="dash-cell-product-sku">SKU-{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="dash-cell-mono">{p.category}</span></td>
                    <td>{p.price > 0 ? <span className="dash-cell-price">{p.price.toLocaleString("fr-FR")} FCFA</span> : <span className="dash-cell-price" style={{color:"var(--dash-text-tertiary)"}}>—</span>}</td>
                    <td><span className="dash-cell-mono">{p.stock} unités</span></td>
                    <td><span className={`dash-badge dash-badge-${badge.class}`}><span className="dash-badge-dot"></span>{badge.label}</span></td>
                    <td><span className="dash-cell-mono" style={{color:"var(--dash-text-primary)",fontWeight:500}}>{p.sales}</span></td>
                    <td>
                      <div className="dash-row-actions">
                        <button className="dash-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
                        <button className="dash-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                        <button className="dash-icon-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="dash-pagination">
          <div className="dash-pagination-info">Affichage 1–{filtered.length} sur {stats.total} produits</div>
          <div className="dash-pagination-controls">
            <button className="dash-page-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
            <button className="dash-page-btn active">1</button>
            <button className="dash-page-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
        </div>
      </div>
    </>
  );
}
