import { Sparkles } from "lucide-react";

interface Props {
  shop: { name: string };
}

export default function ShopFooter({ shop }: Props) {
  const year = new Date().getFullYear();
  return (
    <footer className="shop-footer">
      <div className="shop-container shop-footer-inner">
        <div className="shop-footer-credit">
          © {year} {shop.name} · Tous droits réservés
        </div>
        <a
          href="https://getsellia.com?utm_source=shop&utm_medium=footer"
          target="_blank"
          rel="noopener noreferrer"
          className="shop-footer-poweredby"
        >
          <Sparkles size={11} strokeWidth={2} />
          Créé avec <strong>Sellia</strong>
        </a>
      </div>
    </footer>
  );
}
