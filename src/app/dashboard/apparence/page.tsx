"use client";

import { useState } from "react";

type Tab = "theme" | "colors" | "typography" | "logo" | "layout" | "banner";

const themes = [
  { id: "minimal", name: "Minimal", desc: "Épuré, beaucoup de blanc, focus produits", preview: "linear-gradient(135deg, #FFFFFF, #F5F1EA)", active: true },
  { id: "bold", name: "Bold", desc: "Couleurs vives, typographie audacieuse", preview: "linear-gradient(135deg, #0E1116, #E84B1F)" },
  { id: "editorial", name: "Editorial", desc: "Style magazine, photos plein écran", preview: "linear-gradient(135deg, #FAFAF7, #6B5B47)" },
  { id: "boutique", name: "Boutique", desc: "Élégant, raffiné, palette terreuse", preview: "linear-gradient(135deg, #C9A876, #8B6F47)" },
  { id: "marketplace", name: "Marketplace", desc: "Dense, beaucoup de produits visibles", preview: "linear-gradient(135deg, #4A7A5C, #2D5A3D)" },
  { id: "vibrant", name: "Vibrant", desc: "Coloré, énergique, jeune", preview: "linear-gradient(135deg, #FF7849, #FFD700)" },
];

const fonts = [
  { name: "Inter", category: "Moderne", sample: "AaBbCc 123" },
  { name: "Fraunces", category: "Editorial", sample: "AaBbCc 123" },
  { name: "Playfair Display", category: "Classique", sample: "AaBbCc 123" },
  { name: "DM Sans", category: "Moderne", sample: "AaBbCc 123" },
  { name: "Manrope", category: "Moderne", sample: "AaBbCc 123" },
  { name: "Lora", category: "Editorial", sample: "AaBbCc 123" },
];

