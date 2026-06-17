"use client";

import { Lightning, ChartLineUp, FileText } from "@phosphor-icons/react";
import styles from "./capital.module.css";

const CARDS = [
  {
    icon: Lightning,
    title: "Avance instantanée",
    text: "Des fonds disponibles en quelques minutes, une fois votre boutique éligible.",
  },
  {
    icon: ChartLineUp,
    title: "Remboursement flexible",
    text: "Un petit pourcentage prélevé sur vos ventes — jamais plus que ce que vous encaissez.",
  },
  {
    icon: FileText,
    title: "Zéro paperasse",
    text: "Pas de dossier bancaire, pas de garantie personnelle. Sellia s'appuie sur votre activité.",
  },
] as const;

export default function CapitalValueCards() {
  return (
    <>
      <ul className={styles.valueGrid}>
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <li key={card.title} className={styles.valueCard}>
              <div className={styles.valueIconWrap}>
                <Icon size={22} weight="regular" color="#E84B1F" aria-hidden />
              </div>
              <h2 className={styles.valueTitle}>{card.title}</h2>
              <p className={styles.valueText}>{card.text}</p>
            </li>
          );
        })}
      </ul>
      <p className={styles.trustLine}>
        Conçu pour les commerçants africains. Transparent, sans frais cachés.
      </p>
    </>
  );
}
