import PaymentLogos from "./PaymentLogos";
import styles from "./ShopFooter.module.css";

interface Props {
  shop: {
    slug: string;
    name: string;
    tagline?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
  };
}

export default function ShopFooter({ shop }: Props) {
  const initial = (shop.name?.[0] ?? "S").toUpperCase();
  const primaryColor = shop.primaryColor ?? "#E84B1F";
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* LIGNE 1 — Brand à gauche, Paiements à droite */}
      <div className={styles.row1}>
        <div className={styles.brand}>
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

        <div className={styles.paymentsWrap}>
          <span className={styles.paymentsLabel}>Paiements acceptés</span>
          <PaymentLogos size="md" variant="circle" />
        </div>
      </div>

      <div className={styles.separator} />

      <div className={styles.row2}>
        <div className={styles.legalLinks}>
          <a
            href="https://getsellia.com/mentions-legales"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.legalLink}
          >
            Mentions légales
          </a>
          <a
            href="https://getsellia.com/conditions"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.legalLink}
          >
            Conditions générales
          </a>
          <a
            href="https://getsellia.com/confidentialite"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.legalLink}
          >
            Confidentialité
          </a>
          <a
            href="https://getsellia.com/cookies"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.legalLink}
          >
            Cookies
          </a>
        </div>

        <div className={styles.copyright}>
          <span>© {year} {shop.name}</span>
          <span className={styles.dot}>·</span>
          <span>
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
