import { Truck, ShieldCheck, MessageCircle, Globe2 } from "lucide-react";
import styles from "./TrustStrip.module.css";

interface Props {
  primaryColor?: string;
  location?: string;
}

export default function TrustStrip({
  primaryColor = "#E84B1F",
  location = "Cameroun",
}: Props) {
  const items = [
    {
      icon: <Truck size={20} strokeWidth={2} />,
      title: "Livraison rapide",
      desc: "Partout dans votre région en 24-48h",
    },
    {
      icon: <ShieldCheck size={20} strokeWidth={2} />,
      title: "Paiement sécurisé",
      desc: "Mobile Money, cartes bancaires, virements",
    },
    {
      icon: <MessageCircle size={20} strokeWidth={2} />,
      title: "Support 24/7",
      desc: "Une question ? Notre équipe vous répond",
    },
    {
      icon: <Globe2 size={20} strokeWidth={2} />,
      title: `Made in ${location}`,
      desc: "Soutenez l'entrepreneuriat local",
    },
  ];

  return (
    <section className={styles.trust}>
      <div className={styles.trustInner}>
        {items.map((item, i) => (
          <div key={i} className={styles.trustItem}>
            <div
              className={styles.trustIcon}
              style={{ backgroundColor: primaryColor }}
            >
              {item.icon}
            </div>
            <div className={styles.trustText}>
              <span className={styles.trustTitle}>{item.title}</span>
              <span className={styles.trustDesc}>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
