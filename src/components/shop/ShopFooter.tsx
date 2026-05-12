import { Plus } from "lucide-react";
import PaymentLogos from "./PaymentLogos";
import styles from "./ShopFooter.module.css";

interface Props {
  shop: {
    slug: string;
    name: string;
    tagline?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
    plan?: string | null;
    paymentCashOnDelivery?: boolean;
  };
}

export default function ShopFooter({ shop }: Props) {
  const initial = (shop.name?.[0] ?? "S").toUpperCase();
  const primaryColor = shop.primaryColor ?? "#E84B1F";
  const year = new Date().getFullYear();

  const descSnippet =
    shop.description && shop.description.length > 180
      ? `${shop.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 177)}...`
      : shop.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? null;

  return (
    <footer className={styles.footer}>
      {/* LIGNE 1 — Brand + Description à gauche, Paiements à droite */}
      <div className={styles.row1}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogoWrap}>
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
            <div>
              <h4 className={styles.footerName}>{shop.name}</h4>
              {shop.tagline && (
                <p className={styles.footerTagline}>{shop.tagline}</p>
              )}
            </div>
          </div>

          {descSnippet && (
            <p className={styles.footerDescription}>{descSnippet}</p>
          )}
        </div>

        <div className={styles.footerPayments}>
          <span className={styles.footerPaymentsLabel}>Moyens de paiement acceptés</span>
          <div className={styles.footerPaymentsList}>
            <div className={styles.footerPaymentLogo} title="MTN Mobile Money">
              <PaymentLogos methods={["mtn_momo"]} size="md" variant="circle" />
            </div>
            <div className={styles.footerPaymentLogo} title="Orange Money">
              <PaymentLogos methods={["orange_money"]} size="md" variant="circle" />
            </div>
            <div className={styles.footerPaymentLogo} title="Moov Money">
              <PaymentLogos methods={["moov_money"]} size="md" variant="circle" />
            </div>
            <div className={styles.footerPaymentLogo} title="Visa">
              <PaymentLogos methods={["visa"]} size="md" variant="rounded" />
            </div>
            <div className={styles.footerPaymentLogo} title="Mastercard">
              <PaymentLogos methods={["mastercard"]} size="md" variant="rounded" />
            </div>

            {shop.plan === "pro" && shop.paymentCashOnDelivery && (
              <div className={styles.footerPaymentLogoCash} title="Paiement à la livraison">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
              </div>
            )}

            <button
              type="button"
              className={styles.footerPaymentMore}
              title="Et bien plus de moyens de paiement"
              aria-label="Voir tous les moyens de paiement"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
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
