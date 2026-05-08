"use client";

import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  productEditSchema,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  type ProductEditInput,
} from "@/lib/validations/personnalisation";
import {
  X,
  Trash2,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Layers,
  Package as PackageIcon,
  Truck,
  Box,
  Sparkles,
  Hash,
  Link2,
  Download,
  Cloud,
  Briefcase,
  ChevronDown,
  Check,
  Shirt,
  UtensilsCrossed,
  Smartphone,
  Palette,
  Gem,
  Home,
  Dumbbell,
  Baby,
  Wrench,
  Boxes,
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import AiDescriptionGenerator from "./AiDescriptionGenerator";
import ProductGallery from "./ProductGallery";

interface Props {
  product: ProductEditInput;
  shopContext?: { name: string | null; category: string | null };
  onSave: (p: ProductEditInput) => void;
  onDelete: () => void;
  onClose: () => void;
}

const TYPE_ICONS = {
  physical: PackageIcon,
  digital: Cloud,
  service: Briefcase,
} as const;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Shirt,
  Sparkle: Sparkles,
  UtensilsCrossed,
  Smartphone,
  Palette,
  Gem,
  Home,
  Dumbbell,
  Baby,
  Wrench,
  Boxes,
};

interface CategorySelectProps {
  value: string | undefined;
  onChange: (code: ProductEditInput["category"] | undefined) => void;
}

