"use client";

import { useState } from "react";
import {
  Palette,
  Check,
  Image as ImageIcon,
  Type,
  Sparkles,
  Upload,
  Loader2,
} from "lucide-react";
import StepNav from "./StepNav";
import type { StepAppearanceInput } from "@/lib/validations/personnalisation";
import { resolveHeroImageUrl } from "@/lib/ai/hero-image-url";
import styles from "./StepAppearance.module.css";

interface Props {
  value: StepAppearanceInput;
  onChange: (value: StepAppearanceInput) => void;
  onNext: () => void;
  onBack: () => void;
  /** Boutique déjà publiée (régénération via API shop par slug) */
  shopSlug?: string | null;
}

const COLOR_PALETTES = [
  { name: "Ember", primary: "#E84B1F", accent: "#0A0E13" },
  { name: "Royal Purple", primary: "#2C1A4E", accent: "#0A0E13" },
  { name: "Forest", primary: "#16A34A", accent: "#0A0E13" },
  { name: "Sunset", primary: "#F59E0B", accent: "#0A0E13" },
  { name: "Ocean", primary: "#0EA5E9", accent: "#0A0E13" },
  { name: "Rose", primary: "#E11D48", accent: "#0A0E13" },
  { name: "Sand", primary: "#A16207", accent: "#0A0E13" },
  { name: "Midnight", primary: "#1E40AF", accent: "#0A0E13" },
] as const;

const BACKGROUND_STYLES = [
  { id: "ivory" as const, name: "Ivory", hex: "#FAFAF7", desc: "Doux & élégant" },
  { id: "white" as const, name: "Blanc pur", hex: "#FFFFFF", desc: "Moderne & minimaliste" },
  { id: "cream" as const, name: "Crème", hex: "#F8F6F0", desc: "Chaleureux & accueillant" },
];

const FONT_STYLES = [
  { id: "classic" as const, name: "Classique", desc: "Inter + Manrope (lisible, premium)" },
  { id: "modern" as const, name: "Moderne", desc: "Inter (épuré, tech)" },
  { id: "editorial" as const, name: "Éditorial", desc: "Manrope (luxe, mode)" },
];

