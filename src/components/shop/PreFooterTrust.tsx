import { Truck, ShieldCheck, Headphones, Sparkles } from "lucide-react";

export default function PreFooterTrust() {
  const blocks = [
    {
      icon: Truck,
      eyebrow: "01",
      title: "Livraison express",
      desc: "Reçois ta commande en 24 à 72 heures, partout dans ta zone. Suivi WhatsApp en temps réel.",
      highlight: "24-72h",
    },
    {
      icon: ShieldCheck,
      eyebrow: "02",
      title: "Paiement protégé",
      desc: "Tes fonds sont sécurisés par Sellia. Remboursement automatique si non livré sous 6 jours.",
      highlight: "100% sécurisé",
    },
    {
      icon: Headphones,
      eyebrow: "03",
      title: "Service client réactif",
      desc: "Une question ? Un souci ? Notre équipe te répond sous 24h, par WhatsApp ou email.",
      highlight: "24h max",
    },
    {
      icon: Sparkles,
      eyebrow: "04",
      title: "Qualité garantie",
      desc: "Chaque produit est sélectionné avec soin. Si tu n'es pas satisfait, on s'engage à trouver une solution.",
      highlight: "Satisfait",
    },
  ];

  return (
    <section className="shop-prefooter-trust">
      <div className="shop-container">
        <header className="shop-prefooter-trust-header">
          <div className="shop-prefooter-trust-eyebrow">
            <span className="shop-prefooter-trust-eyebrow-dot" />
            Nos engagements
          </div>
          <h2 className="shop-prefooter-trust-title">
            Acheter ici, en toute confiance
          </h2>
          <p className="shop-prefooter-trust-subtitle">
            Quatre engagements concrets pour rendre ton expérience d&apos;achat
            simple, sûre et sans surprise.
          </p>
        </header>

        <div className="shop-prefooter-trust-grid">
          {blocks.map((b, i) => {
            const Icon = b.icon;
            return (
              <article className="shop-prefooter-trust-card" key={i}>
                <div className="shop-prefooter-trust-card-eyebrow">
                  {b.eyebrow}
                </div>
                <div className="shop-prefooter-trust-card-icon">
                  <Icon size={22} strokeWidth={1.6} />
                </div>
                <div className="shop-prefooter-trust-card-body">
                  <h3 className="shop-prefooter-trust-card-title">
                    {b.title}
                  </h3>
                  <p className="shop-prefooter-trust-card-desc">{b.desc}</p>
                  <div className="shop-prefooter-trust-card-highlight">
                    {b.highlight}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
