"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  MagnifyingGlass,
  ChartBar,
  Lock,
  Copy,
  CheckCircle,
  Info,
  Lightning,
  FloppyDisk,
  Warning,
} from "@phosphor-icons/react";
import {
  updateSeoAction,
  updateTrackingAction,
  updateCustomDomainAction,
} from "@/app/actions/seo-domain";
import styles from "./domaine.module.css";

interface ShopState {
  slug: string;
  name: string;
  plan: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageUrl: string | null;
  googleAnalyticsId: string;
  facebookPixelId: string;
  facebookCapiToken: string;
  tiktokPixelId: string;
  snapchatPixelId: string;
  customDomain: string;
  customDomainVerifiedAt: string | null;
}

interface Props {
  shop: ShopState;
}

type Tab = "seo" | "tracking" | "domain";

export default function DomaineClient({ shop: initialShop }: Props) {
  const router = useRouter();
  const [shop, setShop] = useState(initialShop);
  const [activeTab, setActiveTab] = useState<Tab>("seo");
  const [isPending, startTransition] = useTransition();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const update = (field: keyof ShopState, value: string) => {
    setShop((s) => ({ ...s, [field]: value }));
  };

  const handleSaveSeo = () => {
    startTransition(async () => {
      const res = await updateSeoAction({
        seoTitle: shop.seoTitle,
        seoDescription: shop.seoDescription,
        seoKeywords: shop.seoKeywords,
      });
      if (res.ok) router.refresh();
      else alert(res.error || "Erreur");
    });
  };

  const handleSaveTracking = () => {
    startTransition(async () => {
      const res = await updateTrackingAction({
        googleAnalyticsId: shop.googleAnalyticsId,
        facebookPixelId: shop.facebookPixelId,
        facebookCapiToken: shop.facebookCapiToken,
        tiktokPixelId: shop.tiktokPixelId,
        snapchatPixelId: shop.snapchatPixelId,
      });
      if (res.ok) router.refresh();
      else alert(res.error || "Erreur");
    });
  };

  const handleSaveDomain = () => {
    startTransition(async () => {
      const res = await updateCustomDomainAction(shop.customDomain || null);
      if (res.ok) router.refresh();
      else alert(res.error || "Erreur");
    });
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>— BOUTIQUE</span>
        <h1 className={styles.title}>Domaine & SEO</h1>
        <p className={styles.subtitle}>
          Optimisez votre présence en ligne, configurez le tracking et utilisez
          votre propre nom de domaine.
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`${styles.tab} ${activeTab === "seo" ? styles.tabActive : ""}`}
        >
          <MagnifyingGlass size={14} weight="duotone" /> Référencement (SEO)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tracking")}
          className={`${styles.tab} ${activeTab === "tracking" ? styles.tabActive : ""}`}
        >
          <ChartBar size={14} weight="duotone" /> Tracking & Analytics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("domain")}
          className={`${styles.tab} ${activeTab === "domain" ? styles.tabActive : ""}`}
        >
          <Globe size={14} weight="duotone" /> Domaine personnalisé
        </button>
      </div>

      {activeTab === "seo" && (
        <div className={styles.section}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Titre SEO{" "}
              <span className={styles.charCount}>{shop.seoTitle.length}/60</span>
            </label>
            <input
              type="text"
              value={shop.seoTitle}
              onChange={(e) => update("seoTitle", e.target.value)}
              maxLength={60}
              placeholder="Ex: Boutique Sellia - Mode féminine au Cameroun"
              className={styles.input}
            />
            <div className={styles.fieldHint}>
              Affiché dans Google. Inclut le nom de la boutique + mots-clés
              principaux.
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Description SEO{" "}
              <span className={styles.charCount}>
                {shop.seoDescription.length}/160
              </span>
            </label>
            <textarea
              value={shop.seoDescription}
              onChange={(e) => update("seoDescription", e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="Description en 1-2 phrases qui décrit ce que vous vendez."
              className={styles.textarea}
            />
            <div className={styles.fieldHint}>
              Phrase d&apos;accroche affichée sous le titre dans Google.
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Mots-clés (optionnel)</label>
            <input
              type="text"
              value={shop.seoKeywords}
              onChange={(e) => update("seoKeywords", e.target.value)}
              placeholder="mode, vêtements, accessoires"
              className={styles.input}
            />
            <div className={styles.fieldHint}>
              Séparés par des virgules. Peu utilisé par Google aujourd&apos;hui.
            </div>
          </div>

          <div className={styles.serpPreview}>
            <div className={styles.serpUrl}>
              https://{shop.slug}.getsellia.com
            </div>
            <div className={styles.serpTitle}>
              {shop.seoTitle || `${shop.name} - Boutique en ligne`}
            </div>
            <div className={styles.serpDescription}>
              {shop.seoDescription ||
                "Découvrez notre sélection de produits..."}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSeo}
            disabled={isPending}
            className={styles.btnPrimary}
          >
            <FloppyDisk size={15} weight="duotone" /> Enregistrer
          </button>
        </div>
      )}

      {activeTab === "tracking" && (
        <div className={styles.section}>
          <div className={styles.infoBanner}>
            <Info size={18} weight="duotone" />
            <div>
              <strong>Trackez vos performances marketing</strong>
              <p>
                Connectez Google Analytics et vos pixels publicitaires pour
                mesurer vos campagnes et optimiser vos ventes.
              </p>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Google Analytics 4 (Measurement ID)
            </label>
            <input
              type="text"
              value={shop.googleAnalyticsId}
              onChange={(e) => update("googleAnalyticsId", e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className={styles.input}
            />
            <div className={styles.fieldHint}>
              Format : G-XXXXXXXXXX. Google Analytics &gt; Admin &gt; Flux de
              données.
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Facebook Pixel ID</label>
            <input
              type="text"
              value={shop.facebookPixelId}
              onChange={(e) => update("facebookPixelId", e.target.value)}
              placeholder="123456789012345"
              className={styles.input}
            />
            <div className={styles.fieldHint}>
              15-17 chiffres. Meta Business Suite &gt; Events Manager.
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Facebook CAPI Token (optionnel)
            </label>
            <input
              type="password"
              value={shop.facebookCapiToken}
              onChange={(e) => update("facebookCapiToken", e.target.value)}
              placeholder="Token d'accès Conversions API"
              className={styles.input}
            />
            <div className={styles.fieldHint}>
              Tracking server-side avec Conversions API (recommandé pour iOS).
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>TikTok Pixel ID</label>
            <input
              type="text"
              value={shop.tiktokPixelId}
              onChange={(e) => update("tiktokPixelId", e.target.value)}
              placeholder="C4XXXXXXXXXXXXXXXXXX"
              className={styles.input}
            />
            <div className={styles.fieldHint}>
              TikTok Ads Manager &gt; Events.
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Snapchat Pixel ID</label>
            <input
              type="text"
              value={shop.snapchatPixelId}
              onChange={(e) => update("snapchatPixelId", e.target.value)}
              placeholder="UUID Snap Pixel"
              className={styles.input}
            />
            <div className={styles.fieldHint}>
              Snapchat Ads Manager &gt; Events Manager &gt; Pixel.
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveTracking}
            disabled={isPending}
            className={styles.btnPrimary}
          >
            <FloppyDisk size={15} weight="duotone" /> Enregistrer
          </button>
        </div>
      )}

      {activeTab === "domain" && (
        <div className={styles.section}>
          {shop.plan === "free" && (
            <div className={styles.proBanner}>
              <Lock size={20} weight="duotone" />
              <div>
                <strong>Fonctionnalité Plan Pro</strong>
                <p>
                  Utilisez votre propre nom de domaine (maboutique.com) avec un
                  plan Pro ou Business.
                </p>
              </div>
              <a
                href="/dashboard/parametres/abonnement"
                className={styles.btnPrimary}
              >
                Passer Pro <Lightning size={14} weight="fill" />
              </a>
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Votre domaine actuel (gratuit)
            </label>
            <div className={styles.domainBox}>
              <span>https://{shop.slug}.getsellia.com</span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(`https://${shop.slug}.getsellia.com`, "default")
                }
                className={styles.copyBtn}
              >
                {copiedField === "default" ? (
                  <CheckCircle size={14} weight="fill" color="#15803D" />
                ) : (
                  <Copy size={14} weight="regular" />
                )}
              </button>
            </div>
          </div>

          {shop.plan !== "free" && (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Domaine personnalisé</label>
                <input
                  type="text"
                  value={shop.customDomain}
                  onChange={(e) => update("customDomain", e.target.value)}
                  placeholder="boutique.maboutique.com"
                  className={styles.input}
                />
                <div className={styles.fieldHint}>
                  Sans https:// ni slash. Ex : boutique.maboutique.com
                </div>
              </div>

              {shop.customDomain && (
                <div className={styles.dnsBox}>
                  <h3 className={styles.dnsTitle}>
                    <Warning size={16} weight="duotone" color="#C2410C" />
                    Configuration DNS requise
                  </h3>
                  <p>
                    Ajoutez ces enregistrements chez votre fournisseur DNS
                    (Cloudflare, OVH, Namecheap...) :
                  </p>
                  <div className={styles.dnsRecord}>
                    <span className={styles.dnsType}>CNAME</span>
                    <span className={styles.dnsName}>
                      {shop.customDomain.split(".")[0]}
                    </span>
                    <span className={styles.dnsValue}>proxy.getsellia.com</span>
                    <button
                      type="button"
                      onClick={() => handleCopy("proxy.getsellia.com", "cname")}
                      className={styles.copyBtn}
                    >
                      {copiedField === "cname" ? (
                        <CheckCircle size={14} weight="fill" color="#15803D" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <p className={styles.dnsNote}>
                    La propagation DNS peut prendre 1 à 48h. Vous recevrez un
                    email dès que le domaine est actif.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveDomain}
                disabled={isPending}
                className={styles.btnPrimary}
              >
                <FloppyDisk size={15} weight="duotone" /> Enregistrer
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