export default function AppearancePage() {
  const [tab, setTab] = useState<Tab>("theme");
  const [primaryColor, setPrimaryColor] = useState("#E84B1F");
  const [bgColor, setBgColor] = useState("#FAFAF7");
  const [textColor, setTextColor] = useState("#0E1116");
  const [bodyFont, setBodyFont] = useState("Inter");
  const [displayFont, setDisplayFont] = useState("Fraunces");

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Boutique</div>
          <h1 className="dash-page-title">Apparence</h1>
          <p className="dash-page-subtitle">Personnalisez l&apos;identité visuelle de votre boutique. Vos clients verront ces changements en temps réel.</p>
        </div>
        <div className="dash-page-actions">
          <button type="button" className="dash-btn dash-btn-secondary">Aperçu</button>
          <button type="button" className="dash-btn dash-btn-ember">Publier les modifications</button>
        </div>
      </div>

      <div className="dash-tabs-bar dash-animate-fade-up dash-animate-delay-1">
        <button type="button" className={`dash-tab ${tab === "theme" ? "active" : ""}`} onClick={() => setTab("theme")}>Thème</button>
        <button type="button" className={`dash-tab ${tab === "colors" ? "active" : ""}`} onClick={() => setTab("colors")}>Couleurs</button>
        <button type="button" className={`dash-tab ${tab === "typography" ? "active" : ""}`} onClick={() => setTab("typography")}>Typographie</button>
        <button type="button" className={`dash-tab ${tab === "logo" ? "active" : ""}`} onClick={() => setTab("logo")}>Logo & Favicon</button>
        <button type="button" className={`dash-tab ${tab === "layout" ? "active" : ""}`} onClick={() => setTab("layout")}>Layout</button>
        <button type="button" className={`dash-tab ${tab === "banner" ? "active" : ""}`} onClick={() => setTab("banner")}>Banner promo</button>
      </div>

      {tab === "theme" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Choisissez votre thème</h3>
                <p className="dash-settings-card-desc">6 thèmes premium conçus pour les marques africaines modernes. Cliquez pour activer.</p>
              </div>
            </div>
            <div className="dash-themes-grid">
              {themes.map(t => (
                <div key={t.id} className={`dash-theme-card ${t.active ? "active" : ""}`}>
                  <div className="dash-theme-preview" style={{background: t.preview}}>
                    <div className="dash-theme-preview-content">
                      <div className="dash-theme-preview-header"></div>
                      <div className="dash-theme-preview-grid">
                        <div className="dash-theme-preview-item"></div>
                        <div className="dash-theme-preview-item"></div>
                        <div className="dash-theme-preview-item"></div>
                      </div>
                    </div>
                  </div>
                  <div className="dash-theme-info">
                    <div className="dash-theme-name">
                      {t.name}
                      {t.active && <span className="dash-badge dash-badge-success" style={{marginLeft:"8px"}}><span className="dash-badge-dot"></span>Actif</span>}
                    </div>
                    <div className="dash-theme-desc">{t.desc}</div>
                  </div>
                  {!t.active && <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" style={{width:"100%", marginTop:"12px"}}>Activer ce thème</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "colors" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Palette de couleurs</h3>
                <p className="dash-settings-card-desc">Définissez les couleurs de votre boutique. Les changements sont appliqués partout.</p>
              </div>
            </div>

            <div className="dash-color-row">
              <div className="dash-color-info">
                <div className="dash-color-name">Couleur primaire</div>
                <div className="dash-color-desc">Boutons, liens, éléments interactifs</div>
              </div>
              <div className="dash-color-picker-wrap">
                <input type="color" className="dash-color-picker" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                <input type="text" className="dash-form-input" style={{width:"120px", fontFamily:"'JetBrains Mono', monospace"}} value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
              </div>
            </div>

            <div className="dash-color-row">
              <div className="dash-color-info">
                <div className="dash-color-name">Couleur de fond</div>
                <div className="dash-color-desc">Fond global de la boutique</div>
              </div>
              <div className="dash-color-picker-wrap">
                <input type="color" className="dash-color-picker" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                <input type="text" className="dash-form-input" style={{width:"120px", fontFamily:"'JetBrains Mono', monospace"}} value={bgColor} onChange={e => setBgColor(e.target.value)} />
              </div>
            </div>

            <div className="dash-color-row">
              <div className="dash-color-info">
                <div className="dash-color-name">Couleur du texte</div>
                <div className="dash-color-desc">Texte principal sur fond clair</div>
              </div>
              <div className="dash-color-picker-wrap">
                <input type="color" className="dash-color-picker" value={textColor} onChange={e => setTextColor(e.target.value)} />
                <input type="text" className="dash-form-input" style={{width:"120px", fontFamily:"'JetBrains Mono', monospace"}} value={textColor} onChange={e => setTextColor(e.target.value)} />
              </div>
            </div>

            <div className="dash-form-section-divider"></div>

            <h4 className="dash-form-subsection-title">Aperçu live</h4>
            <div className="dash-color-preview" style={{background: bgColor, color: textColor}}>
              <div style={{fontFamily:"'Fraunces', serif", fontSize:"24px", fontWeight:400, marginBottom:"12px"}}>Maison Aïda</div>
              <p style={{fontSize:"14px", marginBottom:"16px", opacity:0.7}}>Une boutique en ligne pour les femmes africaines modernes.</p>
              <button type="button" style={{background: primaryColor, color:"white", border:"none", padding:"10px 20px", borderRadius:"8px", fontWeight:600, cursor:"pointer"}}>Acheter maintenant</button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Palettes prédéfinies</h3>
                <p className="dash-settings-card-desc">Cliquez sur une palette pour l&apos;appliquer instantanément.</p>
              </div>
            </div>
            <div className="dash-palette-grid">
              <button type="button" className="dash-palette-card" onClick={() => { setPrimaryColor("#E84B1F"); setBgColor("#FAFAF7"); setTextColor("#0E1116"); }}>
                <div className="dash-palette-swatches">
                  <div style={{background:"#E84B1F"}}></div>
                  <div style={{background:"#FAFAF7"}}></div>
                  <div style={{background:"#0E1116"}}></div>
                </div>
                <div className="dash-palette-name">Sellia (par défaut)</div>
              </button>
              <button type="button" className="dash-palette-card" onClick={() => { setPrimaryColor("#1A8754"); setBgColor("#F8F9FA"); setTextColor("#212529"); }}>
                <div className="dash-palette-swatches">
                  <div style={{background:"#1A8754"}}></div>
                  <div style={{background:"#F8F9FA"}}></div>
                  <div style={{background:"#212529"}}></div>
                </div>
                <div className="dash-palette-name">Émeraude</div>
              </button>
              <button type="button" className="dash-palette-card" onClick={() => { setPrimaryColor("#D4AF37"); setBgColor("#FFF8E7"); setTextColor("#1A1611"); }}>
                <div className="dash-palette-swatches">
                  <div style={{background:"#D4AF37"}}></div>
                  <div style={{background:"#FFF8E7"}}></div>
                  <div style={{background:"#1A1611"}}></div>
                </div>
                <div className="dash-palette-name">Or & Ivoire</div>
              </button>
              <button type="button" className="dash-palette-card" onClick={() => { setPrimaryColor("#8B4789"); setBgColor("#FAF5FA"); setTextColor("#2A1A2D"); }}>
                <div className="dash-palette-swatches">
                  <div style={{background:"#8B4789"}}></div>
                  <div style={{background:"#FAF5FA"}}></div>
                  <div style={{background:"#2A1A2D"}}></div>
                </div>
                <div className="dash-palette-name">Aubergine</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "typography" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Police de titres (display)</h3>
                <p className="dash-settings-card-desc">Utilisée pour les titres et accroches. Choisissez une police qui reflète votre identité.</p>
              </div>
            </div>
            <div className="dash-font-grid">
              {fonts.map(f => (
                <button key={f.name} type="button" className={`dash-font-card ${displayFont === f.name ? "active" : ""}`} onClick={() => setDisplayFont(f.name)}>
                  <div className="dash-font-sample" style={{fontFamily: f.name}}>{f.sample}</div>
                  <div className="dash-font-info">
                    <div className="dash-font-name">{f.name}</div>
                    <div className="dash-font-category">{f.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Police du corps de texte</h3>
                <p className="dash-settings-card-desc">Utilisée pour les paragraphes, descriptions, prix.</p>
              </div>
            </div>
            <div className="dash-font-grid">
              {fonts.map(f => (
                <button key={f.name} type="button" className={`dash-font-card ${bodyFont === f.name ? "active" : ""}`} onClick={() => setBodyFont(f.name)}>
                  <div className="dash-font-sample" style={{fontFamily: f.name}}>{f.sample}</div>
                  <div className="dash-font-info">
                    <div className="dash-font-name">{f.name}</div>
                    <div className="dash-font-category">{f.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Aperçu</h3>
              </div>
            </div>
            <div style={{padding:"20px", background:"var(--dash-bg-subtle)", borderRadius:"var(--dash-radius-md)"}}>
              <div style={{fontFamily: displayFont, fontSize:"28px", fontWeight:500, marginBottom:"12px", letterSpacing:"-0.6px"}}>Robe wax Aïda</div>
              <div style={{fontFamily: bodyFont, fontSize:"14px", lineHeight:1.6, color:"var(--dash-text-secondary)"}}>Une robe d&apos;exception en wax authentique, taillée pour les femmes africaines modernes. Coupe ajustée, manches courtes, longueur midi.</div>
              <div style={{fontFamily: displayFont, fontSize:"22px", fontWeight:500, marginTop:"12px"}}>28 500 FCFA</div>
            </div>
          </div>
        </div>
      )}

      {tab === "logo" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Logo principal</h3>
                <p className="dash-settings-card-desc">Affiché en haut de votre boutique. PNG ou SVG recommandé, format horizontal.</p>
              </div>
            </div>
            <div className="dash-upload-zone">
              <div className="dash-upload-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              </div>
              <div className="dash-upload-title">Glissez votre logo ici</div>
              <div className="dash-upload-subtitle">PNG, SVG, JPG · Hauteur recommandée 60px · Max 1 MB</div>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" style={{marginTop:"12px"}}>Sélectionner un fichier</button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Favicon</h3>
                <p className="dash-settings-card-desc">Petite icône affichée dans l&apos;onglet du navigateur. Format carré 32×32 ou 64×64 px.</p>
              </div>
            </div>
            <div className="dash-upload-zone">
              <div className="dash-upload-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div className="dash-upload-title">Ajouter un favicon</div>
              <div className="dash-upload-subtitle">PNG, ICO, SVG · 32×32 ou 64×64 px</div>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" style={{marginTop:"12px"}}>Sélectionner</button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Open Graph (réseaux sociaux)</h3>
                <p className="dash-settings-card-desc">Image affichée quand votre boutique est partagée sur Facebook, WhatsApp, Twitter. Format 1200×630 px.</p>
              </div>
            </div>
            <div className="dash-upload-zone">
              <div className="dash-upload-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
              </div>
              <div className="dash-upload-title">Ajouter une image OG</div>
              <div className="dash-upload-subtitle">JPG, PNG · 1200×630 px recommandé</div>
              <button type="button" className="dash-btn dash-btn-secondary dash-btn-sm" style={{marginTop:"12px"}}>Sélectionner</button>
            </div>
          </div>
        </div>
      )}

      {tab === "layout" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Style du header</h3>
                <p className="dash-settings-card-desc">Comment le menu principal apparaît sur votre boutique.</p>
              </div>
            </div>
            <div className="dash-layout-options">
              <button type="button" className="dash-layout-option active">
                <div className="dash-layout-preview">
                  <div style={{height:"24px", background:"#0E1116", borderTopLeftRadius:"6px", borderTopRightRadius:"6px"}}></div>
                  <div style={{padding:"12px", display:"flex", flexDirection:"column", gap:"6px"}}>
                    <div style={{height:"4px", background:"#E0E0E0", borderRadius:"2px", width:"60%"}}></div>
                    <div style={{height:"4px", background:"#E0E0E0", borderRadius:"2px", width:"80%"}}></div>
                  </div>
                </div>
                <div className="dash-layout-name">Centré minimaliste</div>
              </button>
              <button type="button" className="dash-layout-option">
                <div className="dash-layout-preview">
                  <div style={{height:"24px", background:"#0E1116", borderTopLeftRadius:"6px", borderTopRightRadius:"6px", display:"flex", alignItems:"center", padding:"0 8px"}}>
                    <div style={{height:"4px", background:"#FAFAF7", width:"30%", borderRadius:"2px"}}></div>
                  </div>
                  <div style={{padding:"12px", display:"flex", flexDirection:"column", gap:"6px"}}>
                    <div style={{height:"4px", background:"#E0E0E0", borderRadius:"2px"}}></div>
                  </div>
                </div>
                <div className="dash-layout-name">Logo à gauche</div>
              </button>
              <button type="button" className="dash-layout-option">
                <div className="dash-layout-preview">
                  <div style={{height:"36px", background:"linear-gradient(180deg, #0E1116 50%, #FAFAF7 50%)", borderTopLeftRadius:"6px", borderTopRightRadius:"6px"}}></div>
                  <div style={{padding:"12px", display:"flex", flexDirection:"column", gap:"6px"}}>
                    <div style={{height:"4px", background:"#E0E0E0", borderRadius:"2px"}}></div>
                  </div>
                </div>
                <div className="dash-layout-name">Hero pleine largeur</div>
              </button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Position du panier</h3>
              </div>
            </div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Panier flottant en bas à droite</div>
                <div className="dash-toggle-info-desc">Bouton panier toujours visible, idéal mobile.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>
            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Mini-cart slide depuis la droite</div>
                <div className="dash-toggle-info-desc">Au clic sur le panier, glisse depuis le côté droit.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Type de footer</h3>
              </div>
            </div>
            <div className="dash-form-row">
              <select className="dash-form-select" defaultValue="full">
                <option value="full">Footer complet (4 colonnes)</option>
                <option value="minimal">Minimal (logo + liens essentiels)</option>
                <option value="newsletter">Avec newsletter signup</option>
                <option value="none">Aucun footer</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {tab === "banner" && (
        <div className="dash-settings-section dash-animate-fade-up">
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Banner promotionnel</h3>
                <p className="dash-settings-card-desc">Bandeau affiché tout en haut de votre boutique pour annoncer une promo, un événement ou une info importante.</p>
              </div>
            </div>

            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Activer le banner</div>
                <div className="dash-toggle-info-desc">Le banner apparaîtra immédiatement après publication.</div>
              </div>
              <button type="button" className="dash-switch active"></button>
            </div>

            <div className="dash-form-section-divider"></div>

            <div className="dash-form-row">
              <label htmlFor="banner-msg" className="dash-form-label">Message du banner</label>
              <input id="banner-msg" type="text" className="dash-form-input" defaultValue="🎉 Soldes de printemps : -30% sur la collection Robes — Code BIENVENUE10" />
              <p className="dash-form-help">Recommandé : 50-80 caractères pour un affichage optimal.</p>
            </div>

            <div className="dash-form-row-split">
              <div className="dash-form-row">
                <label htmlFor="banner-bg" className="dash-form-label">Couleur de fond</label>
                <div className="dash-color-picker-wrap">
                  <input id="banner-bg" type="color" className="dash-color-picker" defaultValue="#0E1116" />
                  <input type="text" className="dash-form-input" defaultValue="#0E1116" style={{fontFamily:"'JetBrains Mono', monospace"}} />
                </div>
              </div>
              <div className="dash-form-row">
                <label htmlFor="banner-fg" className="dash-form-label">Couleur du texte</label>
                <div className="dash-color-picker-wrap">
                  <input id="banner-fg" type="color" className="dash-color-picker" defaultValue="#FAFAF7" />
                  <input type="text" className="dash-form-input" defaultValue="#FAFAF7" style={{fontFamily:"'JetBrains Mono', monospace"}} />
                </div>
              </div>
            </div>

            <div className="dash-form-row">
              <label htmlFor="banner-link" className="dash-form-label">Lien (optionnel)</label>
              <input id="banner-link" type="text" className="dash-form-input" placeholder="/promo-printemps" />
            </div>

            <div className="dash-form-section-divider"></div>

            <h4 className="dash-form-subsection-title">Aperçu</h4>
            <div style={{background:"#0E1116", color:"#FAFAF7", padding:"10px 16px", borderRadius:"var(--dash-radius-md)", fontSize:"13px", textAlign:"center", fontWeight:500}}>
              🎉 Soldes de printemps : -30% sur la collection Robes — Code BIENVENUE10
            </div>
          </div>
        </div>
      )}
    </>
  );
}