function CategorySelect({ value, onChange }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const selected = PRODUCT_CATEGORIES.find((c) => c.code === value);
  const SelectedIcon = selected ? (CATEGORY_ICONS[selected.iconName] ?? Boxes) : null;

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  return (
    <div className="perso-category-select">
      {open && (
        <div
          className="perso-category-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <button
        type="button"
        className={`perso-category-trigger ${open ? "is-open" : ""} ${selected ? "is-selected" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="perso-category-trigger-content">
          <span className="perso-category-trigger-icon">
            {SelectedIcon ? <SelectedIcon size={15} strokeWidth={2} /> : <Boxes size={15} strokeWidth={2} />}
          </span>
          <span
            className={`perso-category-trigger-label ${!selected ? "perso-category-trigger-placeholder" : ""}`}
          >
            {selected ? selected.label : "— Choisis une catégorie —"}
          </span>
        </span>
        <ChevronDown size={16} strokeWidth={2} className="perso-category-chevron" />
      </button>

      {open && (
        <div className="perso-category-popover" role="listbox">
          <button
            type="button"
            className={`perso-category-option ${value === undefined ? "is-selected" : ""}`}
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            role="option"
            aria-selected={value === undefined}
          >
            <span className="perso-category-option-icon" style={{ opacity: 0.35 }} aria-hidden>
              <Boxes size={16} strokeWidth={2} />
            </span>
            <span className="perso-category-option-label" style={{ color: "#8B8E94", fontWeight: 400 }}>
              — Aucune catégorie —
            </span>
            {value === undefined && (
              <Check size={15} strokeWidth={2.5} className="perso-category-option-check" />
            )}
          </button>
          {PRODUCT_CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.iconName] ?? Boxes;
            const isSelected = c.code === value;
            return (
              <button
                key={c.code}
                type="button"
                className={`perso-category-option ${isSelected ? "is-selected" : ""}`}
                onClick={() => {
                  onChange(c.code as ProductEditInput["category"]);
                  setOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <span className="perso-category-option-icon">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className="perso-category-option-label">{c.label}</span>
                {isSelected && (
                  <Check size={15} strokeWidth={2.5} className="perso-category-option-check" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductEditorModal({
  product,
  shopContext,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<ProductEditInput>(product);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setDraft(product);
    setError(null);
    setTagInput("");
  }, [product]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const update = <K extends keyof ProductEditInput>(key: K, val: ProductEditInput[K]) => {
    setDraft((d) => ({ ...d, [key]: val }));
  };

  const addTag = () => {
    const v = tagInput.trim().slice(0, 30);
    if (!v) return;
    if (draft.tags.includes(v)) return;
    if (draft.tags.length >= 10) return;
    update("tags", [...draft.tags, v]);
    setTagInput("");
  };

  const removeTag = (t: string) => {
    update(
      "tags",
      draft.tags.filter((x) => x !== t),
    );
  };

  const handleSave = () => {
    const parsed = productEditSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vérifie les champs");
      return;
    }
    onSave(parsed.data);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="perso-modal-overlay" onClick={handleOverlayClick} role="presentation">
      <div className="perso-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="perso-modal-header">
          <h2 className="perso-modal-title">{draft.name || "Nouveau produit"}</h2>
          <button type="button" className="perso-modal-close" onClick={onClose} aria-label="Fermer">
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="perso-modal-body">
          <div className="perso-form-section">
            <h3 className="perso-form-section-title-icon">
              <Layers size={14} strokeWidth={2} />
              Type de produit
            </h3>
            <div className="perso-type-selector">
              {PRODUCT_TYPES.map((t) => {
                const Icon = TYPE_ICONS[t.code as keyof typeof TYPE_ICONS];
                return (
                  <button
                    key={t.code}
                    type="button"
                    className={`perso-type-option ${draft.type === t.code ? "is-active" : ""}`}
                    onClick={() => update("type", t.code)}
                  >
                    <div className="perso-type-option-icon-premium">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <div className="perso-type-option-label">{t.label}</div>
                    <div className="perso-type-option-desc">{t.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="perso-form-section">
            <h3 className="perso-form-section-title-icon">
              <Sparkles size={14} strokeWidth={2} />
              Identité
            </h3>

            <div className="perso-form-row">
              <label className="perso-form-label">Nom du produit *</label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ex : Robe pagne moderne taille M"
                className="perso-input"
                maxLength={120}
              />
            </div>

            <div className="perso-form-row">
              <label className="perso-form-label">
                Description courte <span className="perso-form-label-optional">(optionnel)</span>
              </label>
              <input
                type="text"
                value={draft.shortDescription ?? ""}
                onChange={(e) => update("shortDescription", e.target.value)}
                placeholder="Une phrase d&apos;accroche pour la liste produits"
                className="perso-input"
                maxLength={200}
              />
              <p className="perso-form-help">Affichée sur la liste des produits. Max 200 caractères.</p>
            </div>

            <div className="perso-form-row">
              <label className="perso-form-label">Description complète</label>

              <AiDescriptionGenerator
                productName={draft.name}
                productCategory={draft.category}
                productType={draft.type}
                shopName={shopContext?.name}
                shopCategory={shopContext?.category}
                onApply={(html) => update("description", html)}
              />

              <RichTextEditor
                value={draft.description ?? ""}
                onChange={(html) => update("description", html)}
                placeholder="Décris ton produit en détail : matières, dimensions, ce qu'il apporte au client..."
              />
              <p className="perso-form-help">
                Astuce : tu peux générer une description avec l&apos;IA puis l&apos;ajuster à ta voix.
              </p>
            </div>
          </div>

          {/* SECTION IMAGES — Principale + galerie 4 photos */}
          <div className="perso-form-section">
            <h3 className="perso-form-section-title-icon">
              <ImageIcon size={14} strokeWidth={2} />
              Photos du produit
            </h3>
            <ProductGallery
              imageUrl={draft.imageUrl ?? null}
              galleryUrls={draft.galleryUrls ?? []}
              onChange={({ imageUrl, galleryUrls }) => {
                setDraft((d) => ({ ...d, imageUrl, galleryUrls }));
              }}
            />
            <p className="perso-form-help" style={{ marginTop: 12 }}>
              Ajoute jusqu&apos;à 5 photos. La première sera l&apos;image de couverture affichée dans la liste de tes
              produits.
            </p>
          </div>

          <div className="perso-form-section">
            <h3 className="perso-form-section-title-icon">
              <DollarSign size={14} strokeWidth={2} />
              Tarification
            </h3>

            <div className="perso-form-row-double">
              <div>
                <label className="perso-form-label">Prix * (FCFA)</label>
                <input
                  type="number"
                  value={draft.price || ""}
                  onChange={(e) => update("price", parseInt(e.target.value, 10) || 0)}
                  placeholder="5000"
                  className="perso-input"
                  min={100}
                  step={100}
                />
              </div>
              <div>
                <label className="perso-form-label">
                  Prix barré <span className="perso-form-label-optional">(optionnel)</span>
                </label>
                <input
                  type="number"
                  value={draft.comparePrice ?? ""}
                  onChange={(e) =>
                    update("comparePrice", e.target.value ? parseInt(e.target.value, 10) : null)
                  }
                  placeholder="7000"
                  className="perso-input"
                  min={0}
                  step={100}
                />
              </div>
            </div>
            <p className="perso-form-help">Le prix barré affiche une remise visible (ancien prix rayé).</p>
          </div>

          <div className="perso-form-section">
            <h3 className="perso-form-section-title-icon">
              <Tag size={14} strokeWidth={2} />
              Catégorisation
            </h3>

            <div className="perso-form-row">
              <label className="perso-form-label">Catégorie</label>
              <CategorySelect
                value={draft.category}
                onChange={(code) => update("category", code)}
              />
            </div>

            {draft.category === "autre" && (
              <div className="perso-form-row">
                <label className="perso-form-label">Catégorie personnalisée</label>
                <input
                  type="text"
                  value={draft.customCategory ?? ""}
                  onChange={(e) => update("customCategory", e.target.value)}
                  placeholder="Ex : Outils de jardinage"
                  className="perso-input"
                  maxLength={60}
                />
              </div>
            )}

            <div className="perso-form-row">
              <label className="perso-form-label">
                Tags <span className="perso-form-label-optional">(optionnel, max 10)</span>
              </label>
              <div className="perso-tags-input">
                {draft.tags.map((t) => (
                  <span key={t} className="perso-tag">
                    {t}
                    <button
                      type="button"
                      className="perso-tag-remove"
                      onClick={() => removeTag(t)}
                      aria-label={`Retirer ${t}`}
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder={draft.tags.length === 0 ? "Tape un tag puis Entrée" : ""}
                  className="perso-tags-input-field"
                  disabled={draft.tags.length >= 10}
                />
              </div>
              <p className="perso-form-help">Les tags aident tes clients à retrouver le produit.</p>
            </div>
          </div>

          <div className="perso-form-section">
            <h3 className="perso-form-section-title-icon">
              <Box size={14} strokeWidth={2} />
              Inventaire & Logistique
            </h3>

            <div className="perso-form-row">
              <label className="perso-form-label perso-form-label-with-icon">
                <Hash size={14} strokeWidth={2} />
                SKU{" "}
                <span className="perso-form-label-optional">(optionnel)</span>
              </label>
              <input
                type="text"
                value={draft.sku ?? ""}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="Ex : ROBE-PAGNE-M-001"
                className="perso-input"
                maxLength={30}
              />
              <p className="perso-form-help">Code interne pour identifier le produit dans tes stocks.</p>
            </div>

            <div className="perso-toggle-row">
              <div className="perso-toggle-info">
                <div className="perso-toggle-label perso-toggle-label-with-icon">
                  <PackageIcon size={14} strokeWidth={2} />
                  Stock illimité
                </div>
                <div className="perso-toggle-help">Désactive si tu veux suivre la quantité disponible.</div>
              </div>
              <label className="perso-toggle">
                <input
                  type="checkbox"
                  checked={draft.unlimitedStock}
                  onChange={(e) => update("unlimitedStock", e.target.checked)}
                />
                <span className="perso-toggle-slider"></span>
              </label>
            </div>

            {!draft.unlimitedStock && (
              <div className="perso-form-row">
                <label className="perso-form-label">Quantité en stock *</label>
                <input
                  type="number"
                  value={draft.stock ?? ""}
                  onChange={(e) => update("stock", e.target.value ? parseInt(e.target.value, 10) : 0)}
                  placeholder="0"
                  className="perso-input"
                  min={0}
                />
              </div>
            )}

            {draft.type === "physical" && (
              <div className="perso-form-row">
                <label className="perso-form-label perso-form-label-with-icon">
                  <Truck size={14} strokeWidth={2} />
                  Poids{" "}
                  <span className="perso-form-label-optional">(optionnel, en grammes)</span>
                </label>
                <input
                  type="number"
                  value={draft.weight ?? ""}
                  onChange={(e) => update("weight", e.target.value ? parseInt(e.target.value, 10) : null)}
                  placeholder="500"
                  className="perso-input"
                  min={0}
                />
                <p className="perso-form-help">Servira au calcul automatique de la livraison plus tard.</p>
              </div>
            )}
          </div>

          {draft.type === "digital" && (
            <div className="perso-form-section">
              <h3 className="perso-form-section-title-icon">
                <Cloud size={14} strokeWidth={2} />
                Livraison digitale
              </h3>

              <div className="perso-form-row">
                <label className="perso-form-label perso-form-label-with-icon">
                  <Link2 size={14} strokeWidth={2} />
                  Lien du fichier à livrer{" "}
                  <span className="perso-form-label-optional">(optionnel)</span>
                </label>
                <input
                  type="url"
                  value={draft.digitalFileUrl ?? ""}
                  onChange={(e) => update("digitalFileUrl", e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="perso-input"
                />
                <p className="perso-form-help">
                  Le client recevra ce lien après paiement. (Upload direct disponible bientôt.)
                </p>
              </div>

              <div className="perso-form-row">
                <label className="perso-form-label perso-form-label-with-icon">
                  <Download size={14} strokeWidth={2} />
                  Limite de téléchargements{" "}
                  <span className="perso-form-label-optional">(optionnel)</span>
                </label>
                <input
                  type="number"
                  value={draft.downloadLimit ?? ""}
                  onChange={(e) =>
                    update("downloadLimit", e.target.value ? parseInt(e.target.value, 10) : null)
                  }
                  placeholder="5"
                  className="perso-input"
                  min={0}
                />
              </div>
            </div>
          )}

          <div className="perso-form-section">
            <h3 className="perso-form-section-title-icon">
              <Link2 size={14} strokeWidth={2} />
              URL du produit
            </h3>
            <div className="perso-form-row">
              <label className="perso-form-label">
                Slug <span className="perso-form-label-optional">(optionnel — généré auto si vide)</span>
              </label>
              <input
                type="text"
                value={draft.slug ?? ""}
                onChange={(e) =>
                  update(
                    "slug",
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                      .slice(0, 60),
                  )
                }
                placeholder="robe-pagne-moderne"
                className="perso-input"
                maxLength={60}
              />
            </div>
          </div>

          {error && <div className="perso-alert-error perso-alert-error-inline">{error}</div>}
        </div>

        <footer className="perso-modal-footer">
          <button
            type="button"
            className="perso-btn perso-btn-ghost perso-btn-icon"
            onClick={onDelete}
            style={{ color: "#DC2626" }}
          >
            <Trash2 size={14} strokeWidth={2} />
            Supprimer
          </button>
          <div className="perso-modal-footer-spacer"></div>
          <button type="button" className="perso-btn perso-btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="perso-btn perso-btn-primary" onClick={handleSave}>
            Enregistrer
          </button>
        </footer>
      </div>
    </div>
  );
}
