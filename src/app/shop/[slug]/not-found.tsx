import "./shop.css";

export default function ShopNotFound() {
  return (
    <div className="shop-notfound">
      <div className="shop-notfound-inner">
        <div className="shop-notfound-emoji">🔍</div>
        <h1 className="shop-notfound-title">Boutique introuvable</h1>
        <p className="shop-notfound-text">
          Cette boutique n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <a href="https://getsellia.com" className="shop-notfound-btn">
          Découvrir Sellia
        </a>
      </div>
    </div>
  );
}
