"use client";

import Link from "next/link";
import { useState } from "react";

const helpCategories = [
  { id: "start", icon: "🚀", name: "Premiers pas", desc: "Configurer votre boutique en 5 étapes", articles: 12 },
  { id: "products", icon: "📦", name: "Produits", desc: "Ajouter, gérer, importer", articles: 18 },
  { id: "orders", icon: "🛒", name: "Commandes", desc: "Traiter, expédier, suivre", articles: 15 },
  { id: "payments", icon: "💰", name: "Paiements", desc: "Mobile Money, cartes, virements", articles: 22 },
  { id: "marketing", icon: "🎯", name: "Marketing & SEO", desc: "Pixel Facebook, GA4, promotions", articles: 14 },
  { id: "design", icon: "🎨", name: "Design boutique", desc: "Thèmes, couleurs, layout", articles: 9 },
  { id: "domain", icon: "🌐", name: "Domaine", desc: "Sous-domaine et domaine custom", articles: 7 },
  { id: "account", icon: "🔐", name: "Compte & Sécurité", desc: "Mot de passe, 2FA, équipe", articles: 11 },
];

const popularArticles = [
  { title: "Comment activer Mobile Money sur ma boutique ?", category: "Paiements", views: 12450 },
  { title: "Connecter mon domaine personnalisé", category: "Domaine", views: 8932 },
  { title: "Configurer le Pixel Facebook (CAPI)", category: "Marketing & SEO", views: 7821 },
  { title: "Importer mes produits depuis Shopify", category: "Produits", views: 6542 },
  { title: "Comprendre les frais de transaction", category: "Paiements", views: 5876 },
];

export default function AidePage() {
  const [search, setSearch] = useState("");

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <Link href="/dashboard" className="dash-back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Retour au dashboard
          </Link>
          <div className="dash-page-eyebrow">— Support</div>
          <h1 className="dash-page-title">Centre d&apos;aide</h1>
          <p className="dash-page-subtitle">Trouvez rapidement les réponses à vos questions ou contactez notre équipe.</p>
        </div>
      </div>

      <div className="dash-help-hero dash-animate-fade-up dash-animate-delay-1">
        <div className="dash-help-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Rechercher dans le centre d'aide..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="dash-help-suggestions">
          <span>Suggestions :</span>
          <button type="button" className="dash-help-suggestion-pill">Configurer Mobile Money</button>
          <button type="button" className="dash-help-suggestion-pill">Pixel Facebook</button>
          <button type="button" className="dash-help-suggestion-pill">Domaine custom</button>
        </div>
      </div>

      <div className="dash-help-categories-grid dash-animate-fade-up dash-animate-delay-2">
        {helpCategories.map(c => (
          <a key={c.id} href="#" className="dash-help-category-card">
            <div className="dash-help-category-icon">{c.icon}</div>
            <div className="dash-help-category-name">{c.name}</div>
            <div className="dash-help-category-desc">{c.desc}</div>
            <div className="dash-help-category-count">{c.articles} articles</div>
          </a>
        ))}
      </div>

      <div className="dash-settings-card dash-animate-fade-up dash-animate-delay-3" style={{marginTop:"24px"}}>
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title">Articles populaires</h3>
            <p className="dash-settings-card-desc">Les questions les plus consultées par nos utilisateurs.</p>
          </div>
        </div>
        {popularArticles.map((a, i) => (
          <a key={a.title} href="#" className="dash-help-article-row">
            <div className="dash-help-article-rank">{String(i + 1).padStart(2, "0")}</div>
            <div className="dash-help-article-info">
              <div className="dash-help-article-title">{a.title}</div>
              <div className="dash-help-article-meta">
                <span className="dash-cell-mono">{a.category}</span>
                <span style={{color:"var(--dash-text-tertiary)"}}>·</span>
                <span className="dash-cell-mono">{a.views.toLocaleString("fr-FR")} vues</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"var(--dash-text-tertiary)"}} aria-hidden><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        ))}
      </div>

      <div className="dash-settings-card dash-animate-fade-up dash-animate-delay-4" style={{marginTop:"24px", background:"linear-gradient(135deg, var(--dash-bg-active), rgba(232, 75, 31, 0.02))", borderColor:"rgba(232, 75, 31, 0.2)"}}>
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title">Vous ne trouvez pas la réponse ?</h3>
            <p className="dash-settings-card-desc">Notre équipe support est là pour vous aider, 7j/7 en français.</p>
          </div>
        </div>
        <div className="dash-help-contacts">
          <a href="mailto:support@getsellia.com" className="dash-help-contact-card">
            <div className="dash-help-contact-icon" style={{background:"var(--dash-info-bg)", color:"var(--dash-info)"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div className="dash-help-contact-name">Email</div>
            <div className="dash-help-contact-desc">support@getsellia.com</div>
            <div className="dash-help-contact-meta">Réponse sous 4h</div>
          </a>
          <a href="https://wa.me/237678123456" className="dash-help-contact-card">
            <div className="dash-help-contact-icon" style={{background:"#25D366", color:"white"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <div className="dash-help-contact-name">WhatsApp</div>
            <div className="dash-help-contact-desc">+237 6 78 12 34 56</div>
            <div className="dash-help-contact-meta">Lun-Ven 8h-20h</div>
          </a>
          <a href="#" className="dash-help-contact-card">
            <div className="dash-help-contact-icon" style={{background:"var(--dash-bg-active)", color:"var(--dash-ember)"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div className="dash-help-contact-name">Chat live</div>
            <div className="dash-help-contact-desc">Démarrer une conversation</div>
            <div className="dash-help-contact-meta">Réponse immédiate · 7j/7</div>
          </a>
        </div>
      </div>
    </>
  );
}
