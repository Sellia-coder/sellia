"use client";

import type { CSSProperties } from "react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface GeneratedProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  emoji?: string;
}

interface GeneratedShopData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  targetAudience: string;
  region: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  products: GeneratedProduct[];
  generatedAt: string;
}

interface GeneratedShop {
  id?: string;
  shopName: string;
  prompt?: string;
  data?: GeneratedShopData;
  generatedAt?: string;
}

/** Map free-text IA category → classe CSS template */
function resolveCategoryTemplate(category?: string): string {
  if (!category) return "default";
  const c = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/\b(mode|fashion|vetement|pret-a-porter)\b/.test(c)) return "mode";
  if (/\b(luxe|luxury)\b/.test(c)) return "luxe";
  if (/\b(beaut|cosmet|skincare|soin)\b/.test(c)) return "beaute";
  if (/\b(aliment|food|gastro|cafe|epicerie)\b/.test(c)) return "alimentation";
  if (/\b(tech|digital|saas|logiciel)\b/.test(c)) return "tech";
  if (/\b(artisan|handmade|craft|creation)\b/.test(c)) return "artisanat";
  return "default";
}

function ApercuContent() {
  const searchParams = useSearchParams();
  const draftShopId = searchParams.get("id");
  const fallbackDescription = searchParams.get("description");
  const fallbackName = searchParams.get("name");

  const [shop, setShop] = useState<GeneratedShop | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadShop = async () => {
      if (draftShopId) {
        try {
          const response = await fetch(`/api/shop/draft/${draftShopId}`);
          const result = await response.json();

          if (!response.ok || !result.success) {
            if (response.status === 410) {
              setFetchError("Cette boutique générée a expiré. Recommencez.");
            } else if (response.status === 404) {
              setFetchError("Boutique introuvable.");
            } else if (result.status === "pending") {
              setFetchError("Génération encore en cours. Recommencez.");
            } else if (result.status === "failed") {
              setFetchError("La génération a échoué. Recommencez.");
            } else {
              setFetchError(result.error || "Erreur de chargement.");
            }
            return;
          }

          const apiData = result.data;
          const gd = apiData.generatedData as GeneratedShopData | null | undefined;
          const shopFromApi: GeneratedShop = {
            id: apiData.id,
            shopName: apiData.shopName,
            prompt: apiData.prompt,
            data: gd ?? undefined,
            generatedAt: gd?.generatedAt,
          };

          setShop(shopFromApi);
        } catch (err) {
          console.error("[apercu] Fetch error:", err);
          setFetchError("Erreur réseau. Vérifiez votre connexion.");
        }
        return;
      }

      if (fallbackDescription && fallbackName) {
        const shopFromUrl: GeneratedShop = {
          shopName: fallbackName,
          prompt: fallbackDescription,
          data: undefined,
          generatedAt: new Date().toISOString(),
        };
        setShop(shopFromUrl);
        try {
          localStorage.setItem("sellia_generated_shop", JSON.stringify(shopFromUrl));
        } catch {
          // ignore
        }
        return;
      }

      try {
        const stored = localStorage.getItem("sellia_generated_shop");
        if (stored) {
          const parsed = JSON.parse(stored) as Record<string, unknown>;
          const shopFromStorage: GeneratedShop = {
            shopName: (parsed.name as string) || (parsed.shopName as string) || "Ma boutique",
            prompt: (parsed.prompt as string) || (parsed.description as string),
            data: undefined,
            generatedAt: parsed.generatedAt as string | undefined,
          };
          setShop(shopFromStorage);
          return;
        }
      } catch {
        // ignore
      }

      window.location.href = "/";
    };

    loadShop();
  }, [draftShopId, fallbackDescription, fallbackName]);

  if (fetchError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAF7",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "40px",
            maxWidth: "440px",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(14,17,22,0.08)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: "28px", marginBottom: "12px", color: "#0E1116" }}>
            Oups...
          </h1>
          <p style={{ fontSize: "14px", color: "#404552", marginBottom: "24px", lineHeight: 1.5 }}>
            {fetchError}
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              background: "#E84B1F",
              color: "#FFFFFF",
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Recommencer
          </a>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="apercu-pro-loading">
        <div className="apercu-pro-loading-spinner"></div>
        <p>Chargement de votre boutique...</p>
      </div>
    );
  }

  const headerShopStyle: CSSProperties | undefined = shop.data
    ? ({
        "--shop-primary": shop.data.primaryColor,
        "--shop-secondary": shop.data.secondaryColor,
        "--shop-accent": shop.data.accentColor,
      } as CSSProperties)
    : undefined;

  const templateClass = resolveCategoryTemplate(shop.data?.category);

  const heroDesc =
    shop.data?.description ||
    (shop.prompt && shop.prompt.length > 200 ? `${shop.prompt.slice(0, 200)}...` : shop.prompt) ||
    "Une boutique unique, soigneusement composée pour vous.";

  const madeInLabel =
    shop.data?.region === "CM"
      ? "Made in Cameroun"
      : shop.data?.region === "CI"
        ? "Made in Côte d'Ivoire"
        : shop.data?.region === "SN"
          ? "Made in Sénégal"
          : shop.data?.region === "RDC"
            ? "Made in RDC"
            : "Made in Africa";

  return (
    <div className="apercu-pro-page">
      {/* TOP BANNER — Sellia preview indicator */}
      <div className="apercu-pro-banner">
        <div className="apercu-pro-banner-inner">
          <span className="apercu-pro-banner-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Aperçu généré par Sellia · IA
          </span>
          <a
            href={shop?.id ? `/inscription?draftShopId=${shop.id}` : "/inscription"}
            className="apercu-pro-banner-cta"
          >
            Modifier et Publier →
          </a>
        </div>
      </div>

      {/* HEADER STICKY — Boutique simulée */}
      <header
        className={`apercu-pro-shop-header apercu-pro-template-${templateClass}`}
        style={headerShopStyle}
      >
        <div className="apercu-pro-shop-header-inner">
          <div className="apercu-pro-shop-brand">
            <div className="apercu-pro-shop-logo" aria-hidden="true">
              <span>{(shop?.data?.name || shop?.shopName || "S").charAt(0)}</span>
            </div>
            <div className="apercu-pro-shop-brand-text">
              <h1 className="apercu-pro-shop-name">
                {shop?.data?.name || shop?.shopName || "Ma boutique"}
              </h1>
              {shop?.data?.tagline && (
                <span className="apercu-pro-shop-mini-tagline">{shop.data.tagline}</span>
              )}
            </div>
          </div>

          <div className="apercu-pro-shop-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Rechercher un produit...</span>
          </div>

          <nav className="apercu-pro-shop-nav">
            <button type="button" className="apercu-pro-shop-nav-btn" aria-label="Favoris" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button type="button" className="apercu-pro-shop-nav-btn" aria-label="Panier" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="apercu-pro-shop-nav-badge">0</span>
            </button>
            <button type="button" className="apercu-pro-shop-nav-account" disabled>
              Compte
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="apercu-pro-hero">
        <div className="apercu-pro-hero-inner">
          <div className="apercu-pro-hero-content">
            <span className="apercu-pro-hero-eyebrow">
              — {(shop?.data?.category || "BOUTIQUE").toUpperCase()}
            </span>
            <h2 className="apercu-pro-hero-title">
              {shop?.data?.tagline || `Bienvenue chez ${shop?.shopName || "votre boutique"}`}
            </h2>
            <p className="apercu-pro-hero-desc">{heroDesc}</p>
            <div className="apercu-pro-hero-actions">
              <button type="button" className="apercu-pro-hero-btn-primary" disabled>
                Découvrir nos produits
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button type="button" className="apercu-pro-hero-btn-ghost" disabled>
                Notre histoire
              </button>
            </div>
          </div>
          <div className="apercu-pro-hero-visual" aria-hidden="true">
            <div className="apercu-pro-hero-visual-card apercu-pro-hero-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Image produit ici</span>
            </div>
            <div className="apercu-pro-hero-visual-card apercu-pro-hero-visual-card-2 apercu-pro-hero-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Image produit ici</span>
            </div>
            <div className="apercu-pro-hero-visual-card apercu-pro-hero-visual-card-3 apercu-pro-hero-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Image produit ici</span>
            </div>
          </div>
        </div>
      </section>

      {/* FILTRES */}
      <section className="apercu-pro-filters">
        <div className="apercu-pro-filters-inner">
          <button type="button" className="apercu-pro-filter-chip apercu-pro-filter-active" disabled>
            Tous les produits
          </button>
          {shop?.data?.products &&
            Array.from(new Set(shop.data.products.map((p) => p.category)))
              .slice(0, 5)
              .map((cat, i) => (
                <button key={cat + i} type="button" className="apercu-pro-filter-chip" disabled>
                  {cat}
                </button>
              ))}
        </div>
      </section>

      {/* GRILLE PRODUITS */}
      <section className="apercu-pro-products">
        <div className="apercu-pro-products-inner">
          <div className="apercu-pro-products-header">
            <h3 className="apercu-pro-products-title">Notre sélection</h3>
            <span className="apercu-pro-products-count">
              {shop?.data?.products?.length || 0} produit{(shop?.data?.products?.length || 0) > 1 ? "s" : ""}
            </span>
          </div>

          <div className="apercu-pro-products-grid">
            {shop?.data?.products && shop.data.products.length > 0 ? (
              shop.data.products.map((product, idx) => {
                const truncated =
                  product.description.length > 60
                    ? `${product.description.slice(0, 57)}...`
                    : product.description;
                const rating = (4.5 + ((idx * 0.07) % 0.5)).toFixed(1);
                const reviews = 12 + idx * 7;
                const badge = idx === 0 ? "NOUVEAU" : idx === 1 ? "BEST-SELLER" : idx === 4 ? "LIMITÉ" : null;
                const badgeClass = badge
                  ? `apercu-pro-product-badge apercu-pro-product-badge-${badge
                      .toLowerCase()
                      .replace(/-/g, "")}`
                  : "";

                return (
                  <article key={`${product.name}-${idx}`} className="apercu-pro-product">
                    <div
                      className="apercu-pro-product-image"
                      style={{
                        background: "linear-gradient(135deg, #F4F2EC 0%, #E8E5DD 100%)",
                      }}
                    >
                      <div className="apercu-pro-product-placeholder">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>Image produit ici</span>
                      </div>
                      {badge && <span className={badgeClass}>{badge}</span>}
                      <button type="button" className="apercu-pro-product-fav" aria-label="Ajouter aux favoris" disabled>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>

                    <div className="apercu-pro-product-info">
                      <span className="apercu-pro-product-category">{product.category}</span>
                      <h4 className="apercu-pro-product-name">{product.name}</h4>
                      <p className="apercu-pro-product-desc">{truncated}</p>

                      <div className="apercu-pro-product-meta">
                        <div className="apercu-pro-product-rating">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span>{rating}</span>
                          <span className="apercu-pro-product-reviews">({reviews})</span>
                        </div>
                        <div className="apercu-pro-product-price">
                          {product.price.toLocaleString("fr-FR")}
                          <span> FCFA</span>
                        </div>
                      </div>

                      <div className="apercu-pro-product-actions">
                        <button type="button" className="apercu-pro-product-btn-primary" disabled>
                          Voir le produit
                        </button>
                        <button type="button" className="apercu-pro-product-btn-icon" aria-label="Ajouter au panier" disabled>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="apercu-pro-products-empty">
                <p>Aucun produit pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION AVANTAGES */}
      <section className="apercu-pro-features">
        <div className="apercu-pro-features-inner">
          <div className="apercu-pro-feature">
            <div className="apercu-pro-feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div className="apercu-pro-feature-text">
              <h4>Livraison rapide</h4>
              <p>Partout dans votre région en 24-48h</p>
            </div>
          </div>
          <div className="apercu-pro-feature">
            <div className="apercu-pro-feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="apercu-pro-feature-text">
              <h4>Paiement sécurisé</h4>
              <p>Mobile Money, cartes bancaires, virements</p>
            </div>
          </div>
          <div className="apercu-pro-feature">
            <div className="apercu-pro-feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="apercu-pro-feature-text">
              <h4>Support 24/7</h4>
              <p>Une question ? Notre équipe vous répond</p>
            </div>
          </div>
          <div className="apercu-pro-feature">
            <div className="apercu-pro-feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div className="apercu-pro-feature-text">
              <h4>{madeInLabel}</h4>
              <p>Soutenez l&apos;entrepreneuriat local</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="apercu-pro-final-cta">
        <div className="apercu-pro-final-cta-inner">
          <span className="apercu-pro-final-cta-eyebrow">— Cette boutique vous plaît ?</span>
          <h3 className="apercu-pro-final-cta-title">
            Cette boutique vous plaît ?
            <br />
            <em>Publiez {shop?.data?.name || shop?.shopName || "votre boutique"}</em> maintenant
          </h3>
          <p className="apercu-pro-final-cta-desc">
            Créez votre compte Sellia en 30 secondes. Gratuit, sans carte bancaire.
            <br />
            Vous pourrez personnaliser logo, photos produits, livraison et paiements.
          </p>
          <a href={shop?.id ? `/inscription?draftShopId=${shop.id}` : "/inscription"} className="apercu-pro-final-cta-btn">
            Modifier et Publier
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <span className="apercu-pro-final-cta-trust">Aperçu valable 24h · Paiement automatique non requis</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="apercu-pro-footer">
        <div className="apercu-pro-footer-inner">
          <div className="apercu-pro-footer-brand">
            <div className="apercu-pro-shop-logo apercu-pro-footer-logo">
              <span>{(shop?.data?.name || shop?.shopName || "S").charAt(0)}</span>
            </div>
            <div>
              <h5 className="apercu-pro-footer-name">{shop?.data?.name || shop?.shopName}</h5>
              <p className="apercu-pro-footer-desc">
                {shop?.data?.targetAudience || "Une boutique pensée pour vous."}
              </p>
            </div>
          </div>
          <div className="apercu-pro-footer-cols">
            <div className="apercu-pro-footer-col">
              <h6>Boutique</h6>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Tous les produits
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Nouveautés
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Promotions
              </a>
            </div>
            <div className="apercu-pro-footer-col">
              <h6>Aide</h6>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Livraison
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Retours
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Contact
              </a>
            </div>
            <div className="apercu-pro-footer-col">
              <h6>Suivez-nous</h6>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Instagram
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                WhatsApp
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Facebook
              </a>
            </div>
          </div>
        </div>
        <div className="apercu-pro-footer-bottom">
          <span>
            © 2026 {shop?.data?.name || shop?.shopName} · Tous droits réservés
          </span>
          <span className="apercu-pro-footer-poweredby">
            Propulsé par <a href="/">Sellia</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function Apercu() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#FAFAF7" }} />}>
      <ApercuContent />
    </Suspense>
  );
}
