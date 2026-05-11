import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  MessageCircle,
  Facebook,
} from "lucide-react";
import styles from "./ShopHero.module.css";

interface Props {
  shop: {
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    primaryColor: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    phone?: string | null;
    /** Affiché en priorité sur `contactEmail` si renseigné */
    email?: string | null;
    contactEmail?: string | null;
    /** Champ optionnel (à ajouter en BDD plus tard pour affichage automatique) */
    openingHours?: string | null;
    instagramUrl?: string | null;
    whatsappUrl?: string | null;
    whatsappNumber?: string | null;
    facebookUrl?: string | null;
  };
}

function plainSnippet(htmlOrText: string | null | undefined, max: number): string {
  if (!htmlOrText) return "";
  const t = htmlOrText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max) + "…";
}

function waMeHref(whatsappNumber: string): string | null {
  const d = whatsappNumber.replace(/\D/g, "");
  return d ? `https://wa.me/${d}` : null;
}

export default function ShopHero({ shop }: Props) {
  const desc = plainSnippet(shop.description, 280);
  const primaryColor = shop.primaryColor ?? "#E84B1F";
  const mail = shop.email?.trim() || shop.contactEmail?.trim() || null;
  const resolvedWhatsapp =
    shop.whatsappUrl?.trim() || waMeHref(shop.whatsappNumber ?? "") || null;

  const addressLine =
    [shop.address, shop.city].filter(Boolean).join(shop.address && shop.city ? ", " : "") +
    (shop.country
      ? (shop.address || shop.city ? ", " : "") + shop.country
      : "");

  const hasCardContent =
    addressLine.trim() ||
    shop.phone ||
    mail ||
    shop.openingHours ||
    shop.instagramUrl ||
    resolvedWhatsapp ||
    shop.facebookUrl;

  return (
    <section className="shop-hero">
      <div className="shop-container shop-hero-inner">
        <div className="shop-hero-eyebrow">Bienvenue chez</div>
        <h1 className="shop-hero-title">{shop.name}</h1>
        {shop.tagline && <p className="shop-hero-tagline">{shop.tagline}</p>}
        {desc && <p className="shop-hero-desc">{desc}</p>}
        <Link href={`/shop/${shop.slug}#produits`} className="shop-hero-cta">
          Découvrir les produits
        </Link>

        {hasCardContent && (
          <div className={styles.merchantCard}>
            <div className={styles.merchantCardHeader}>
              <span className={styles.merchantCardLabel}>NOUS TROUVER</span>
              <span className={styles.merchantCardDivider} />
            </div>

            <div className={styles.merchantInfoGrid}>
              {(shop.address || shop.city || shop.country) && (
                <div className={styles.merchantInfo}>
                  <div
                    className={styles.merchantInfoIcon}
                    style={{ color: primaryColor }}
                  >
                    <MapPin size={18} strokeWidth={2} />
                  </div>
                  <div className={styles.merchantInfoContent}>
                    <span className={styles.merchantInfoLabel}>Adresse</span>
                    <span className={styles.merchantInfoValue}>
                      {addressLine || "—"}
                    </span>
                  </div>
                </div>
              )}

              {shop.phone && (
                <a href={`tel:${shop.phone}`} className={styles.merchantInfo}>
                  <div
                    className={styles.merchantInfoIcon}
                    style={{ color: primaryColor }}
                  >
                    <Phone size={18} strokeWidth={2} />
                  </div>
                  <div className={styles.merchantInfoContent}>
                    <span className={styles.merchantInfoLabel}>Téléphone</span>
                    <span className={styles.merchantInfoValue}>{shop.phone}</span>
                  </div>
                </a>
              )}

              {mail && (
                <a href={`mailto:${mail}`} className={styles.merchantInfo}>
                  <div
                    className={styles.merchantInfoIcon}
                    style={{ color: primaryColor }}
                  >
                    <Mail size={18} strokeWidth={2} />
                  </div>
                  <div className={styles.merchantInfoContent}>
                    <span className={styles.merchantInfoLabel}>Email</span>
                    <span className={styles.merchantInfoValue}>{mail}</span>
                  </div>
                </a>
              )}

              {shop.openingHours && (
                <div className={styles.merchantInfo}>
                  <div
                    className={styles.merchantInfoIcon}
                    style={{ color: primaryColor }}
                  >
                    <Clock size={18} strokeWidth={2} />
                  </div>
                  <div className={styles.merchantInfoContent}>
                    <span className={styles.merchantInfoLabel}>Horaires</span>
                    <span className={styles.merchantInfoValue}>
                      {shop.openingHours}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {(shop.instagramUrl || resolvedWhatsapp || shop.facebookUrl) && (
              <div className={styles.merchantSocial}>
                <span className={styles.merchantSocialLabel}>Suivez-nous</span>
                <div className={styles.merchantSocialBtns}>
                  {shop.instagramUrl && (
                    <a
                      href={shop.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.merchantSocialBtn}
                      aria-label="Instagram"
                    >
                      <Instagram size={16} strokeWidth={2} />
                    </a>
                  )}
                  {resolvedWhatsapp && (
                    <a
                      href={resolvedWhatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.merchantSocialBtn}
                      style={{ color: "#25D366" }}
                      aria-label="WhatsApp"
                    >
                      <MessageCircle size={16} strokeWidth={2} />
                    </a>
                  )}
                  {shop.facebookUrl && (
                    <a
                      href={shop.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.merchantSocialBtn}
                      aria-label="Facebook"
                    >
                      <Facebook size={16} strokeWidth={2} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
