"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  TextAa,
  Layout,
  ImageSquare,
  Eye,
  ArrowSquareOut,
  FloppyDisk,
  CheckCircle,
  Sparkle,
  Warning,
} from "@phosphor-icons/react";
import {
  updateAppearanceAction,
  applyThemePresetAction,
} from "@/app/actions/appearance";
import styles from "./appearance.module.css";

interface ShopState {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  mobileLogoUrl: string | null;
  themeId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headingFont: string;
  bodyFont: string;
  headerStyle: string;
  productGridCols: number;
  footerStyle: string;
  heroStyle: string;
}

interface Props {
  shop: ShopState;
}

const THEMES = [
  { id: "elegance", name: "Élégance", description: "Sophistiqué et chaleureux", colors: ["#E84B1F", "#0A0E13", "#FFEDD5"] },
  { id: "audacieux", name: "Audacieux", description: "Vif et impactant", colors: ["#DC2626", "#171717", "#FEE2E2"] },
  { id: "minimal", name: "Minimaliste", description: "Sobre et raffiné", colors: ["#000000", "#404040", "#F5F5F5"] },
  { id: "nature", name: "Nature", description: "Organique et apaisant", colors: ["#15803D", "#1E3A2F", "#DCFCE7"] },
  { id: "boutique", name: "Boutique", description: "Luxueux et féminin", colors: ["#9333EA", "#1E1B4B", "#EDE9FE"] },
  { id: "tech", name: "Tech", description: "Moderne et précis", colors: ["#0EA5E9", "#0F172A", "#E0F2FE"] },
];

const FONT_COMBOS = [
  { heading: "Fraunces", body: "Inter", label: "Classique élégant" },
  { heading: "Playfair Display", body: "Lato", label: "Magazine moderne" },
  { heading: "Cormorant Garamond", body: "Lato", label: "Sophistiqué naturel" },
  { heading: "DM Serif Display", body: "Inter", label: "Boutique luxe" },
  { heading: "Space Grotesk", body: "Inter", label: "Tech contemporain" },
  { heading: "Inter", body: "Inter", label: "Tout en sans-serif" },
];

const HEADER_STYLES = [
  { id: "centered", name: "Centré", description: "Logo centré, menu sous le logo" },
  { id: "left", name: "Aligné à gauche", description: "Logo à gauche, menu à droite" },
  { id: "minimal", name: "Minimal", description: "Compact, pas de tagline" },
];

const HERO_STYLES = [
  { id: "image-text", name: "Image + Texte", description: "Image à droite, texte à gauche" },
  { id: "full-image", name: "Image pleine largeur", description: "Background image avec texte" },
  { id: "text-only", name: "Texte uniquement", description: "Pas d'image, texte centré" },
  { id: "video", name: "Vidéo", description: "Vidéo en arrière-plan" },
];

type Tab = "theme" | "colors" | "typography" | "logo" | "layout";

