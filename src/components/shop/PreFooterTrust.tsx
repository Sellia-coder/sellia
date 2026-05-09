import { Truck, ShieldCheck, MessageCircle, Award } from "lucide-react";

export default function PreFooterTrust() {
  return (
    <section className="shop-prefooter-trust">
      <div className="shop-container">
        <div className="shop-prefooter-trust-grid">
          <div className="shop-prefooter-trust-item">
            <div className="shop-prefooter-trust-icon">
              <Truck size={22} strokeWidth={1.6} />
            </div>
            <div className="shop-prefooter-trust-text">
              <div className="shop-prefooter-trust-title">Livraison rapide</div>
              <div className="shop-prefooter-trust-desc">
                Sous 24-72h selon ta zone
              </div>
            </div>
          </div>

          <div className="shop-prefooter-trust-item">
            <div className="shop-prefooter-trust-icon">
              <ShieldCheck size={22} strokeWidth={1.6} />
            </div>
            <div className="shop-prefooter-trust-text">
              <div className="shop-prefooter-trust-title">Paiement sécurisé</div>
              <div className="shop-prefooter-trust-desc">
                Fonds protégés par Sellia
              </div>
            </div>
          </div>

          <div className="shop-prefooter-trust-item">
            <div className="shop-prefooter-trust-icon">
              <MessageCircle size={22} strokeWidth={1.6} />
            </div>
            <div className="shop-prefooter-trust-text">
              <div className="shop-prefooter-trust-title">SAV réactif</div>
              <div className="shop-prefooter-trust-desc">
                Réponse sous 24h
              </div>
            </div>
          </div>

          <div className="shop-prefooter-trust-item">
            <div className="shop-prefooter-trust-icon">
              <Award size={22} strokeWidth={1.6} />
            </div>
            <div className="shop-prefooter-trust-text">
              <div className="shop-prefooter-trust-title">Qualité garantie</div>
              <div className="shop-prefooter-trust-desc">
                Produits sélectionnés avec soin
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
