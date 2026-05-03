"use client";

import Link from "next/link";
import { useState } from "react";

type ProductType = "physical" | "digital";

export default function NewProductPage() {
  const [productType, setProductType] = useState<ProductType>("physical");
  const [step, setStep] = useState(1);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  // Form data — communs
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    sku: "",
    seoTitle: "",
    seoDescription: "",
    // Physique
    stock: "",
    weight: "",
    requiresShipping: true,
    hasVariants: false,
    // Digital
    fileUrl: "",
    fileName: "",
    downloadLimit: "3",
    accessExpiresIn: "0",
    licenseType: "single",
  });

  const handleGenerate = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      if (productType === "physical") {
        setFormData({
          ...formData,
          name: "Robe wax Aïda — Édition signature",
          description: "Une robe d'exception en wax authentique, taillée pour les femmes africaines modernes. Coupe ajustée, manches courtes, longueur midi parfaite pour les événements et le quotidien chic. Tissu 100% coton certifié, motifs traditionnels revisités par notre atelier dakarois.",
          category: "Robes",
          price: "28500",
          stock: "20",
          weight: "450",
          sku: "AIDA-WAX-2026",
          seoTitle: "Robe wax Aïda — Mode féminine africaine moderne | Maison Aïda",
          seoDescription: "Découvrez la robe wax Aïda, pièce signature de notre collection 2026. Tissu authentique, coupe parfaite, livraison Mobile Money disponible.",
        });
      } else {
        setFormData({
          ...formData,
          name: "Guide complet : Lancer son e-commerce en Afrique",
          description: "Un guide PDF de 120 pages écrit par des entrepreneurs africains à succès. Stratégies marketing, choix des fournisseurs, fiscalité, financement, témoignages. Inclut un kit Notion + 3 templates de business plan + accès au groupe privé.",
          category: "Ebooks",
          price: "15000",
          fileName: "guide-ecommerce-afrique-2026.pdf",
          fileUrl: "/uploads/guide-ecommerce-2026.pdf",
          downloadLimit: "3",
          accessExpiresIn: "365",
          licenseType: "single",
          seoTitle: "Guide PDF : Lancer son e-commerce en Afrique 2026",
          seoDescription: "Téléchargez le guide complet pour lancer votre boutique en ligne en Afrique. 120 pages, templates inclus, accès au groupe privé.",
        });
      }
      setIsGenerating(false);
      setAiGenerated(true);
    }, 2000);
  };

  const totalSteps = productType === "physical" ? 4 : 4;
  const stepLabels = productType === "physical"
    ? ["Informations", "Médias", "Tarification & Stock", "Livraison & SEO"]
    : ["Informations", "Fichier produit", "Tarification & Licence", "SEO"];

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <Link href="/dashboard/produits" className="dash-back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Retour aux produits
          </Link>
          <div className="dash-page-eyebrow">— Nouveau produit</div>
          <h1 className="dash-page-title">Ajouter un produit</h1>
          <p className="dash-page-subtitle">Choisissez le type de produit puis remplissez les informations. L&apos;IA Sellia peut générer une fiche complète en 2 secondes.</p>
        </div>
      </div>

      {/* TYPE TOGGLE — Physical vs Digital */}
      <div className="dash-product-type-card dash-animate-fade-up dash-animate-delay-1">
        <div className="dash-product-type-header">
          <div className="dash-product-type-eyebrow">Type de produit</div>
          <h2 className="dash-product-type-title">Que vendez-vous ?</h2>
        </div>
        <div className="dash-product-type-grid">
          <button
            className={`dash-product-type-option ${productType === "physical" ? "active" : ""}`}
            onClick={() => setProductType("physical")}
            type="button"
          >
            <div className="dash-product-type-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div className="dash-product-type-content">
              <div className="dash-product-type-name">Produit physique</div>
              <div className="dash-product-type-desc">Vêtements, accessoires, bijoux, objets à expédier</div>
              <div className="dash-product-type-tags">
                <span className="dash-product-type-tag">Stock</span>
                <span className="dash-product-type-tag">Livraison</span>
                <span className="dash-product-type-tag">Variantes</span>
              </div>
            </div>
            <div className="dash-product-type-radio">
              {productType === "physical" && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </div>
          </button>

          <button
            className={`dash-product-type-option ${productType === "digital" ? "active" : ""}`}
            onClick={() => setProductType("digital")}
            type="button"
          >
            <div className="dash-product-type-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </div>
            <div className="dash-product-type-content">
              <div className="dash-product-type-name">Produit digital</div>
              <div className="dash-product-type-desc">Ebooks, formations, templates, audio, vidéos</div>
              <div className="dash-product-type-tags">
                <span className="dash-product-type-tag">Téléchargement</span>
                <span className="dash-product-type-tag">Licence</span>
                <span className="dash-product-type-tag">Stock illimité</span>
              </div>
            </div>
            <div className="dash-product-type-radio">
              {productType === "digital" && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* AI Generation Card */}
      <div className="dash-ai-card dash-animate-fade-up dash-animate-delay-2">
        <div className="dash-ai-card-glow"></div>
        <div className="dash-ai-card-inner">
          <div className="dash-ai-card-header">
            <div className="dash-ai-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div>
              <div className="dash-ai-eyebrow">
                <span className="dash-ai-eyebrow-pulse"></span>
                Sellia AI · Génération automatique
              </div>
              <h2 className="dash-ai-title">Décrivez votre {productType === "physical" ? "produit" : "produit digital"}, <em>l&apos;IA fait le reste</em></h2>
              <p className="dash-ai-subtitle">{productType === "physical" ? "Nom, description, prix, SEO, catégorie. Tout généré à partir d'une simple description." : "Nom, description optimisée, prix suggéré, paramètres de licence. Tout en 2 secondes."}</p>
            </div>
          </div>

          <div className="dash-ai-input-wrap">
            <textarea
              className="dash-ai-textarea"
              placeholder={productType === "physical" ? "Exemple : Une robe en wax que je vends 28 500 FCFA, coupe ajustée, idéale pour les femmes 25-40 ans..." : "Exemple : Un guide PDF de 120 pages sur le e-commerce en Afrique, à 15 000 FCFA, avec templates Notion inclus..."}
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              rows={3}
              disabled={isGenerating}
            />
            <button
              className="dash-ai-generate-btn"
              onClick={handleGenerate}
              disabled={!aiPrompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="dash-ai-spinner"></span>
                  Génération en cours...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Générer avec l&apos;IA
                </>
              )}
            </button>
          </div>

          {aiGenerated && (
            <div className="dash-ai-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Fiche {productType === "physical" ? "produit" : "digitale"} générée. Vérifiez les champs et publiez.</span>
            </div>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="dash-stepper dash-animate-fade-up dash-animate-delay-3">
        {stepLabels.map((label, i) => {
          const stepNum = i + 1;
          return (
            <div key={stepNum} className="dash-stepper-item">
              <button
                className={`dash-stepper-step ${step === stepNum ? "active" : step > stepNum ? "done" : ""}`}
                onClick={() => setStep(stepNum)}
              >
                <div className="dash-stepper-marker">
                  {step > stepNum ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : stepNum}
                </div>
                <span className="dash-stepper-label">{label}</span>
              </button>
              {i < stepLabels.length - 1 && <div className={`dash-stepper-line ${step > stepNum ? "done" : ""}`}></div>}
            </div>
          );
        })}
      </div>

      {/* Form */}
      <div className="dash-form-card dash-animate-fade-up dash-animate-delay-4">
        {/* ÉTAPE 1 — Informations (commune) */}
        {step === 1 && (
          <div className="dash-form-section">
            <h3 className="dash-form-section-title">Informations principales</h3>
            <p className="dash-form-section-desc">Visible par vos clients sur votre boutique.</p>

            <div className="dash-form-row">
              <label className="dash-form-label">Nom du {productType === "physical" ? "produit" : "produit digital"} *</label>
              <input
                type="text"
                className="dash-form-input"
                placeholder={productType === "physical" ? "Robe wax Aïda" : "Guide complet e-commerce Afrique"}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="dash-form-row">
              <label className="dash-form-label">Description *</label>
              <textarea
                className="dash-form-textarea"
                placeholder="Décrivez votre produit en détail..."
                rows={5}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <p className="dash-form-help">Utilisez 2-3 paragraphes pour mettre en valeur votre produit.</p>
            </div>

            <div className="dash-form-row">
              <label className="dash-form-label">Catégorie *</label>
              <select className="dash-form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="">Sélectionner une catégorie</option>
                {productType === "physical" ? (
                  <>
                    <option value="Robes">Robes</option>
                    <option value="Accessoires">Accessoires</option>
                    <option value="Bijoux">Bijoux</option>
                    <option value="Chaussures">Chaussures</option>
                  </>
                ) : (
                  <>
                    <option value="Ebooks">Ebooks</option>
                    <option value="Formations">Formations vidéo</option>
                    <option value="Templates">Templates</option>
                    <option value="Audio">Audio / Musique</option>
                    <option value="Logiciels">Logiciels</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Médias OU Fichier produit */}
        {step === 2 && productType === "physical" && (
          <div className="dash-form-section">
            <h3 className="dash-form-section-title">Photos du produit</h3>
            <p className="dash-form-section-desc">Ajoutez jusqu&apos;à 8 photos. La première sera utilisée comme image principale.</p>
            <div className="dash-upload-zone">
              <div className="dash-upload-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              </div>
              <div className="dash-upload-title">Glissez vos photos ici</div>
              <div className="dash-upload-subtitle">ou cliquez pour parcourir · JPG, PNG, WebP · Max 5 MB</div>
              <button className="dash-btn dash-btn-secondary dash-btn-sm" style={{marginTop:"12px"}}>Sélectionner des fichiers</button>
            </div>
          </div>
        )}

        {step === 2 && productType === "digital" && (
          <div className="dash-form-section">
            <h3 className="dash-form-section-title">Fichier à livrer</h3>
            <p className="dash-form-section-desc">Le fichier que recevra le client après paiement. Lien unique sécurisé généré automatiquement.</p>

            <div className="dash-upload-zone dash-upload-zone-digital">
              <div className="dash-upload-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div className="dash-upload-title">{formData.fileName || "Glissez votre fichier produit"}</div>
              <div className="dash-upload-subtitle">PDF, ZIP, MP4, MP3, EPUB · Max 500 MB</div>
              <button className="dash-btn dash-btn-secondary dash-btn-sm" style={{marginTop:"12px"}}>Sélectionner un fichier</button>
            </div>

            <div className="dash-form-section-divider"></div>

            <h4 className="dash-form-subsection-title">Aperçu / Preview</h4>
            <p className="dash-form-section-desc" style={{fontSize:"12px"}}>Optionnel : montrez les premières pages, un extrait, une bande-annonce.</p>
            <div className="dash-upload-zone" style={{padding:"24px 16px"}}>
              <div className="dash-upload-subtitle">Aperçu PDF, vidéo trailer, ou capture d&apos;écran (max 50 MB)</div>
              <button className="dash-btn dash-btn-secondary dash-btn-sm" style={{marginTop:"10px"}}>Ajouter un aperçu</button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — Tarification + Stock OU Tarification + Licence */}
        {step === 3 && productType === "physical" && (
          <div className="dash-form-section">
            <h3 className="dash-form-section-title">Tarification & Stock</h3>
            <p className="dash-form-section-desc">Prix de vente et quantité disponible.</p>

            <div className="dash-form-row-split">
              <div className="dash-form-row">
                <label className="dash-form-label">Prix de vente *</label>
                <div className="dash-form-input-group">
                  <input type="number" className="dash-form-input" placeholder="28500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  <span className="dash-form-input-suffix">FCFA</span>
                </div>
              </div>
              <div className="dash-form-row">
                <label className="dash-form-label">SKU</label>
                <input type="text" className="dash-form-input" placeholder="AIDA-WAX-2026" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
            </div>

            <div className="dash-form-row-split">
              <div className="dash-form-row">
                <label className="dash-form-label">Stock initial *</label>
                <div className="dash-form-input-group">
                  <input type="number" className="dash-form-input" placeholder="20" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                  <span className="dash-form-input-suffix">unités</span>
                </div>
                <p className="dash-form-help">Mis à jour automatiquement après chaque vente.</p>
              </div>
              <div className="dash-form-row">
                <label className="dash-form-label">Poids unitaire</label>
                <div className="dash-form-input-group">
                  <input type="number" className="dash-form-input" placeholder="450" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                  <span className="dash-form-input-suffix">grammes</span>
                </div>
                <p className="dash-form-help">Utilisé pour calculer les frais de livraison.</p>
              </div>
            </div>

            <div className="dash-form-section-divider"></div>

            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Ce produit a des variantes</div>
                <div className="dash-toggle-info-desc">Tailles, couleurs, modèles différents avec leurs propres prix et stocks.</div>
              </div>
              <button
                type="button"
                className={`dash-switch ${formData.hasVariants ? "active" : ""}`}
                onClick={() => setFormData({...formData, hasVariants: !formData.hasVariants})}
              ></button>
            </div>
          </div>
        )}

        {step === 3 && productType === "digital" && (
          <div className="dash-form-section">
            <h3 className="dash-form-section-title">Tarification & Licence</h3>
            <p className="dash-form-section-desc">Prix et conditions d&apos;accès pour vos clients.</p>

            <div className="dash-form-row">
              <label className="dash-form-label">Prix de vente *</label>
              <div className="dash-form-input-group">
                <input type="number" className="dash-form-input" placeholder="15000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <span className="dash-form-input-suffix">FCFA</span>
              </div>
            </div>

            <div className="dash-form-section-divider"></div>

            <h4 className="dash-form-subsection-title">Conditions d&apos;accès</h4>

            <div className="dash-form-row-split">
              <div className="dash-form-row">
                <label className="dash-form-label">Limite de téléchargements</label>
                <select className="dash-form-select" value={formData.downloadLimit} onChange={e => setFormData({...formData, downloadLimit: e.target.value})}>
                  <option value="0">Illimité</option>
                  <option value="1">1 téléchargement</option>
                  <option value="3">3 téléchargements</option>
                  <option value="5">5 téléchargements</option>
                  <option value="10">10 téléchargements</option>
                </select>
              </div>
              <div className="dash-form-row">
                <label className="dash-form-label">Expiration de l&apos;accès</label>
                <select className="dash-form-select" value={formData.accessExpiresIn} onChange={e => setFormData({...formData, accessExpiresIn: e.target.value})}>
                  <option value="0">Pas d&apos;expiration</option>
                  <option value="30">30 jours</option>
                  <option value="90">90 jours</option>
                  <option value="180">6 mois</option>
                  <option value="365">1 an</option>
                </select>
              </div>
            </div>

            <div className="dash-form-row">
              <label className="dash-form-label">Type de licence</label>
              <div className="dash-license-grid">
                <button
                  type="button"
                  className={`dash-license-option ${formData.licenseType === "single" ? "active" : ""}`}
                  onClick={() => setFormData({...formData, licenseType: "single"})}
                >
                  <div className="dash-license-name">Personnelle</div>
                  <div className="dash-license-desc">1 utilisateur · usage privé</div>
                </button>
                <button
                  type="button"
                  className={`dash-license-option ${formData.licenseType === "extended" ? "active" : ""}`}
                  onClick={() => setFormData({...formData, licenseType: "extended"})}
                >
                  <div className="dash-license-name">Étendue</div>
                  <div className="dash-license-desc">Usage commercial autorisé</div>
                </button>
                <button
                  type="button"
                  className={`dash-license-option ${formData.licenseType === "team" ? "active" : ""}`}
                  onClick={() => setFormData({...formData, licenseType: "team"})}
                >
                  <div className="dash-license-name">Équipe</div>
                  <div className="dash-license-desc">Jusqu&apos;à 10 utilisateurs</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 — Livraison + SEO (physique) ou SEO seul (digital) */}
        {step === 4 && productType === "physical" && (
          <div className="dash-form-section">
            <h3 className="dash-form-section-title">Livraison</h3>
            <p className="dash-form-section-desc">Configurez les options de livraison pour ce produit.</p>

            <div className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">Ce produit nécessite une livraison</div>
                <div className="dash-toggle-info-desc">Les frais de livraison seront calculés selon vos zones configurées.</div>
              </div>
              <button
                type="button"
                className={`dash-switch ${formData.requiresShipping ? "active" : ""}`}
                onClick={() => setFormData({...formData, requiresShipping: !formData.requiresShipping})}
              ></button>
            </div>

            <div className="dash-form-section-divider"></div>

            <h3 className="dash-form-section-title">Référencement Google (SEO)</h3>
            <p className="dash-form-section-desc">Ces informations aident Google à proposer votre produit dans les recherches.</p>

            <div className="dash-form-row">
              <label className="dash-form-label">Titre SEO</label>
              <input type="text" className="dash-form-input" placeholder="Robe wax Aïda — Mode féminine africaine" value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} />
              <p className="dash-form-help">Recommandé : 50-60 caractères.</p>
            </div>

            <div className="dash-form-row">
              <label className="dash-form-label">Meta description</label>
              <textarea className="dash-form-textarea" placeholder="Découvrez la robe wax Aïda..." rows={3} value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} />
              <p className="dash-form-help">Recommandé : 150-160 caractères.</p>
            </div>

            <div className="dash-form-preview">
              <div className="dash-form-preview-label">Aperçu Google</div>
              <div className="dash-google-preview">
                <div className="dash-google-url">maison-aida.getsellia.com › produits</div>
                <div className="dash-google-title">{formData.seoTitle || "Titre du produit"}</div>
                <div className="dash-google-desc">{formData.seoDescription || "Description courte du produit..."}</div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && productType === "digital" && (
          <div className="dash-form-section">
            <h3 className="dash-form-section-title">Référencement Google (SEO)</h3>
            <p className="dash-form-section-desc">Ces informations aident Google à proposer votre produit dans les recherches.</p>

            <div className="dash-form-row">
              <label className="dash-form-label">Titre SEO</label>
              <input type="text" className="dash-form-input" placeholder="Guide PDF e-commerce Afrique" value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} />
              <p className="dash-form-help">Recommandé : 50-60 caractères.</p>
            </div>

            <div className="dash-form-row">
              <label className="dash-form-label">Meta description</label>
              <textarea className="dash-form-textarea" placeholder="Téléchargez le guide complet..." rows={3} value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} />
              <p className="dash-form-help">Recommandé : 150-160 caractères.</p>
            </div>

            <div className="dash-form-preview">
              <div className="dash-form-preview-label">Aperçu Google</div>
              <div className="dash-google-preview">
                <div className="dash-google-url">maison-aida.getsellia.com › digital</div>
                <div className="dash-google-title">{formData.seoTitle || "Titre du produit digital"}</div>
                <div className="dash-google-desc">{formData.seoDescription || "Description courte..."}</div>
              </div>
            </div>
          </div>
        )}

        <div className="dash-form-actions">
          {step > 1 && (
            <button className="dash-btn dash-btn-secondary" onClick={() => setStep(step - 1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Précédent
            </button>
          )}
          <div style={{marginLeft:"auto", display:"flex", gap:"8px"}}>
            <button className="dash-btn dash-btn-ghost">Enregistrer brouillon</button>
            {step < totalSteps ? (
              <button className="dash-btn dash-btn-ember" onClick={() => setStep(step + 1)}>
                Suivant
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ) : (
              <button className="dash-btn dash-btn-ember">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Publier le produit
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
