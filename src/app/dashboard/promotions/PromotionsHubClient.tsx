"use client";

import Link from "next/link";
import {
  Ticket,
  Gift,
  Lightning,
  Trophy,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react";
import styles from "./promotions-hub.module.css";

interface Props {
  currency: string;
  stats: {
    coupons: { total: number; active: number; totalUses: number };
    giftCards: { total: number; active: number; totalIssued: number };
    flash: { total: number; active: number };
    loyalty: { enabled: boolean; accountsCount: number };
  };
}

const formatPrice = (n: number) => n.toLocaleString("fr-FR");

function displayCurrency(currency: string) {
  return currency === "XAF" ? "FCFA" : currency;
}

export default function PromotionsHubClient({ currency, stats }: Props) {
  const cur = displayCurrency(currency);

  const modules = [
    {
      key: "coupons",
      title: "Coupons de réduction",
      description:
        "Créez des codes promo pour fidéliser et augmenter vos ventes.",
      icon: <Ticket size={28} weight="duotone" />,
      href: "/dashboard/promotions/coupons",
      color: "#E84B1F",
      bg: "#FFEDD5",
      stats: [
        { label: "Codes actifs", value: stats.coupons.active.toString() },
        { label: "Utilisations", value: stats.coupons.totalUses.toString() },
      ],
    },
    {
      key: "gift-cards",
      title: "Cartes cadeaux",
      description:
        "Vendez des cartes cadeaux pré-payées, idéales pour les fêtes.",
      icon: <Gift size={28} weight="duotone" />,
      href: "/dashboard/promotions/cartes-cadeaux",
      color: "#7C3AED",
      bg: "#EDE9FE",
      stats: [
        { label: "Cartes émises", value: stats.giftCards.active.toString() },
        {
          label: "Valeur totale",
          value: `${formatPrice(stats.giftCards.totalIssued)} ${cur}`,
        },
      ],
    },
    {
      key: "flash",
      title: "Campagnes flash",
      description:
        "Lancez des promotions limitées dans le temps avec timer visible.",
      icon: <Lightning size={28} weight="duotone" />,
      href: "/dashboard/promotions/campagnes-flash",
      color: "#1D4ED8",
      bg: "#DBEAFE",
      stats: [
        { label: "Campagnes en cours", value: stats.flash.active.toString() },
        { label: "Total créées", value: stats.flash.total.toString() },
      ],
    },
    {
      key: "loyalty",
      title: "Programme fidélité",
      description:
        "Récompensez vos meilleurs clients avec un système de points.",
      icon: <Trophy size={28} weight="duotone" />,
      href: "/dashboard/promotions/fidelite",
      color: "#15803D",
      bg: "#DCFCE7",
      stats: [
        {
          label: "Statut",
          value: stats.loyalty.enabled ? "Actif" : "Désactivé",
        },
        {
          label: "Clients inscrits",
          value: stats.loyalty.accountsCount.toString(),
        },
      ],
    },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>— PROMOTIONS</span>
          <h1 className={styles.title}>Boostez vos ventes</h1>
          <p className={styles.subtitle}>
            Quatre outils marketing pour attirer de nouveaux clients, fidéliser
            les existants et augmenter votre chiffre d&apos;affaires.
          </p>
        </div>
      </div>

      <div className={styles.insightBanner}>
        <div className={styles.insightIcon}>
          <Sparkle size={18} weight="duotone" />
        </div>
        <div className={styles.insightText}>
          <strong>Saviez-vous ?</strong>
          <span>
            Les marchands qui utilisent au moins 2 outils marketing voient leurs
            ventes augmenter de 35% en moyenne.
          </span>
        </div>
      </div>

      <div className={styles.modulesGrid}>
        {modules.map((m) => (
          <Link key={m.key} href={m.href} className={styles.moduleCard}>
            <div
              className={styles.moduleIcon}
              style={{ background: m.bg, color: m.color }}
            >
              {m.icon}
            </div>
            <h2 className={styles.moduleTitle}>{m.title}</h2>
            <p className={styles.moduleDescription}>{m.description}</p>
            <div className={styles.moduleStats}>
              {m.stats.map((s, idx) => (
                <div key={idx} className={styles.moduleStat}>
                  <span className={styles.moduleStatLabel}>{s.label}</span>
                  <span className={styles.moduleStatValue}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className={styles.moduleCta}>
              <span>Gérer</span>
              <ArrowRight size={14} weight="bold" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
