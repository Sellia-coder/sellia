"use client";

import { useState } from "react";

type Tab = "domain" | "seo" | "sitemap" | "tracking" | "schema";

export default function DomaineSEOPage() {
  const [tab, setTab] = useState<Tab>("domain");
  const [pixelEnabled, setPixelEnabled] = useState(true);
  const [gaEnabled, setGaEnabled] = useState(true);

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Boutique</div>
          <h1 className="dash-page-title">Domaine & SEO</h1>
          <p className="dash-page-subtitle">Configurez votre domaine, le référencement et les outils de tracking pour optimiser vos ventes.</p>
        </div>
      </div>

      <div className="dash-tabs-bar dash-animate-fade-up dash-animate-delay-1">
        <button type="button" className={`dash-tab ${tab === "domain" ? "active" : ""}`} onClick={() => setTab("domain")}>Domaine</button>
        <button type="button" className={`dash-tab ${tab === "seo" ? "active" : ""}`} onClick={() => setTab("seo")}>SEO</button>
        <button type="button" className={`dash-tab ${tab === "sitemap" ? "active" : ""}`} onClick={() => setTab("sitemap")}>Sitemap & Robots</button>
        <button type="button" className={`dash-tab ${tab === "tracking" ? "active" : ""}`} onClick={() => setTab("tracking")}>Tracking & Pixels</button>
        <button type="button" className={`dash-tab ${tab === "schema" ? "active" : ""}`} onClick={() => setTab("schema")}>Données structurées</button>
      </div>

      {tab === "domain" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Sous-domaine Sellia (gratuit)</h3>
                <p className="dash-settings-card-desc">Votre boutique est accessible sur ce sous-domaine, prêt à l&apos;emploi.</p>
              </div>
            </div>
            <div className="dash-domain-row">
              <div className="dash-domain-icon" style={{background:"var(--dash-success-bg)", color:"var(--dash-success)"}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div className="dash-domain-info">
                <div className="dash-domain-name">maison-aida.getsellia.com</div>
                <div className="dash-domain-meta">
                  <span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Actif</span>
                  <span className="dash-cell-mono">SSL Cloudflare · Mis à jour il y a 2h</span>
                </div>
              </div>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Changer le sous-domaine</button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Domaine personnalisé</h3>
                <p className="dash-settings-card-desc">Connectez votre propre domaine (ex: maisonaida.com) pour une marque plus pro. Disponible sur le plan Pro.</p>
              </div>
              <span className="dash-badge dash-badge-warning"><span className="dash-badge-dot"></span>Plan Pro</span>
            </div>

            <div className="dash-form-row">
              <label htmlFor="custom-domain" className="dash-form-label">Votre domaine</label>
              <div style={{display:"flex", gap:"8px"}}>
                <input id="custom-domain" type="text" className="dash-form-input" placeholder="maisonaida.com" style={{flex:1}} />
                <button type="button" className="dash-btn dash-btn-ember">Connecter</button>
              </div>
              <p className="dash-form-help">Vous devrez ajouter des enregistrements DNS chez votre registrar (Namecheap, OVH, etc.).</p>
            </div>

            <div className="dash-form-section-divider"></div>

            <h4 className="dash-form-subsection-title">Configuration DNS requise</h4>
            <div className="dash-dns-records">
              <div className="dash-dns-row dash-dns-header">
                <div>Type</div><div>Nom</div><div>Valeur</div><div>Action</div>
              </div>
              <div className="dash-dns-row">
                <div className="dash-cell-mono">A</div>
                <div className="dash-cell-mono">@</div>
                <div className="dash-cell-mono">187.124.128.120</div>
                <button type="button" className="dash-btn dash-btn-ghost dash-btn-sm">Copier</button>
              </div>
              <div className="dash-dns-row">
                <div className="dash-cell-mono">CNAME</div>
                <div className="dash-cell-mono">www</div>
                <div className="dash-cell-mono">getsellia.com</div>
                <button type="button" className="dash-btn dash-btn-ghost dash-btn-sm">Copier</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "seo" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Méta-données globales</h3>
                <p className="dash-settings-card-desc">Affichées dans les résultats de Google et lors des partages sur les réseaux sociaux.</p>
              </div>
            </div>

            <div className="dash-form-row">
              <label htmlFor="site-title" className="dash-form-label">Titre du site (Title)</label>
              <input id="site-title" type="text" className="dash-form-input" defaultValue="Maison Aïda — Mode féminine africaine moderne" />
              <p className="dash-form-help">Apparaît dans l&apos;onglet du navigateur et les résultats Google. Recommandé : 50-60 caractères.</p>
            </div>

            <div className="dash-form-row">
              <label htmlFor="meta-desc" className="dash-form-label">Description (Meta description)</label>
              <textarea id="meta-desc" className="dash-form-textarea" rows={3} defaultValue="Découvrez les créations exclusives de Maison Aïda. Robes, accessoires, bijoux fabriqués au Sénégal. Livraison Mobile Money disponible partout en Afrique." />
              <p className="dash-form-help">Description courte affichée sous le titre Google. Recommandé : 150-160 caractères.</p>
            </div>

            <div className="dash-form-row">
              <label htmlFor="keywords" className="dash-form-label">Mots-clés principaux</label>
              <input id="keywords" type="text" className="dash-form-input" defaultValue="mode africaine, wax, robes, bijoux, Dakar, Sénégal" />
              <p className="dash-form-help">Séparés par des virgules. Décrivez votre activité principale.</p>
            </div>

            <div className="dash-form-section-divider"></div>

            <h4 className="dash-form-subsection-title">Aperçu Google</h4>
            <div className="dash-google-preview">
              <div className="dash-google-url">maison-aida.getsellia.com</div>
              <div className="dash-google-title">Maison Aïda — Mode féminine africaine moderne</div>
              <div className="dash-google-desc">Découvrez les créations exclusives de Maison Aïda. Robes, accessoires, bijoux fabriqués au Sénégal. Livraison Mobile Money disponible partout en Afrique.</div>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Open Graph (réseaux sociaux)</h3>
                <p className="dash-settings-card-desc">Image et texte affichés quand votre boutique est partagée sur Facebook, WhatsApp, Twitter, LinkedIn.</p>
              </div>
            </div>

            <div className="dash-form-row">
              <label htmlFor="og-title" className="dash-form-label">Titre OG</label>
              <input id="og-title" type="text" className="dash-form-input" defaultValue="Maison Aïda — Boutique mode africaine" />
            </div>

            <div className="dash-form-row">
              <label htmlFor="og-desc" className="dash-form-label">Description OG</label>
              <textarea id="og-desc" className="dash-form-textarea" rows={2} defaultValue="Mode féminine africaine moderne. Robes wax, accessoires artisanaux, livraison Mobile Money." />
            </div>

            <div className="dash-form-row">
              <label className="dash-form-label">Image OG (1200×630px)</label>
              <div className="dash-upload-zone" style={{padding:"24px"}}>
                <div className="dash-upload-subtitle">Ajoutez une image qui représente votre marque</div>
                <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" style={{marginTop:"10px"}}>Sélectionner une image</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "sitemap" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Sitemap XML</h3>
                <p className="dash-settings-card-desc">Liste de toutes les pages de votre boutique pour les moteurs de recherche. Mis à jour automatiquement.</p>
              </div>
            </div>

            <div className="dash-domain-row">
              <div className="dash-domain-icon" style={{background:"var(--dash-info-bg)", color:"var(--dash-info)"}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="dash-domain-info">
                <div className="dash-domain-name">sitemap.xml</div>
                <div className="dash-domain-meta">
                  <span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Actif</span>
                  <span className="dash-cell-mono">156 URLs · Mis à jour il y a 1h</span>
                </div>
              </div>
              <div style={{display:"flex", gap:"8px"}}>
                <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm">Voir le sitemap</button>
                <button type="button" className="dash-btn dash-btn-ghost dash-btn-sm">Régénérer</button>
              </div>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Robots.txt</h3>
                <p className="dash-settings-card-desc">Indique aux moteurs de recherche quelles pages indexer ou ignorer.</p>
              </div>
            </div>

            <div className="dash-form-row">
              <label htmlFor="robots" className="dash-form-label">Contenu du robots.txt</label>
              <textarea id="robots" className="dash-form-textarea" style={{fontFamily:"'JetBrains Mono', monospace", fontSize:"12px"}} rows={8} defaultValue={`User-agent: *
Allow: /

Disallow: /panier
Disallow: /commande
Disallow: /compte/*

Sitemap: https://maison-aida.getsellia.com/sitemap.xml`} />
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Indexation Google</h3>
                <p className="dash-settings-card-desc">Soumettez votre sitemap directement à Google Search Console pour accélérer l&apos;indexation.</p>
              </div>
            </div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Indexation automatique</div>
                <div className="dash-toggle-info-desc">Sellia notifie Google de chaque nouveau produit ou page.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>
          </div>
        </div>
      )}

      {tab === "tracking" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div style={{display:"flex", gap:"12px", alignItems:"center"}}>
                <div className="dash-tracking-logo" style={{background:"#1877F2", color:"white"}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
                </div>
                <div>
                  <h3 className="dash-settings-card-title">Pixel Facebook (Meta Pixel)</h3>
                  <p className="dash-settings-card-desc">Trackez vos ventes, créez des audiences personnalisées et optimisez vos pubs Facebook & Instagram.</p>
                </div>
              </div>
              <button type="button" className={`dash-switch ${pixelEnabled ? "active" : ""}`} onClick={() => setPixelEnabled(!pixelEnabled)} aria-pressed={pixelEnabled}></button>
            </div>

            {pixelEnabled && (
              <>
                <div className="dash-form-row">
                  <label htmlFor="pixel-id" className="dash-form-label">ID du Pixel</label>
                  <div className="dash-form-input-group" style={{maxWidth:"100%"}}>
                    <input id="pixel-id" type="text" className="dash-form-input" placeholder="123456789012345" defaultValue="987654321098765" style={{fontFamily:"'JetBrains Mono', monospace"}} />
                    <span className="dash-form-input-suffix">15 chiffres</span>
                  </div>
                  <p className="dash-form-help">Trouvez votre ID dans Meta Business Suite → Gestionnaire d&apos;événements.</p>
                </div>

                <div className="dash-form-section-divider"></div>

                <h4 className="dash-form-subsection-title">Événements trackés automatiquement</h4>
                <div className="dash-tracking-events">
                  {(
                    [
                      ["PageView", "Vue d'une page"],
                      ["ViewContent", "Vue d'un produit"],
                      ["AddToCart", "Ajout au panier"],
                      ["InitiateCheckout", "Début commande"],
                      ["Purchase", "Achat finalisé"],
                      ["Lead", "Inscription newsletter"],
                    ] as const
                  ).map(([name, desc]) => (
                    <div key={name} className="dash-tracking-event">
                      <div className="dash-tracking-event-name">{name}</div>
                      <div className="dash-tracking-event-desc">{desc}</div>
                      <span className="dash-badge dash-badge-success"><span className="dash-badge-dot"></span>Actif</span>
                    </div>
                  ))}
                </div>

                <div className="dash-form-section-divider"></div>

                <h4 className="dash-form-subsection-title">API de Conversion (CAPI)</h4>
                <div className="dash-toggle-row">
                  <div className="dash-toggle-info">
                    <div className="dash-toggle-info-title">Activer l&apos;API de Conversion serveur-to-serveur</div>
                    <div className="dash-toggle-info-desc">
                      Plus précis que le Pixel seul. Contourne les bloqueurs de pub. <strong>Fortement recommandé.</strong>
                    </div>
                  </div>
                  <button type="button" className="dash-switch active"></button>
                </div>
                <div className="dash-form-row" style={{marginTop:"12px"}}>
                  <label htmlFor="capi-token" className="dash-form-label">Token d&apos;accès CAPI</label>
                  <input id="capi-token" type="password" className="dash-form-input" placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxx" defaultValue="EAA••••••••••••••••••••••••••" style={{fontFamily:"'JetBrains Mono', monospace"}} />
                </div>
              </>
            )}
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div style={{display:"flex", gap:"12px", alignItems:"center"}}>
                <div className="dash-tracking-logo" style={{background:"#F9AB00", color:"white"}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="9"/><line x1="18" y1="20" x2="18" y2="4"/></svg>
                </div>
                <div>
                  <h3 className="dash-settings-card-title">Google Analytics 4 (GA4)</h3>
                  <p className="dash-settings-card-desc">Analyse complète du comportement de vos visiteurs et acheteurs.</p>
                </div>
              </div>
              <button type="button" className={`dash-switch ${gaEnabled ? "active" : ""}`} onClick={() => setGaEnabled(!gaEnabled)} aria-pressed={gaEnabled}></button>
            </div>

            {gaEnabled && (
              <>
                <div className="dash-form-row">
                  <label htmlFor="ga4-id" className="dash-form-label">ID de mesure GA4</label>
                  <input id="ga4-id" type="text" className="dash-form-input" placeholder="G-XXXXXXXXXX" defaultValue="G-AB1234CDEF" style={{fontFamily:"'JetBrains Mono', monospace"}} />
                  <p className="dash-form-help">Format : G-XXXXXXXXXX. Trouvez-le dans Admin → Flux de données.</p>
                </div>
                <div className="dash-toggle-row">
                  <div className="dash-toggle-info">
                    <div className="dash-toggle-info-title">Tracking e-commerce avancé</div>
                    <div className="dash-toggle-info-desc">Envoie les achats avec produits, montants, méthodes de paiement.</div>
                  </div>
                  <button type="button" className="dash-switch active"></button>
                </div>
              </>
            )}
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div style={{display:"flex", gap:"12px", alignItems:"center"}}>
                <div className="dash-tracking-logo" style={{background:"#000000", color:"white"}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.04z"/></svg>
                </div>
                <div>
                  <h3 className="dash-settings-card-title">Pixel TikTok</h3>
                  <p className="dash-settings-card-desc">Trackez les conversions de vos campagnes TikTok Ads.</p>
                </div>
              </div>
              <button type="button" className="dash-switch"></button>
            </div>

            <div className="dash-form-row">
              <label htmlFor="tiktok-pixel" className="dash-form-label">ID du Pixel TikTok</label>
              <input id="tiktok-pixel" type="text" className="dash-form-input" placeholder="C12ABCDEF34GHIJKL56" style={{fontFamily:"'JetBrains Mono', monospace"}} />
              <p className="dash-form-help">Trouvez-le dans TikTok Ads Manager → Assets → Events.</p>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div style={{display:"flex", gap:"12px", alignItems:"center"}}>
                <div className="dash-tracking-logo" style={{background:"#FFFC00", color:"black"}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.166 22h-.32c-.057-.005-.115-.011-.171-.011-.952 0-1.59-.45-2.21-.886-.443-.31-.86-.605-1.355-.687-.243-.04-.486-.06-.737-.06-.45 0-.81.07-1.075.12-.162.03-.305.058-.42.058-.118 0-.262-.022-.317-.21-.06-.21-.105-.412-.148-.61-.106-.493-.183-.793-.395-.825-2.16-.334-2.745-.785-2.875-1.105a.428.428 0 01-.044-.18.34.34 0 01.282-.353c4.082-.673 5.92-4.838 5.997-5.014l.018-.04c.227-.46.273-.85.137-1.166-.252-.585-1.075-.842-1.62-1.013-.135-.043-.262-.083-.357-.124-.502-.198-1.328-.625-1.219-1.207.078-.43.65-.726 1.106-.726.13 0 .242.024.336.07.498.235.945.354 1.33.354.51 0 .746-.21.778-.245-.014-.234-.03-.482-.044-.732-.118-1.876-.262-4.21.336-5.553C8.802 1.31 12.087.91 13.022.91c.05 0 .124-.005.156-.005l.018.005c.04.005.114.012.156.012.937 0 4.227.4 6.073 4.555.598 1.347.448 3.677.336 5.554l-.005.073-.045.66c.034.034.252.227.726.245.367-.014.793-.133 1.27-.354.155-.07.323-.106.498-.106.166 0 .335.034.487.094l.005.005c.434.155.722.45.728.738a.745.745 0 01-.034.205c-.246.587-1.06.87-1.624 1.05-.064.018-.135.038-.207.058-.342.103-.864.262-1.014.617-.075.183-.054.42.064.71l.005.018c.078.184 1.92 4.345 5.997 5.018a.34.34 0 01.283.353.51.51 0 01-.045.179c-.135.32-.71.77-2.875 1.105-.215.034-.293.317-.395.825-.05.207-.094.398-.148.605a.27.27 0 01-.12.197.394.394 0 01-.197.058c-.105 0-.25-.02-.412-.054-.31-.06-.665-.118-1.075-.118-.262 0-.504.024-.737.058-.498.082-.91.378-1.355.687-.62.43-1.255.886-2.21.886-.043 0-.114-.005-.18-.01z"/></svg>
                </div>
                <div>
                  <h3 className="dash-settings-card-title">Pixel Snapchat</h3>
                  <p className="dash-settings-card-desc">Mesurez les performances de vos campagnes Snap Ads.</p>
                </div>
              </div>
              <button type="button" className="dash-switch"></button>
            </div>

            <div className="dash-form-row">
              <label htmlFor="snap-pixel" className="dash-form-label">ID du Pixel Snap</label>
              <input id="snap-pixel" type="text" className="dash-form-input" placeholder="abcd1234-ef56-78gh-ij90-klmnopqrstuv" style={{fontFamily:"'JetBrains Mono', monospace"}} />
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Scripts personnalisés</h3>
                <p className="dash-settings-card-desc">Ajoutez du code custom dans le {"<head>"} ou {"<body>"} de votre boutique. Pour utilisateurs avancés uniquement.</p>
              </div>
            </div>
            <div className="dash-form-row">
              <label htmlFor="script-head" className="dash-form-label">Scripts {"<head>"}</label>
              <textarea id="script-head" className="dash-form-textarea" style={{fontFamily:"'JetBrains Mono', monospace", fontSize:"12px"}} rows={4} placeholder="<!-- Vos scripts ici -->" />
            </div>
            <div className="dash-form-row">
              <label htmlFor="script-body" className="dash-form-label">Scripts fin de {"<body>"}</label>
              <textarea id="script-body" className="dash-form-textarea" style={{fontFamily:"'JetBrains Mono', monospace", fontSize:"12px"}} rows={4} placeholder="<!-- Vos scripts ici -->" />
            </div>
          </div>
        </div>
      )}

      {tab === "schema" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Schema.org / Données structurées</h3>
                <p className="dash-settings-card-desc">Aide Google à mieux comprendre vos pages pour des résultats enrichis (étoiles, prix, stock).</p>
              </div>
            </div>

            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Schema Product (recommandé)</div>
                <div className="dash-toggle-info-desc">Affiche prix, disponibilité, notes dans Google Search.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>

            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Schema Organization</div>
                <div className="dash-toggle-info-desc">Identifie votre marque dans le Knowledge Graph Google.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>

            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Schema BreadcrumbList</div>
                <div className="dash-toggle-info-desc">Affiche le fil d&apos;Ariane dans les résultats de recherche.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>

            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Schema LocalBusiness</div>
                <div className="dash-toggle-info-desc">Pour les boutiques avec adresse physique.</div>
              </div>
              <button type="button" className="dash-switch"></button>
            </div>

            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Schema FAQPage</div>
                <div className="dash-toggle-info-desc">Affiche vos FAQ directement dans Google.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Outils de validation</h3>
                <p className="dash-settings-card-desc">Testez votre site avec les outils officiels.</p>
              </div>
            </div>
            <div className="dash-tools-grid">
              <a href="#" className="dash-tool-card">
                <div className="dash-tool-icon" style={{background:"#4285F4", color:"white"}}>G</div>
                <div className="dash-tool-info">
                  <div className="dash-tool-name">Google Rich Results Test</div>
                  <div className="dash-tool-desc">Vérifie vos données structurées</div>
                </div>
              </a>
              <a href="#" className="dash-tool-card">
                <div className="dash-tool-icon" style={{background:"#34A853", color:"white"}}>S</div>
                <div className="dash-tool-info">
                  <div className="dash-tool-name">Search Console</div>
                  <div className="dash-tool-desc">Suivi indexation Google</div>
                </div>
              </a>
              <a href="#" className="dash-tool-card">
                <div className="dash-tool-icon" style={{background:"#1877F2", color:"white"}}>F</div>
                <div className="dash-tool-info">
                  <div className="dash-tool-name">Meta Sharing Debugger</div>
                  <div className="dash-tool-desc">Test partages Facebook</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
