"use client";

import { useEffect, useRef, useState } from "react";
import { Truck, ShieldCheck, Headphones, Sparkles } from "lucide-react";
import styles from "./trust-section.module.css";

interface Props {
  variant?: "default" | "compact";
  className?: string;
}

const TRUST_ITEMS = [
  {
    icon: <Truck size={20} strokeWidth={1.75} />,
    iconBg: "#FFE9DB",
    iconColor: "#C2410C",
    number: "01",
    title: "Livraison express",
    description:
      "Reçois ta commande en 24 à 72 heures, partout dans ta zone. Suivi WhatsApp en temps réel.",
    badge: "24-72h",
  },
  {
    icon: <ShieldCheck size={20} strokeWidth={1.75} />,
    iconBg: "#DCFCE7",
    iconColor: "#15803D",
    number: "02",
    title: "Paiement protégé",
    description:
      "Tes fonds sont sécurisés par Sellia. Remboursement automatique si non livré sous 6 jours.",
    badge: "100% sécurisé",
  },
  {
    icon: <Headphones size={20} strokeWidth={1.75} />,
    iconBg: "#DBEAFE",
    iconColor: "#1D4ED8",
    number: "03",
    title: "Service client réactif",
    description:
      "Une question ? Un souci ? Notre équipe te répond sous 24h, par WhatsApp ou email.",
    badge: "24h max",
  },
  {
    icon: <Sparkles size={20} strokeWidth={1.75} />,
    iconBg: "#FEE2E2",
    iconColor: "#B91C1C",
    number: "04",
    title: "Qualité garantie",
    description:
      "Chaque produit est sélectionné avec soin. Si tu n'es pas satisfait, on s'engage à trouver une solution.",
    badge: "Satisfait",
  },
];

export default function TrustSection({ variant = "default", className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      className={`${styles.section} ${variant === "compact" ? styles.sectionCompact : ""} ${className || ""}`}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>NOS ENGAGEMENTS</span>
          <h2 className={styles.title}>Acheter ici, en toute confiance</h2>
          <p className={styles.subtitle}>
            Quatre engagements concrets pour rendre ton expérience d&apos;achat
            simple, sûre et sans surprise.
          </p>
        </div>

        <div className={styles.grid}>
          {TRUST_ITEMS.map((item, idx) => (
            <article
              key={item.number}
              className={`${styles.card} ${visible ? styles.cardVisible : ""}`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className={styles.cardNumber}>{item.number}</div>
              <div
                className={styles.cardIcon}
                style={{ background: item.iconBg, color: item.iconColor }}
              >
                {item.icon}
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.description}</p>
              <div className={styles.cardBadge}>{item.badge}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
