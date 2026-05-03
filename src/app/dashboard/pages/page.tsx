"use client";

import { useState } from "react";

type Tab = "pages" | "blog" | "faq" | "annonces" | "footer";

const pagesList = [
  { id: "p1", title: "À propos", slug: "/a-propos", status: "published", views: 1247, updated: "Il y a 3 jours" },
  { id: "p2", title: "FAQ", slug: "/faq", status: "published", views: 892, updated: "Il y a 1 semaine" },
  { id: "p3", title: "Contact", slug: "/contact", status: "published", views: 654, updated: "Il y a 2 semaines" },
  { id: "p4", title: "Politique de retour", slug: "/retours", status: "published", views: 234, updated: "Il y a 1 mois" },
  { id: "p5", title: "Conditions générales", slug: "/cgv", status: "published", views: 89, updated: "Il y a 2 mois" },
  { id: "p6", title: "Guide des tailles", slug: "/tailles", status: "draft", views: 0, updated: "Il y a 5 jours" },
];

const blogPosts = [
  { id: "b1", title: "Comment porter le wax au quotidien", category: "Style", views: 3421, status: "published", date: "28 avr. 2026" },
  { id: "b2", title: "Les tendances mode africaine 2026", category: "Tendances", views: 2845, status: "published", date: "20 avr. 2026" },
  { id: "b3", title: "L'histoire de Maison Aïda", category: "Marque", views: 1876, status: "published", date: "10 avr. 2026" },
  { id: "b4", title: "Entretenir vos vêtements en wax", category: "Conseils", views: 0, status: "draft", date: "Brouillon" },
];

const faqs = [
  { q: "Quel est le délai de livraison ?", a: "2-5 jours sur Dakar, 5-10 jours pour le reste du Sénégal et l'international." },
  { q: "Puis-je échanger un produit ?", a: "Oui, sous 14 jours avec preuve d'achat. Les frais d'échange sont à votre charge." },
  { q: "Quels sont les modes de paiement ?", a: "Mobile Money (MTN, Orange, Wave), cartes bancaires Visa/Mastercard, virements." },
  { q: "Livrez-vous à l'international ?", a: "Oui, vers 12 pays africains et l'Europe via DHL Express." },
];

