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
    whatsappUrl?: string | null;
    /** Schéma Prisma — lien wa.me dérivé si `whatsappUrl` absent */
    whatsappNumber?: string | null;
    facebookUrl?: string | null;
  };
}

function waMeFromNumber(whatsappNumber: string | null | undefined): string | null {
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
  const resolvedWhatsapp =
    shop.whatsappUrl?.trim() || waMeFromNumber(shop.whatsappNumber);
  const descriptionPlain = shop.description
    ? stripHtml(shop.description)
    : null;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* COLONNE BRAND */}
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

          {/* MOYENS DE PAIEMENT */}
          <div className={styles.paymentsWrap}>
            <span className={styles.paymentsLabel}>Paiements acceptés</span>
            <div className={styles.payments}>
              <div className={styles.payBadge} aria-label="Visa">
                <svg
                  viewBox="0 0 48 16"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                >
                  <path
                    d="M19.9 0.5L17.3 15.5H13.7L16.3 0.5H19.9Z"
                    fill="#1A1F71"
                  />
                  <path
                    d="M32 0.9C31.3 0.6 30.2 0.3 28.9 0.3C25.6 0.3 23.3 2.1 23.3 4.7C23.3 6.6 25 7.7 26.3 8.3C27.6 8.9 28 9.3 28 9.9C28 10.8 26.9 11.2 25.9 11.2C24.5 11.2 23.7 11 22.5 10.5L22 10.3L21.5 13.6C22.4 14 24 14.4 25.7 14.4C29.2 14.4 31.5 12.7 31.5 9.9C31.5 8.4 30.6 7.2 28.5 6.3C27.2 5.7 26.5 5.3 26.5 4.6C26.5 4 27.1 3.5 28.5 3.5C29.6 3.5 30.5 3.7 31.1 4L31.5 4.2L32 0.9Z"
                    fill="#1A1F71"
                  />
                  <path
                    d="M37.8 0.5H40.4C41.2 0.5 41.8 0.7 42.2 1.6L46.7 15.5H43.2L42.5 13.3H37.7L36.9 15.5H33.4L37.8 0.5ZM41.5 10.5L40.2 5.4L38.8 10.5H41.5Z"
                    fill="#1A1F71"
                  />
                  <path
                    d="M10.7 0.5L7.3 10.7L7 9C6.3 6.8 4.4 4.4 2.2 3.2L5.4 15.4H9L14.3 0.5H10.7Z"
                    fill="#1A1F71"
                  />
                  <path
                    d="M4.5 0.5H0L0 0.8C3.7 1.8 6.2 4.1 7.3 6.9L6.2 1.6C6 0.7 5.4 0.5 4.6 0.5H4.5Z"
                    fill="#FFB300"
                  />
                </svg>
              </div>

              <div className={styles.payBadge} aria-label="Mastercard">
                <svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="13" cy="12" r="9" fill="#EB001B" />
                  <circle cx="23" cy="12" r="9" fill="#F79E1B" />
                  <path
                    d="M18 5.2C16.2 6.8 15 9.3 15 12C15 14.7 16.2 17.2 18 18.8C19.8 17.2 21 14.7 21 12C21 9.3 19.8 6.8 18 5.2Z"
                    fill="#FF5F00"
                  />
                </svg>
              </div>

              <div className={styles.payBadge} aria-label="Orange Money">
                <div
                  className={styles.payTextWrap}
                  style={{ backgroundColor: "#FF6900" }}
                >
                  <span className={styles.payTextWhite}>Orange Money</span>
                </div>
              </div>

              <div className={styles.payBadge} aria-label="MTN Mobile Money">
                <div
                  className={styles.payTextWrap}
                  style={{ backgroundColor: "#FFCC00" }}
                >
                  <span className={styles.payTextDark}>MTN MoMo</span>
                </div>
              </div>

              <div className={styles.payBadge} aria-label="Wave">
                <div
                  className={styles.payTextWrap}
                  style={{ backgroundColor: "#1DC8FF" }}
                >
                  <span className={styles.payTextWhite}>Wave</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE BOUTIQUE */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Boutique</h4>
          <Link href={homePath} className={styles.link}>
            Tous les produits
          </Link>
          <Link href={`${homePath}#nouveautes`} className={styles.link}>
            Nouveautés
          </Link>
          <Link href={`${homePath}/a-propos`} className={styles.link}>
            À propos
          </Link>
          <Link href={`${homePath}/contact`} className={styles.link}>
            Contact
          </Link>
        </div>

        {/* COLONNE INFORMATIONS LÉGALES */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Informations légales</h4>
          <a
            href="https://getsellia.com/mentions-legales"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Mentions légales
          </a>
          <a
            href="https://getsellia.com/conditions"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Conditions générales
          </a>
          <a
            href="https://getsellia.com/confidentialite"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Confidentialité
          </a>
          <a
            href="https://getsellia.com/cookies"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Cookies
          </a>
        </div>

        {/* COLONNE SUIVEZ-NOUS */}
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
          {resolvedWhatsapp && (
            <a
              href={resolvedWhatsapp}
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
          {!shop.instagramUrl && !resolvedWhatsapp && !shop.facebookUrl && (
            <span className={styles.linkMuted}>Bientôt disponible</span>
          )}
        </div>
      </div>

      {/* BOTTOM BAR */}
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
