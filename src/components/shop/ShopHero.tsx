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
    logoUrl?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    phone?: string | null;
    email?: string | null;
    contactEmail?: string | null;
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
  const initial = shop.name?.trim()?.charAt(0)?.toUpperCase() ?? "S";

  const cityCountryLine = [shop.city, shop.country].filter(Boolean).join(
    shop.city && shop.country ? ", " : ""
  );

  const hasRow1 = Boolean(cityCountryLine || shop.phone || mail);
  const hasRow2 = Boolean(shop.address || shop.openingHours);
  const hasSocial = Boolean(
    shop.instagramUrl || resolvedWhatsapp || shop.facebookUrl
  );

  return (
    <section className="shop-hero">
      <div className="shop-container shop-hero-inner">
        <div className="shop-hero-eyebrow">Bienvenue chez</div>
        <h1 className="shop-hero-title">{shop.name}</h1>
        {shop.tagline && <p className="shop-hero-tagline">{shop.tagline}</p>}
        {desc && <p className="shop-hero-desc">{desc}</p>}

        <div className={styles.vendorCard}>
          <div className={styles.vendorCardMain}>
            <div
              className={styles.vendorLogo}
              style={{ backgroundColor: primaryColor }}
            >
              {shop.logoUrl ? (
                <img src={shop.logoUrl} alt={shop.name} />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div className={styles.vendorInfo}>
              <h2 className={styles.vendorName}>{shop.name}</h2>
              {shop.tagline && (
                <p className={styles.vendorTagline}>{shop.tagline}</p>
              )}

              {hasRow1 && (
                <div className={styles.vendorContactRow}>
                  {cityCountryLine && (
                    <span className={styles.vendorContactItem}>
                      <MapPin size={14} strokeWidth={2} />
                      {cityCountryLine}
                    </span>
                  )}
                  {shop.phone && (
                    <a href={`tel:${shop.phone}`} className={styles.vendorContactItem}>
                      <Phone size={14} strokeWidth={2} />
                      {shop.phone}
                    </a>
                  )}
                  {mail && (
                    <a href={`mailto:${mail}`} className={styles.vendorContactItem}>
                      <Mail size={14} strokeWidth={2} />
                      {mail}
                    </a>
                  )}
                </div>
              )}

              {hasRow2 && (
                <div className={styles.vendorContactRow}>
                  {shop.address && (
                    <span className={styles.vendorContactItem}>
                      <MapPin size={14} strokeWidth={2} />
                      {shop.address}
                    </span>
                  )}
                  {shop.openingHours && (
                    <span className={styles.vendorContactItem}>
                      <Clock size={14} strokeWidth={2} />
                      {shop.openingHours}
                    </span>
                  )}
                </div>
              )}

              {hasSocial && (
                <div className={styles.vendorSocial}>
                  {shop.instagramUrl && (
                    <a
                      href={shop.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.vendorSocialCircle}
                      aria-label="Instagram"
                    >
                      <Instagram size={14} strokeWidth={2} />
                    </a>
                  )}
                  {resolvedWhatsapp && (
                    <a
                      href={resolvedWhatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.vendorSocialCircle} ${styles.vendorSocialWa}`}
                      aria-label="WhatsApp"
                    >
                      <MessageCircle size={14} strokeWidth={2} />
                    </a>
                  )}
                  {shop.facebookUrl && (
                    <a
                      href={shop.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.vendorSocialCircle}
                      aria-label="Facebook"
                    >
                      <Facebook size={14} strokeWidth={2} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Link href={`/shop/${shop.slug}#produits`} className="shop-hero-cta">
          Découvrir les produits
        </Link>
      </div>
    </section>
  );
}
