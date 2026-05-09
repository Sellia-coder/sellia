import Link from "next/link";
import { Sparkles } from "lucide-react";
import PaymentLogos from "./PaymentLogos";

interface Props {
  shop: {
    slug: string;
    name: string;
    tagline: string | null;
    logoUrl: string | null;
    paymentCashOnDelivery?: boolean;
    paymentOnlineEscrow?: boolean;
  };
}

export default function ShopFooter({ shop }: Props) {
  const year = new Date().getFullYear();
  const homePath = `/shop/${shop.slug}`;
  const initial = (shop.name?.[0] ?? "S").toUpperCase();

  return (
    <footer className="shop-footer">
      <div className="shop-container shop-footer-grid">
        <div className="shop-footer-col shop-footer-col-brand">
          <div className="shop-footer-brand">
            <div
              className="shop-footer-logo"
              style={{
                background: shop.logoUrl ? "transparent" : "var(--shop-primary)",
              }}
            >
              {shop.logoUrl ? (
                <img src={shop.logoUrl} alt={shop.name} />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div>
              <div className="shop-footer-brand-name">{shop.name}</div>
              {shop.tagline && (
                <div className="shop-footer-brand-tagline">{shop.tagline}</div>
              )}
            </div>
          </div>
        </div>

        <div className="shop-footer-col">
          <h3 className="shop-footer-col-title">Boutique</h3>
          <ul className="shop-footer-links">
            <li>
              <Link href={homePath}>Accueil</Link>
            </li>
            <li>
              <Link href={`${homePath}#produits`}>Produits</Link>
            </li>
            <li>
              <Link href={`${homePath}/a-propos`}>À propos</Link>
            </li>
            <li>
              <Link href={`${homePath}/contact`}>Contact</Link>
            </li>
          </ul>
        </div>

        <div className="shop-footer-col">
          <h3 className="shop-footer-col-title">Informations légales</h3>
          <ul className="shop-footer-links">
            <li>
              <a
                href="https://getsellia.com/mentions-legales"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mentions légales
              </a>
            </li>
            <li>
              <a
                href="https://getsellia.com/conditions"
                target="_blank"
                rel="noopener noreferrer"
              >
                Conditions générales
              </a>
            </li>
            <li>
              <a
                href="https://getsellia.com/confidentialite"
                target="_blank"
                rel="noopener noreferrer"
              >
                Confidentialité
              </a>
            </li>
            <li>
              <a
                href="https://getsellia.com/cookies"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cookies
              </a>
            </li>
          </ul>
        </div>

        <div className="shop-footer-col">
          <h3 className="shop-footer-col-title">Paiements sécurisés</h3>
          <PaymentLogos
            size="sm"
            showCashOnDelivery={shop.paymentCashOnDelivery ?? false}
          />
          <p className="shop-footer-secure-note">
            <Sparkles size={11} strokeWidth={2} />
            Sécurisé par <strong>Sellia</strong>
          </p>
        </div>
      </div>

      <div className="shop-footer-bottom">
        <div className="shop-container shop-footer-bottom-inner">
          <div className="shop-footer-credit">
            © {year} <strong>{shop.name}</strong> · Tous droits réservés
          </div>
          <a
            href="https://getsellia.com?utm_source=shop&utm_medium=footer"
            target="_blank"
            rel="noopener noreferrer"
            className="shop-footer-poweredby"
          >
            Créé avec <strong>Sellia</strong>
          </a>
        </div>
      </div>
    </footer>
  );
}