export default function PagesContenuPage() {
  const [tab, setTab] = useState<Tab>("pages");

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Boutique</div>
          <h1 className="dash-page-title">Pages & Contenu</h1>
          <p className="dash-page-subtitle">Gérez les pages statiques, articles de blog, FAQ et annonces de votre boutique.</p>
        </div>
      </div>

      <div className="dash-tabs-bar dash-animate-fade-up dash-animate-delay-1">
        <button type="button" className={`dash-tab ${tab === "pages" ? "active" : ""}`} onClick={() => setTab("pages")}>Pages</button>
        <button type="button" className={`dash-tab ${tab === "blog" ? "active" : ""}`} onClick={() => setTab("blog")}>Blog</button>
        <button type="button" className={`dash-tab ${tab === "faq" ? "active" : ""}`} onClick={() => setTab("faq")}>FAQ</button>
        <button type="button" className={`dash-tab ${tab === "annonces" ? "active" : ""}`} onClick={() => setTab("annonces")}>Annonces</button>
        <button type="button" className={`dash-tab ${tab === "footer" ? "active" : ""}`} onClick={() => setTab("footer")}>Footer</button>
      </div>

      {tab === "pages" && (
        <div className="dash-table-container dash-animate-fade-up">
          <div className="dash-table-header">
            <div className="dash-table-filters">
              <button type="button" className="dash-filter-pill active">Toutes <span className="dash-filter-count">{pagesList.length}</span></button>
              <button type="button" className="dash-filter-pill">Publiées <span className="dash-filter-count">{pagesList.filter(p => p.status === "published").length}</span></button>
              <button type="button" className="dash-filter-pill">Brouillons</button>
            </div>
            <button type="button" className="dash-btn dash-btn-ember dash-btn-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              Nouvelle page
            </button>
          </div>
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr><th>Titre</th><th>URL</th><th>Vues</th><th>Statut</th><th>Modifiée</th><th></th></tr>
              </thead>
              <tbody>
                {pagesList.map(p => (
                  <tr key={p.id}>
                    <td style={{fontWeight:600}}>{p.title}</td>
                    <td><span className="dash-cell-mono">{p.slug}</span></td>
                    <td><span className="dash-cell-mono">{p.views.toLocaleString("fr-FR")}</span></td>
                    <td>{p.status === "published" ? <span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Publiée</span> : <span className="dash-badge dash-badge-neutral"><span className="dash-badge-dot"></span>Brouillon</span>}</td>
                    <td><span className="dash-cell-mono">{p.updated}</span></td>
                    <td><button type="button" className="dash-icon-btn" aria-label="Modifier"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "blog" && (
        <div className="dash-table-container dash-animate-fade-up">
          <div className="dash-table-header">
            <div className="dash-table-filters">
              <button type="button" className="dash-filter-pill active">Tous <span className="dash-filter-count">{blogPosts.length}</span></button>
              <button type="button" className="dash-filter-pill">Publiés</button>
              <button type="button" className="dash-filter-pill">Brouillons</button>
            </div>
            <button type="button" className="dash-btn dash-btn-ember dash-btn-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              Nouvel article
            </button>
          </div>
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr><th>Titre</th><th>Catégorie</th><th>Vues</th><th>Statut</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {blogPosts.map(p => (
                  <tr key={p.id}>
                    <td style={{fontWeight:600}}>{p.title}</td>
                    <td><span className="dash-cell-mono">{p.category}</span></td>
                    <td><span className="dash-cell-mono">{p.views.toLocaleString("fr-FR")}</span></td>
                    <td>{p.status === "published" ? <span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Publié</span> : <span className="dash-badge dash-badge-neutral"><span className="dash-badge-dot"></span>Brouillon</span>}</td>
                    <td><span className="dash-cell-mono">{p.date}</span></td>
                    <td><button type="button" className="dash-icon-btn" aria-label="Modifier"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "faq" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Questions fréquentes</h3>
                <p className="dash-settings-card-desc">Affichées sur votre page FAQ et dans le footer. Glissez pour réordonner.</p>
              </div>
              <button type="button" className="dash-btn dash-btn-ember dash-btn-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                Ajouter une question
              </button>
            </div>
            {faqs.map((faq, i) => (
              <div key={`faq-${i}`} className="dash-faq-item">
                <div className="dash-faq-handle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></svg>
                </div>
                <div className="dash-faq-content">
                  <div className="dash-faq-question">{faq.q}</div>
                  <div className="dash-faq-answer">{faq.a}</div>
                </div>
                <div className="dash-faq-actions">
                  <button type="button" className="dash-icon-btn" aria-label="Modifier"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                  <button type="button" className="dash-icon-btn" aria-label="Supprimer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "annonces" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Pop-ups & annonces</h3>
                <p className="dash-settings-card-desc">Apparaissent à des moments précis pour booster les conversions.</p>
              </div>
              <button type="button" className="dash-btn dash-btn-ember dash-btn-sm">Créer une annonce</button>
            </div>

            <div className="dash-announcement-card">
              <div className="dash-announcement-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <div className="dash-announcement-info">
                <div className="dash-announcement-name">Newsletter signup</div>
                <div className="dash-announcement-desc">Pop-up après 30s sur la page d&apos;accueil · 3 234 inscriptions</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>

            <div className="dash-announcement-card">
              <div className="dash-announcement-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
              </div>
              <div className="dash-announcement-info">
                <div className="dash-announcement-name">Exit intent : -10%</div>
                <div className="dash-announcement-desc">Quand le client veut quitter sans acheter · Convertit 18%</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>

            <div className="dash-announcement-card">
              <div className="dash-announcement-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07l-2.83 2.83M6.76 17.24l-2.83 2.83m12.02 0l-2.83-2.83M6.76 6.76L3.93 3.93"/></svg>
              </div>
              <div className="dash-announcement-info">
                <div className="dash-announcement-name">Banner cookies</div>
                <div className="dash-announcement-desc">RGPD · Affiché à la première visite</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>
          </div>
        </div>
      )}

      {tab === "footer" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Liens du footer</h3>
                <p className="dash-settings-card-desc">Configurez les colonnes et liens affichés en bas de votre boutique.</p>
              </div>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Aperçu footer</button>
            </div>

            <div className="dash-footer-columns">
              <div className="dash-footer-column">
                <div className="dash-footer-column-header">
                  <input type="text" className="dash-form-input dash-footer-column-title" defaultValue="Boutique" aria-label="Titre colonne" />
                </div>
                <div className="dash-footer-link"><span>Accueil</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <div className="dash-footer-link"><span>Tous les produits</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <div className="dash-footer-link"><span>Nouveautés</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <button type="button" className="dash-footer-add-link">+ Ajouter un lien</button>
              </div>

              <div className="dash-footer-column">
                <div className="dash-footer-column-header">
                  <input type="text" className="dash-form-input dash-footer-column-title" defaultValue="À propos" aria-label="Titre colonne" />
                </div>
                <div className="dash-footer-link"><span>Notre histoire</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <div className="dash-footer-link"><span>Contact</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <div className="dash-footer-link"><span>Blog</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <button type="button" className="dash-footer-add-link">+ Ajouter un lien</button>
              </div>

              <div className="dash-footer-column">
                <div className="dash-footer-column-header">
                  <input type="text" className="dash-form-input dash-footer-column-title" defaultValue="Aide" aria-label="Titre colonne" />
                </div>
                <div className="dash-footer-link"><span>FAQ</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <div className="dash-footer-link"><span>Livraison</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <div className="dash-footer-link"><span>Retours</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <button type="button" className="dash-footer-add-link">+ Ajouter un lien</button>
              </div>

              <div className="dash-footer-column">
                <div className="dash-footer-column-header">
                  <input type="text" className="dash-form-input dash-footer-column-title" defaultValue="Légal" aria-label="Titre colonne" />
                </div>
                <div className="dash-footer-link"><span>CGV</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <div className="dash-footer-link"><span>Confidentialité</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <div className="dash-footer-link"><span>Cookies</span><button type="button" className="dash-icon-btn" aria-label="Retirer">×</button></div>
                <button type="button" className="dash-footer-add-link">+ Ajouter un lien</button>
              </div>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Réseaux sociaux</h3>
                <p className="dash-settings-card-desc">Liens vers vos pages — affichés dans le footer.</p>
              </div>
            </div>
            <div className="dash-form-row">
              <label htmlFor="foot-insta" className="dash-form-label">Instagram</label>
              <input id="foot-insta" type="text" className="dash-form-input" defaultValue="https://instagram.com/maison.aida" />
            </div>
            <div className="dash-form-row">
              <label htmlFor="foot-fb" className="dash-form-label">Facebook</label>
              <input id="foot-fb" type="text" className="dash-form-input" defaultValue="https://facebook.com/maisonaida" />
            </div>
            <div className="dash-form-row">
              <label htmlFor="foot-tt" className="dash-form-label">TikTok</label>
              <input id="foot-tt" type="text" className="dash-form-input" placeholder="https://tiktok.com/@..." />
            </div>
            <div className="dash-form-row">
              <label htmlFor="foot-wa" className="dash-form-label">WhatsApp Business</label>
              <input id="foot-wa" type="text" className="dash-form-input" defaultValue="+221 77 123 45 67" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
