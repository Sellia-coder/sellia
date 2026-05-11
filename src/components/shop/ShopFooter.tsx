import Link from "next/link";
import styles from "./ShopFooter.module.css";

interface Props {
  shop: {
    slug: string;
    name: string;
    tagline?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
    instagramUrl?: string | null;
    whatsappNumber?: string | null;
    facebookUrl?: string | null;
  };
}

function whatsappHref(whatsappNumber: string | null | undefined): string | null {
  if (!whatsappNumber?.trim()) return null;
  const digits = whatsappNumber.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

export default function ShopFooter({ shop }: Props) {
  const homePath = `/shop/${shop.slug}`;
  const initial = (shop.name?.[0] ?? "S").toUpperCase();
  const primaryColor = shop.primaryColor ?? "#E84B1F";
  const year = new Date().getFullYear();
  const descriptionPlain = shop.description
    ? stripHtml(shop.description)
    : null;
  const wa = whatsappHref(shop.whatsappNumber);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.brandCol}>
          <div className={styles.brandTop}>
            <div
              className={styles.logo}
              style={{ backgroundColor: primaryColor }}
            >
              {shop.logoUrl ? (
                <img src={shop.logoUrl} alt={shop.name} />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <span className={styles.brandName}>{shop.name}</span>
          </div>
          {descriptionPlain && (
            <p className={styles.brandDesc}>{descriptionPlain}</p>
          )}
        </div>

        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Boutique</h4>
          <Link href={homePath} className={styles.link}>
            Tous les produits
          </Link>
          <Link href={`${homePath}#nouveautes`} className={styles.link}>
            Nouveautés
          </Link>
          <Link href={`${homePath}#promotions`} className={styles.link}>
            Promotions
          </Link>
        </div>

        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Aide</h4>
          <Link href={`${homePath}/livraison`} className={styles.link}>
            Livraison
          </Link>
          <Link href={`${homePath}/retours`} className={styles.link}>
            Retours
          </Link>
          <Link href={`${homePath}/contact`} className={styles.link}>
            Contact
          </Link>
        </div>

        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Suivez-nous</h4>
          {shop.instagramUrl && (
            <a
              href={shop.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Instagram
            </a>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              WhatsApp
            </a>
          )}
          {shop.facebookUrl && (
            <a
              href={shop.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Facebook
            </a>
          )}
          {!shop.instagramUrl && !wa && !shop.facebookUrl && (
            <span className={styles.linkMuted}>Bientôt</span>
          )}
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span className={styles.copy}>
            © {year} {shop.name} · Tous droits réservés
          </span>
          <span className={styles.poweredBy}>
            Propulsé par{" "}
            <a
              href="https://getsellia.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.selliaLink}
            >
              Sellia
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