export default function StepAppearance({
  value,
  onChange,
  onNext,
  onBack,
  shopSlug = null,
}: Props) {
  const [generatingHero, setGeneratingHero] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const heroImageUrl = value.heroImageUrl ?? null;

  const setHeroImageUrl = (url: string | null) => {
    onChange({ ...value, heroImageUrl: url });
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    setGenerationError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/hero", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setHeroImageUrl(data.imageUrl);
      } else {
        setGenerationError(data.error || "Échec du téléversement");
      }
    } catch {
      setGenerationError("Problème réseau");
    } finally {
      setUploadingHero(false);
      e.target.value = "";
    }
  };

  const handleGenerateHero = async () => {
    setGeneratingHero(true);
    setGenerationError(null);
    try {
      const endpoint = shopSlug
        ? `/api/shop/${shopSlug}/regenerate-hero`
        : "/api/personnalisation/generate-hero";
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setHeroImageUrl(data.imageUrl);
      } else {
        setGenerationError(data.error || "Erreur de génération");
      }
    } catch {
      setGenerationError("Problème réseau");
    } finally {
      setGeneratingHero(false);
    }
  };

  const handlePaletteSelect = (palette: (typeof COLOR_PALETTES)[number]) => {
    onChange({
      ...value,
      primaryColor: palette.primary,
      accentColor: palette.accent,
    });
  };

  const handleCustomColor = (
    field: "primaryColor" | "accentColor",
    color: string
  ) => {
    onChange({ ...value, [field]: color });
  };

  return (
    <div>
      <div className="perso-section-header">
        <h1 className="perso-title">Apparence</h1>
        <p className="perso-subtitle">
          Couleurs et ambiance pour refléter ton identité de marque.
        </p>
      </div>

      <div className={styles.appearance}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Palette size={20} strokeWidth={2} />
          </div>
          <div>
            <h2 className={styles.title}>Apparence de la boutique</h2>
            <p className={styles.subtitle}>
              Personnalise les couleurs et le style pour refléter ton identité
              de marque
            </p>
          </div>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Palettes recommandées</h3>
          <div className={styles.paletteGrid}>
            {COLOR_PALETTES.map((palette) => {
              const isActive = value.primaryColor === palette.primary;
              return (
                <button
                  key={palette.name}
                  type="button"
                  className={styles.paletteCard}
                  onClick={() => handlePaletteSelect(palette)}
                  style={isActive ? { borderColor: palette.primary } : undefined}
                >
                  <div className={styles.paletteSwatches}>
                    <span
                      className={styles.paletteSwatch}
                      style={{ backgroundColor: palette.primary }}
                    />
                    <span
                      className={styles.paletteSwatch}
                      style={{ backgroundColor: palette.accent }}
                    />
                  </div>
                  <span className={styles.paletteName}>{palette.name}</span>
                  {isActive && (
                    <span
                      className={styles.paletteCheck}
                      style={{ backgroundColor: palette.primary }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Personnaliser les couleurs</h3>
          <div className={styles.customColors}>
            <div className={styles.customColorField}>
              <label className={styles.fieldLabel}>Couleur principale</label>
              <div className={styles.colorPickerWrap}>
                <div
                  className={styles.colorPreview}
                  style={{ backgroundColor: value.primaryColor }}
                >
                  <input
                    type="color"
                    value={value.primaryColor}
                    onChange={(e) =>
                      handleCustomColor("primaryColor", e.target.value)
                    }
                    className={styles.colorInput}
                  />
                </div>
                <input
                  type="text"
                  value={value.primaryColor}
                  onChange={(e) =>
                    handleCustomColor("primaryColor", e.target.value)
                  }
                  className={styles.colorHexInput}
                  placeholder="#E84B1F"
                />
              </div>
              <span className={styles.fieldHint}>
                Utilisée pour les boutons, prix, accents premium
              </span>
            </div>

            <div className={styles.customColorField}>
              <label className={styles.fieldLabel}>Couleur secondaire</label>
              <div className={styles.colorPickerWrap}>
                <div
                  className={styles.colorPreview}
                  style={{ backgroundColor: value.accentColor }}
                >
                  <input
                    type="color"
                    value={value.accentColor}
                    onChange={(e) =>
                      handleCustomColor("accentColor", e.target.value)
                    }
                    className={styles.colorInput}
                  />
                </div>
                <input
                  type="text"
                  value={value.accentColor}
                  onChange={(e) =>
                    handleCustomColor("accentColor", e.target.value)
                  }
                  className={styles.colorHexInput}
                  placeholder="#0A0E13"
                />
              </div>
              <span className={styles.fieldHint}>
                Texte, bordures, éléments neutres
              </span>
            </div>
          </div>
        </section>

        <section className={styles.heroSourceSection}>
          <label className={styles.heroSourceLabel}>
            Image de bannière (hero)
            <span className={styles.heroSourceLabelHint}>
              2 options pour votre bannière
            </span>
          </label>

          <div className={styles.heroSourceGrid}>
            <label className={styles.heroSourceCard}>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroUpload}
                disabled={uploadingHero}
                style={{ display: "none" }}
              />
              <div
                className={styles.heroSourceIcon}
                style={{ background: "#FAFAF7", color: "#0A0E13" }}
              >
                {uploadingHero ? (
                  <Loader2 size={18} className={styles.spin} />
                ) : (
                  <Upload size={18} />
                )}
              </div>
              <div className={styles.heroSourceTitle}>
                {uploadingHero ? "Envoi en cours..." : "Téléverser mon image"}
              </div>
              <div className={styles.heroSourceDesc}>
                Si vous avez déjà votre visuel
              </div>
            </label>

            <button
              type="button"
              className={styles.heroSourceCard}
              onClick={handleGenerateHero}
              disabled={generatingHero}
            >
              <div
                className={styles.heroSourceIcon}
                style={{
                  background:
                    "linear-gradient(135deg, #E84B1F 0%, #C2410C 100%)",
                  color: "#FFFFFF",
                }}
              >
                {generatingHero ? (
                  <Loader2 size={18} className={styles.spin} />
                ) : (
                  <Sparkles size={18} />
                )}
              </div>
              <div className={styles.heroSourceTitle}>
                {generatingHero
                  ? "Génération en cours..."
                  : "Générer avec l'IA"}
              </div>
              <div className={styles.heroSourceDesc}>
                {generatingHero
                  ? "10-15 secondes"
                  : shopSlug
                    ? "Régénérer la bannière (limites IA)"
                    : "Image unique pour votre boutique"}
              </div>
            </button>
          </div>

          {generationError && (
            <div className={styles.heroError}>⚠️ {generationError}</div>
          )}

          {heroImageUrl && (
            <div className={styles.heroPreview}>
              <img
                src={resolveHeroImageUrl(heroImageUrl) ?? heroImageUrl}
                alt="Aperçu bannière"
              />
              <button
                type="button"
                onClick={() => setHeroImageUrl(null)}
                className={styles.heroRemove}
              >
                ✕ Retirer
              </button>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <ImageIcon size={14} strokeWidth={2.2} />
            Ambiance de fond
          </h3>
          <div className={styles.bgGrid}>
            {BACKGROUND_STYLES.map((bg) => {
              const isActive = value.backgroundStyle === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  className={styles.bgCard}
                  onClick={() => onChange({ ...value, backgroundStyle: bg.id })}
                  style={
                    isActive ? { borderColor: value.primaryColor } : undefined
                  }
                >
                  <div
                    className={styles.bgPreview}
                    style={{ backgroundColor: bg.hex }}
                  />
                  <div className={styles.bgInfo}>
                    <span className={styles.bgName}>{bg.name}</span>
                    <span className={styles.bgDesc}>{bg.desc}</span>
                  </div>
                  {isActive && (
                    <span
                      className={styles.paletteCheck}
                      style={{ backgroundColor: value.primaryColor }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Type size={14} strokeWidth={2.2} />
            Style de typographie
          </h3>
          <div className={styles.fontGrid}>
            {FONT_STYLES.map((font) => {
              const isActive = value.fontStyle === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  className={styles.fontCard}
                  onClick={() => onChange({ ...value, fontStyle: font.id })}
                  style={
                    isActive ? { borderColor: value.primaryColor } : undefined
                  }
                >
                  <span
                    className={`${styles.fontPreview} ${styles[`fontPreview_${font.id}`]}`}
                  >
                    Aa
                  </span>
                  <div className={styles.fontInfo}>
                    <span className={styles.fontName}>{font.name}</span>
                    <span className={styles.fontDesc}>{font.desc}</span>
                  </div>
                  {isActive && (
                    <span
                      className={styles.paletteCheck}
                      style={{ backgroundColor: value.primaryColor }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Aperçu</h3>
          <div
            className={styles.preview}
            style={{
              backgroundColor:
                BACKGROUND_STYLES.find((b) => b.id === value.backgroundStyle)
                  ?.hex ?? "#FAFAF7",
            }}
          >
            <div className={styles.previewProduct}>
              <div
                className={styles.previewBadge}
                style={{ backgroundColor: value.primaryColor }}
              >
                NOUVEAU
              </div>
              <div className={styles.previewImage} />
              <div className={styles.previewBody}>
                <span
                  className={styles.previewName}
                  style={{ color: value.accentColor }}
                >
                  Exemple Produit
                </span>
                <span
                  className={styles.previewPrice}
                  style={{ color: value.primaryColor }}
                >
                  15 000 FCFA
                </span>
                <button
                  type="button"
                  className={styles.previewBtn}
                  style={{ backgroundColor: value.primaryColor }}
                >
                  Acheter maintenant
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