export default function AppearanceStudioClient({ shop: initialShop }: Props) {
  const router = useRouter();
  const [shop, setShop] = useState(initialShop);
  const [activeTab, setActiveTab] = useState<Tab>("theme");
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    setShop(initialShop);
  }, [initialShop]);

  useEffect(() => {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");
    const url = isLocal
      ? `/shop/${initialShop.slug}?_preview=${Date.now()}`
      : `https://${initialShop.slug}.getsellia.com?_preview=${Date.now()}`;
    setPreviewUrl(url);
    setIframeError(false);
  }, [initialShop.slug]);

  const updateField = <K extends keyof ShopState>(
    field: K,
    value: ShopState[K]
  ) => {
    setShop((s) => ({ ...s, [field]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateAppearanceAction({
        themeId: shop.themeId,
        primaryColor: shop.primaryColor,
        secondaryColor: shop.secondaryColor || undefined,
        accentColor: shop.accentColor || undefined,
        backgroundColor: shop.backgroundColor,
        headingFont: shop.headingFont,
        bodyFont: shop.bodyFont,
        headerStyle: shop.headerStyle,
        productGridCols: shop.productGridCols,
        footerStyle: shop.footerStyle,
        heroStyle: shop.heroStyle,
        tagline: shop.tagline,
        logoUrl: shop.logoUrl,
        faviconUrl: shop.faviconUrl,
        mobileLogoUrl: shop.mobileLogoUrl,
      });
      if (res.ok) {
        setSavedAt(Date.now());
        setTimeout(() => setSavedAt(null), 2500);
        router.refresh();
      }
    });
  };

  const handleApplyTheme = (themeId: string) => {
    startTransition(async () => {
      const res = await applyThemePresetAction(themeId);
      if (res.ok) {
        router.refresh();
        setSavedAt(Date.now());
        setTimeout(() => setSavedAt(null), 2500);
      }
    });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>— BOUTIQUE</span>
          <h1 className={styles.title}>Apparence</h1>
          <p className={styles.subtitle}>
            Personnalisez chaque détail de votre boutique pour qu&apos;elle
            reflète votre marque.
          </p>
        </div>
        <div className={styles.topbarActions}>
          <button
            type="button"
            onClick={() => setShowPreview((s) => !s)}
            className={styles.btnGhost}
          >
            <Eye size={15} weight="duotone" />
            {showPreview ? "Masquer aperçu" : "Afficher aperçu"}
          </button>
          <a
            href={`https://${shop.slug}.getsellia.com`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnGhost}
          >
            <ArrowSquareOut size={14} weight="bold" />
            Voir en ligne
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className={styles.btnPrimary}
          >
            {savedAt ? (
              <>
                <CheckCircle size={15} weight="fill" />
                Enregistré
              </>
            ) : isPending ? (
              "Enregistrement..."
            ) : (
              <>
                <FloppyDisk size={15} weight="duotone" />
                Publier
              </>
            )}
          </button>
        </div>
      </div>

      <div
        className={`${styles.splitView} ${!showPreview ? styles.noPreview : ""}`}
      >
        <div className={styles.configPanel}>
          <div className={styles.tabs}>
            {(
              [
                { id: "theme", label: "Thème", icon: Sparkle },
                { id: "colors", label: "Couleurs", icon: Palette },
                { id: "typography", label: "Typographie", icon: TextAa },
                { id: "logo", label: "Logo & marque", icon: ImageSquare },
                { id: "layout", label: "Disposition", icon: Layout },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <Icon size={15} weight="duotone" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.configContent}>
            {activeTab === "theme" && (
              <div>
                <h2 className={styles.sectionTitle}>Thèmes prédéfinis</h2>
                <p className={styles.sectionSubtitle}>
                  Choisissez un point de départ. Vous pourrez tout personnaliser
                  ensuite.
                </p>
                <div className={styles.themesGrid}>
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleApplyTheme(theme.id)}
                      className={`${styles.themeCard} ${shop.themeId === theme.id ? styles.themeCardActive : ""}`}
                    >
                      <div className={styles.themeColors}>
                        {theme.colors.map((c, i) => (
                          <div
                            key={i}
                            className={styles.themeColorChip}
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                      <div className={styles.themeName}>
                        {theme.name}
                        {shop.themeId === theme.id && (
                          <CheckCircle
                            size={14}
                            weight="fill"
                            color="var(--sellia-ember)"
                          />
                        )}
                      </div>
                      <div className={styles.themeDescription}>
                        {theme.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "colors" && (
              <div>
                <h2 className={styles.sectionTitle}>Couleurs</h2>
                <p className={styles.sectionSubtitle}>
                  Personnalisez la palette de votre boutique.
                </p>
                <div className={styles.colorsGrid}>
                  <ColorPickerField
                    label="Couleur primaire"
                    hint="Boutons, liens, accents"
                    value={shop.primaryColor}
                    onChange={(v) => updateField("primaryColor", v)}
                  />
                  <ColorPickerField
                    label="Couleur secondaire"
                    hint="Texte principal, éléments sombres"
                    value={shop.secondaryColor || "#0A0E13"}
                    onChange={(v) => updateField("secondaryColor", v)}
                  />
                  <ColorPickerField
                    label="Couleur d'accent"
                    hint="Badges, surbrillances"
                    value={shop.accentColor || "#FFEDD5"}
                    onChange={(v) => updateField("accentColor", v)}
                  />
                  <ColorPickerField
                    label="Arrière-plan"
                    hint="Fond général de la boutique"
                    value={shop.backgroundColor}
                    onChange={(v) => updateField("backgroundColor", v)}
                  />
                </div>
              </div>
            )}

            {activeTab === "typography" && (
              <div>
                <h2 className={styles.sectionTitle}>Typographie</h2>
                <p className={styles.sectionSubtitle}>
                  Choisissez la combinaison de polices qui définit votre
                  identité.
                </p>
                <div className={styles.fontCombos}>
                  {FONT_COMBOS.map((combo, idx) => {
                    const isActive =
                      shop.headingFont === combo.heading &&
                      shop.bodyFont === combo.body;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          updateField("headingFont", combo.heading);
                          updateField("bodyFont", combo.body);
                        }}
                        className={`${styles.fontComboCard} ${isActive ? styles.fontComboActive : ""}`}
                      >
                        <div className={styles.fontComboPreview}>
                          <div
                            className={styles.fontComboHeading}
                            style={{ fontFamily: combo.heading }}
                          >
                            Aa
                          </div>
                          <div
                            className={styles.fontComboBody}
                            style={{ fontFamily: combo.body }}
                          >
                            Boutique en ligne
                          </div>
                        </div>
                        <div className={styles.fontComboInfo}>
                          <div className={styles.fontComboLabel}>
                            {combo.label}
                            {isActive && (
                              <CheckCircle
                                size={13}
                                weight="fill"
                                color="var(--sellia-ember)"
                              />
                            )}
                          </div>
                          <div className={styles.fontComboMeta}>
                            {combo.heading} + {combo.body}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "logo" && (
              <div>
                <h2 className={styles.sectionTitle}>Logo & marque</h2>
                <p className={styles.sectionSubtitle}>
                  Téléchargez votre logo et personnalisez votre tagline.
                </p>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Tagline / Slogan</label>
                  <input
                    type="text"
                    value={shop.tagline}
                    onChange={(e) => updateField("tagline", e.target.value)}
                    placeholder="Ex: La boutique de référence pour..."
                    className={styles.fieldInput}
                    maxLength={120}
                  />
                  <div className={styles.fieldHint}>
                    {shop.tagline.length}/120 caractères
                  </div>
                </div>
                <div className={styles.logoGrid}>
                  <LogoUploadCard
                    label="Logo principal"
                    hint="PNG transparent recommandé."
                    currentUrl={shop.logoUrl}
                    onUploaded={(url) => updateField("logoUrl", url)}
                    aspectRatio="wide"
                  />
                  <LogoUploadCard
                    label="Logo mobile"
                    hint="Version compacte."
                    currentUrl={shop.mobileLogoUrl}
                    onUploaded={(url) => updateField("mobileLogoUrl", url)}
                    aspectRatio="square"
                  />
                  <LogoUploadCard
                    label="Favicon"
                    hint="PNG 32×32 ou 64×64."
                    currentUrl={shop.faviconUrl}
                    onUploaded={(url) => updateField("faviconUrl", url)}
                    aspectRatio="square"
                  />
                </div>
              </div>
            )}

            {activeTab === "layout" && (
              <div>
                <h2 className={styles.sectionTitle}>Disposition</h2>
                <p className={styles.sectionSubtitle}>
                  Configurez la mise en page de votre boutique.
                </p>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Style du header</label>
                  <div className={styles.optionsRow}>
                    {HEADER_STYLES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => updateField("headerStyle", s.id)}
                        className={`${styles.optionCard} ${shop.headerStyle === s.id ? styles.optionCardActive : ""}`}
                      >
                        <div className={styles.optionName}>{s.name}</div>
                        <div className={styles.optionDescription}>
                          {s.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Style du hero</label>
                  <div className={styles.optionsRow}>
                    {HERO_STYLES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => updateField("heroStyle", s.id)}
                        className={`${styles.optionCard} ${shop.heroStyle === s.id ? styles.optionCardActive : ""}`}
                      >
                        <div className={styles.optionName}>{s.name}</div>
                        <div className={styles.optionDescription}>
                          {s.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    Colonnes grille produits
                  </label>
                  <div className={styles.gridColsSelector}>
                    {[2, 3, 4].map((cols) => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => updateField("productGridCols", cols)}
                        className={`${styles.gridColsBtn} ${shop.productGridCols === cols ? styles.gridColsBtnActive : ""}`}
                      >
                        <div className={styles.gridColsVisual}>
                          {Array.from({ length: cols }).map((_, i) => (
                            <div key={i} className={styles.gridColsItem} />
                          ))}
                        </div>
                        <span>{cols} colonnes</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showPreview && (
          <div className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <span className={styles.previewLabel}>APERÇU EN DIRECT</span>
              <span className={styles.previewUrl}>
                {shop.slug}.getsellia.com
              </span>
            </div>
            <div className={styles.previewFrame}>
              {iframeError ? (
                <div className={styles.iframeError}>
                  <Warning size={32} weight="duotone" />
                  <h3>Aperçu indisponible</h3>
                  <p>
                    Cliquez sur &quot;Voir en ligne&quot; pour ouvrir votre
                    boutique dans un nouvel onglet.
                  </p>
                  <a
                    href={previewUrl || `https://${shop.slug}.getsellia.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnPrimary}
                  >
                    Ouvrir la boutique <ArrowSquareOut size={14} />
                  </a>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className={styles.previewIframe}
                  title="Aperçu de la boutique"
                  onLoad={() => setIframeError(false)}
                  onError={() => setIframeError(true)}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ColorPickerField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.colorField}>
      <label className={styles.colorFieldLabel}>{label}</label>
      {hint && <span className={styles.colorFieldHint}>{hint}</span>}
      <div className={styles.colorFieldInputs}>
        <div className={styles.colorSwatch} style={{ background: value }}>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={styles.colorInputNative}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.colorInputText}
          maxLength={7}
        />
      </div>
    </div>
  );
}

function LogoUploadCard({
  label,
  hint,
  currentUrl,
  onUploaded,
  aspectRatio,
}: {
  label: string;
  hint: string;
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  aspectRatio: "wide" | "square";
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/hero", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) onUploaded(data.url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.logoCard}>
      <span className={styles.fieldLabel}>{label}</span>
      <div
        className={`${styles.logoCardPreview} ${aspectRatio === "wide" ? styles.logoWide : styles.logoSquare}`}
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt={label} />
        ) : (
          <div className={styles.logoCardPlaceholder}>
            <ImageSquare size={28} weight="duotone" color="var(--sellia-subtle)" />
            <span>Aucun logo</span>
          </div>
        )}
      </div>
      <label className={styles.logoCardUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          style={{ display: "none" }}
        />
        {uploading ? "Upload en cours..." : currentUrl ? "Remplacer" : "Téléverser"}
      </label>
      <p className={styles.logoCardHint}>{hint}</p>
    </div>
  );
}
