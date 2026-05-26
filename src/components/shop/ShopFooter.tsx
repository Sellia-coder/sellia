import { db } from "@/lib/db";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { PaymentMethodsGrid } from "@/components/icons/momo-operators";
import styles from "./ShopFooter.module.css";

interface Props {
  shop: {
    id: string;
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

export default async function ShopFooter({ shop }: Props) {
  const footerPages = await db.shopPage.findMany({
    where: {
      shopId: shop.id,
      isPublished: true,
      showInFooter: true,
    },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });

  const initial = (shop.name?.[0] ?? "S").toUpperCase();
  const primaryColor = shop.primaryColor ?? "#E84B1F";
  const year = new Date().getFullYear();

  const descSnippet =
    shop.description && shop.description.length > 180
      ? `${shop.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 177)}...`
      : shop.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ??
        null;

  return (
    <footer className={styles.footer}>
      <div className={styles.row1}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogoWrap}>
            <div
              className={styles.logo}
              style={{ backgroundColor: primaryColor }}
            >
              {shop.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
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

        {footerPages.length > 0 && (
          <div className={styles.footerLinks}>
            <h4 className={styles.footerLinksTitle}>Informations</h4>
            <ul className={styles.footerLinksList}>
              {footerPages.map((page) => (
                <li key={page.slug}>
                  <Link href={`/shop/${shop.slug}/${page.slug}`}>
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.footerPayments}>
          <span className={styles.footerPaymentsLabel}>
            Moyens de paiement acceptés
          </span>
          <div className={styles.footerPaymentsList}>
            <PaymentMethodsGrid size={26} variant="full" />

            {shop.plan === "pro" && shop.paymentCashOnDelivery && (
              <div
                className={styles.footerPaymentLogoCash}
                title="Paiement à la livraison"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
              <Plus size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.separator} />

      <div className={styles.row2}>
        <div className={styles.copyright}>
          <span>
            © {year} {shop.name}
          </span>
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
