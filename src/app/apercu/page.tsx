"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GeneratedShop {
  prompt?: string;
  description?: string;
  name: string;
  tagline: string;
  generatedAt: string;
}

export default function Apercu() {
  const [shop, setShop] = useState<GeneratedShop | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [revealStep, setRevealStep] = useState(0);
  const [showTestimonial, setShowTestimonial] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [timeAgo, setTimeAgo] = useState(2);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sellia_generated_shop");
      if (stored) {
        try {
          setShop(JSON.parse(stored));
        } catch {
          // fallback
        }
      } else {
        window.location.href = "/";
        return;
      }
      setTimeout(() => setLoaded(true), 100);
    }
  }, []);

  // Animation de révélation orchestrée
  useEffect(() => {
    if (!loaded) return;

    const timers = [
      setTimeout(() => setRevealStep(1), 200),
      setTimeout(() => setRevealStep(2), 600),
      setTimeout(() => setRevealStep(3), 1000),
      setTimeout(() => setRevealStep(4), 1400),
      setTimeout(() => setShowAnnotations(true), 2200),
      setTimeout(() => setShowTestimonial(true), 3500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [loaded]);

  // Compteur "il y a X secondes"
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setTimeAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loaded]);

  const handleSave = () => {
    window.location.href = "/inscription";
  };

  const handleEdit = () => {
    window.location.href = "/?regenerate=true";
  };

  if (!shop) {
    return (
      <div className="apercu-v2-loading">
        <span className="apercu-v2-spinner"></span>
        <span>Chargement de votre boutique...</span>
      </div>
    );
  }

  // Génère un slug pour l'URL à partir du nom
  const slug = shop.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    || "ma-boutique";

  return (
    <div className={`apercu-v2-page ${loaded ? "is-loaded" : ""}`}>
      {/* Background décoratif */}
      <div className="apercu-v2-bg-pattern"></div>
      <div className="apercu-v2-bg-glow"></div>

      {/* Top bar */}
      <header className={`apercu-v2-topbar ${revealStep >= 1 ? "is-revealed" : ""}`}>
        <Link href="/" className="apercu-v2-logo" aria-label="Sellia">
          <svg width="120" height="32" viewBox="0 0 220 60" fill="none">
            <path d="M 8 8 L 38 8 L 54 24 L 54 54 L 8 54 Z" fill="#0E1116" />
            <circle cx="16" cy="16" r="2.4" fill="#FAFAF7" />
            <path d="M 38 30 L 24 30 L 24 36 L 38 36 L 38 44 L 24 44" stroke="#E84B1F" strokeWidth="2.6" fill="none" strokeLinecap="square" />
            <text x="68" y="44" fontFamily="Inter, system-ui, sans-serif" fontSize="32" fontWeight="600" fill="#0E1116" letterSpacing="-1.2">sellia</text>
          </svg>
        </Link>

        <div className="apercu-v2-topbar-status">
          <span className="apercu-v2-status-dot"></span>
          <span>Boutique générée · il y a {timeAgo}s</span>
        </div>

        <div className="apercu-v2-topbar-actions">
          <button onClick={handleEdit} className="apercu-v2-btn-ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Modifier</span>
          </button>
          <button onClick={handleSave} className="apercu-v2-btn-primary">
            <span>Sauvegarder</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero section avec stats */}
      <section className={`apercu-v2-hero ${revealStep >= 2 ? "is-revealed" : ""}`}>
        <div className="apercu-v2-hero-content">
          <span className="apercu-v2-hero-tag">— Création réussie</span>
          <h1 className="apercu-v2-hero-title">
            Voici <em>{shop.name}</em>.<br />
            Votre boutique est prête.
          </h1>
          <p className="apercu-v2-hero-subtitle">
            Générée à partir de votre vision. Personnalisable à 100%. Prête à recevoir vos premières ventes.
          </p>

          <div className="apercu-v2-stats">
            <div className="apercu-v2-stat">
              <span className="apercu-v2-stat-value">7,8<span className="apercu-v2-stat-unit">s</span></span>
              <span className="apercu-v2-stat-label">Temps de génération</span>
            </div>
            <div className="apercu-v2-stat-divider"></div>
            <div className="apercu-v2-stat">
              <span className="apercu-v2-stat-value">12</span>
              <span className="apercu-v2-stat-label">Éléments générés</span>
            </div>
            <div className="apercu-v2-stat-divider"></div>
            <div className="apercu-v2-stat">
              <span className="apercu-v2-stat-value">96<span className="apercu-v2-stat-unit">/100</span></span>
              <span className="apercu-v2-stat-label">Score qualité</span>
            </div>
            <div className="apercu-v2-stat-divider"></div>
            <div className="apercu-v2-stat">
              <span className="apercu-v2-stat-value">4</span>
              <span className="apercu-v2-stat-label">Paiements configurés</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main : browser + sidebar */}
      <main className="apercu-v2-main">
        <div className={`apercu-v2-browser-wrapper ${revealStep >= 3 ? "is-revealed" : ""}`}>
          {showAnnotations && (
            <>
              <div className="apercu-v2-annotation apercu-v2-annotation-top-left">
                <span className="apercu-v2-annotation-line"></span>
                <span className="apercu-v2-annotation-content">
                  <span className="apercu-v2-annotation-num">01</span>
                  Identité visuelle générée
                </span>
              </div>

              <div className="apercu-v2-annotation apercu-v2-annotation-top-right">
                <span className="apercu-v2-annotation-content">
                  <span className="apercu-v2-annotation-num">02</span>
                  Sous-domaine personnalisé
                </span>
                <span className="apercu-v2-annotation-line"></span>
              </div>

              <div className="apercu-v2-annotation apercu-v2-annotation-mid-left">
                <span className="apercu-v2-annotation-line"></span>
                <span className="apercu-v2-annotation-content">
                  <span className="apercu-v2-annotation-num">03</span>
                  Hero optimisé conversion
                </span>
              </div>

              <div className="apercu-v2-annotation apercu-v2-annotation-bottom-right">
                <span className="apercu-v2-annotation-content">
                  <span className="apercu-v2-annotation-num">04</span>
                  Produits avec prix optimisés
                </span>
                <span className="apercu-v2-annotation-line"></span>
              </div>
            </>
          )}

          <div className="apercu-v2-browser">
            <div className="apercu-v2-browser-bar">
              <div className="apercu-v2-browser-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="apercu-v2-browser-url">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>{slug}.getsellia.com</span>
              </div>
              <div className="apercu-v2-browser-actions">
                <span className="apercu-v2-browser-action-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                </span>
                <span className="apercu-v2-browser-action-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                </span>
              </div>
            </div>

            {/* Boutique simulée */}
            <div className="apercu-v2-shop">
              <nav className="apercu-v2-shop-nav">
                <span className="apercu-v2-shop-brand">{shop.name}</span>
                <ul>
                  <li>Boutique</li>
                  <li>Collections</li>
                  <li>À propos</li>
                  <li>Journal</li>
                  <li>Contact</li>
                </ul>
                <div className="apercu-v2-shop-nav-actions">
                  <button className="apercu-v2-shop-icon-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  </button>
                  <button className="apercu-v2-shop-icon-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </button>
                  <button className="apercu-v2-shop-cart-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                    <span className="apercu-v2-shop-cart-badge">2</span>
                  </button>
                </div>
              </nav>

              {/* Hero */}
              <section className="apercu-v2-shop-hero">
                <div className="apercu-v2-shop-hero-text">
                  <span className="apercu-v2-shop-eyebrow">— Bienvenue chez {shop.name}</span>
                  <h2 className="apercu-v2-shop-title">{shop.tagline}</h2>
                  <p className="apercu-v2-shop-desc">
                    Découvrez notre univers. Une sélection raffinée d&apos;objets choisis avec soin pour leur caractère unique.
                  </p>
                  <div className="apercu-v2-shop-hero-actions">
                    <button className="apercu-v2-shop-cta-primary">
                      Découvrir →
                    </button>
                    <button className="apercu-v2-shop-cta-ghost">
                      Notre histoire
                    </button>
                  </div>
                  <div className="apercu-v2-shop-trust-row">
                    <div className="apercu-v2-shop-trust">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      <span>Livraison Cameroun & international</span>
                    </div>
                    <div className="apercu-v2-shop-trust">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      <span>Retours gratuits 30 jours</span>
                    </div>
                  </div>
                </div>

                <div className="apercu-v2-shop-hero-visual">
                  <div className="apercu-v2-shop-hero-card">
                    <div className="apercu-v2-shop-hero-img"></div>
                    <span className="apercu-v2-shop-hero-tag-img">★ Pièce signature</span>
                  </div>
                  <div className="apercu-v2-shop-hero-card-secondary">
                    <div className="apercu-v2-shop-hero-img-secondary"></div>
                  </div>
                </div>
              </section>

              {/* Section produits */}
              <section className="apercu-v2-shop-products">
                <div className="apercu-v2-shop-products-header">
                  <div>
                    <span className="apercu-v2-shop-eyebrow">— Best-sellers</span>
                    <h3>Les pièces les plus aimées</h3>
                  </div>
                  <span className="apercu-v2-shop-products-meta">12 articles disponibles</span>
                </div>
                <div className="apercu-v2-shop-grid">
                  <article className="apercu-v2-shop-product">
                    <div className="apercu-v2-shop-product-img apercu-v2-prod-1">
                      <span className="apercu-v2-shop-product-badge">Nouveau</span>
                    </div>
                    <div className="apercu-v2-shop-product-info">
                      <h4>Pièce signature</h4>
                      <p>Édition limitée · Fait main</p>
                      <div className="apercu-v2-shop-product-footer">
                        <span className="apercu-v2-shop-product-price">45 000 <span>FCFA</span></span>
                        <span className="apercu-v2-shop-product-rating">★ 4.9</span>
                      </div>
                    </div>
                  </article>
                  <article className="apercu-v2-shop-product">
                    <div className="apercu-v2-shop-product-img apercu-v2-prod-2">
                      <span className="apercu-v2-shop-product-badge apercu-v2-badge-best">Best-seller</span>
                    </div>
                    <div className="apercu-v2-shop-product-info">
                      <h4>Best-seller</h4>
                      <p>Le favori de notre clientèle</p>
                      <div className="apercu-v2-shop-product-footer">
                        <span className="apercu-v2-shop-product-price">28 000 <span>FCFA</span></span>
                        <span className="apercu-v2-shop-product-rating">★ 5.0</span>
                      </div>
                    </div>
                  </article>
                  <article className="apercu-v2-shop-product">
                    <div className="apercu-v2-shop-product-img apercu-v2-prod-3"></div>
                    <div className="apercu-v2-shop-product-info">
                      <h4>Nouveauté</h4>
                      <p>Dernière création de la saison</p>
                      <div className="apercu-v2-shop-product-footer">
                        <span className="apercu-v2-shop-product-price">18 000 <span>FCFA</span></span>
                        <span className="apercu-v2-shop-product-rating">★ 4.8</span>
                      </div>
                    </div>
                  </article>
                </div>
              </section>

              {/* Footer boutique */}
              <footer className="apercu-v2-shop-footer">
                <div className="apercu-v2-shop-footer-left">
                  <span className="apercu-v2-shop-brand">{shop.name}</span>
                  <span className="apercu-v2-shop-footer-tagline">{shop.tagline}</span>
                </div>
                <div className="apercu-v2-shop-payments">
                  <span>MTN MoMo</span>
                  <span>Orange Money</span>
                  <span>Wave</span>
                  <span>Visa</span>
                  <span>Mastercard</span>
                </div>
              </footer>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={`apercu-v2-sidebar ${revealStep >= 4 ? "is-revealed" : ""}`}>
          <div className="apercu-v2-sidebar-main">
            <div className="apercu-v2-sidebar-header">
              <div className="apercu-v2-sidebar-icon-wrapper">
                <div className="apercu-v2-sidebar-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="apercu-v2-sidebar-icon-pulse"></span>
              </div>
              <span className="apercu-v2-sidebar-eyebrow">Tout est prêt</span>
            </div>

            <h2 className="apercu-v2-sidebar-title">
              Sauvegardez <em>{shop.name}</em>.
            </h2>
            <p className="apercu-v2-sidebar-subtitle">
              Créez votre compte gratuit pour conserver, personnaliser et publier votre boutique.
            </p>

            <div className="apercu-v2-timeline">
              <div className="apercu-v2-timeline-item is-done">
                <div className="apercu-v2-timeline-dot">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="apercu-v2-timeline-content">
                  <span className="apercu-v2-timeline-title">Identité visuelle</span>
                  <span className="apercu-v2-timeline-desc">Couleurs, typo, logo</span>
                </div>
                <span className="apercu-v2-timeline-time">il y a {timeAgo}s</span>
              </div>

              <div className="apercu-v2-timeline-item is-done">
                <div className="apercu-v2-timeline-dot">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="apercu-v2-timeline-content">
                  <span className="apercu-v2-timeline-title">Catalogue produits</span>
                  <span className="apercu-v2-timeline-desc">3 articles avec descriptions</span>
                </div>
                <span className="apercu-v2-timeline-time">il y a {Math.max(timeAgo - 2, 1)}s</span>
              </div>

              <div className="apercu-v2-timeline-item is-done">
                <div className="apercu-v2-timeline-dot">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="apercu-v2-timeline-content">
                  <span className="apercu-v2-timeline-title">Paiements activés</span>
                  <span className="apercu-v2-timeline-desc">Mobile Money + cartes</span>
                </div>
                <span className="apercu-v2-timeline-time">il y a {Math.max(timeAgo - 4, 1)}s</span>
              </div>

              <div className="apercu-v2-timeline-item is-done">
                <div className="apercu-v2-timeline-dot">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="apercu-v2-timeline-content">
                  <span className="apercu-v2-timeline-title">SEO optimisé</span>
                  <span className="apercu-v2-timeline-desc">12 mots-clés ciblés</span>
                </div>
                <span className="apercu-v2-timeline-time">il y a {Math.max(timeAgo - 6, 1)}s</span>
              </div>
            </div>

            <button onClick={handleSave} className="apercu-v2-cta-primary">
              <span className="apercu-v2-cta-glow"></span>
              <span className="apercu-v2-cta-content">
                <span>Sauvegarder ma boutique</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </button>

            <div className="apercu-v2-cta-meta">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Sans compte, votre boutique sera perdue dans 24h</span>
            </div>
          </div>

          <div className="apercu-v2-compare">
            <span className="apercu-v2-compare-label">Temps de mise en ligne</span>
            <div className="apercu-v2-compare-row">
              <span className="apercu-v2-compare-name">Shopify</span>
              <div className="apercu-v2-compare-bar">
                <div className="apercu-v2-compare-fill" style={{ width: "100%", background: "rgba(14,17,22,0.2)" }}></div>
              </div>
              <span className="apercu-v2-compare-time">~3 jours</span>
            </div>
            <div className="apercu-v2-compare-row">
              <span className="apercu-v2-compare-name">Wix / Squarespace</span>
              <div className="apercu-v2-compare-bar">
                <div className="apercu-v2-compare-fill" style={{ width: "60%", background: "rgba(14,17,22,0.18)" }}></div>
              </div>
              <span className="apercu-v2-compare-time">~1 jour</span>
            </div>
            <div className="apercu-v2-compare-row apercu-v2-compare-row-highlight">
              <span className="apercu-v2-compare-name">Sellia</span>
              <div className="apercu-v2-compare-bar">
                <div className="apercu-v2-compare-fill apercu-v2-compare-fill-ember" style={{ width: "3%" }}></div>
              </div>
              <span className="apercu-v2-compare-time">7,8s</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Témoignage flottant */}
      {showTestimonial && (
        <div className="apercu-v2-testimonial">
          <div className="apercu-v2-testimonial-avatar">M</div>
          <div className="apercu-v2-testimonial-content">
            <p className="apercu-v2-testimonial-text">
              <em>« Ma boutique en ligne en 30 secondes. Première vente en 24h. Incroyable. »</em>
            </p>
            <span className="apercu-v2-testimonial-author">
              Marielle K. · Yaoundé, Cameroun
            </span>
          </div>
          <button className="apercu-v2-testimonial-close" onClick={() => setShowTestimonial(false)} aria-label="Fermer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* Section "Et après ?" */}
      <section className="apercu-v2-after">
        <div className="apercu-v2-after-header">
          <span className="apercu-v2-after-eyebrow">— Et après l&apos;inscription</span>
          <h2 className="apercu-v2-after-title">
            Ce qui vous attend dans votre <em>tableau de bord</em>.
          </h2>
        </div>
        <div className="apercu-v2-after-grid">
          <div className="apercu-v2-after-card">
            <div className="apercu-v2-after-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3>Personnalisation totale</h3>
            <p>Modifiez chaque détail : couleurs, polices, mise en page, descriptions, photos de vos produits.</p>
          </div>
          <div className="apercu-v2-after-card">
            <div className="apercu-v2-after-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <h3>Tableau de bord complet</h3>
            <p>Suivez vos ventes, votre trafic, vos clients en temps réel. Statistiques avancées incluses.</p>
          </div>
          <div className="apercu-v2-after-card">
            <div className="apercu-v2-after-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Support dédié</h3>
            <p>Une équipe basée à Douala et Dakar pour vous accompagner. Réponse en moins de 4h en jours ouvrés.</p>
          </div>
          <div className="apercu-v2-after-card">
            <div className="apercu-v2-after-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Sécurité bancaire</h3>
            <p>Chiffrement AES-256, partenaires certifiés PCI-DSS, KYC intégré, protection anti-fraude.</p>
          </div>
        </div>

        <div className="apercu-v2-after-cta">
          <button onClick={handleSave} className="apercu-v2-cta-primary apercu-v2-cta-large">
            <span className="apercu-v2-cta-glow"></span>
            <span className="apercu-v2-cta-content">
              <span>Créer mon compte gratuit</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </button>
          <p className="apercu-v2-after-cta-meta">
            Sans carte bancaire · Sans engagement · 30 secondes
          </p>
        </div>
      </section>

      {/* CTA mobile sticky */}
      <div className="apercu-v2-mobile-cta">
        <button onClick={handleSave} className="apercu-v2-cta-primary apercu-v2-mobile-cta-btn">
          <span className="apercu-v2-cta-glow"></span>
          <span className="apercu-v2-cta-content">
            <span>Sauvegarder ma boutique</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
