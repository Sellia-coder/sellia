"use client";

import { useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { ShieldCheck, Lock, Scales } from "@phosphor-icons/react";
import styles from "./buyer-protection-modal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ITEMS = [
  {
    icon: Lock,
    title: "Paiement sécurisé",
    desc: "Mobile Money et carte bancaire via une plateforme de paiement chiffrée.",
  },
  {
    icon: ShieldCheck,
    title: "Fonds protégés",
    desc: "Votre paiement est conservé en sécurité jusqu'à la confirmation de votre commande. Le vendeur n'est payé qu'après.",
  },
  {
    icon: Scales,
    title: "Litige facilité",
    desc: "En cas de problème, connectez-vous à votre espace client avec l'email de commande et ouvrez un litige depuis « Mes achats ».",
  },
] as const;

export default function BuyerProtectionModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="buyer-protection-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden />
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={18} weight="bold" />
          </button>
          <div className={styles.heroIcon} aria-hidden>
            <ShieldCheck size={28} weight="duotone" />
          </div>
          <p className={styles.heroEyebrow}>Protection Sellia</p>
          <h2 id="buyer-protection-title" className={styles.heroTitle}>
            Commandez en toute confiance
          </h2>
        </div>

        <div className={styles.body}>
          <p className={styles.lead}>
            Chaque achat sur cette boutique bénéficie des garanties Sellia — sans quitter
            la boutique pour commander.
          </p>
          <ul className={styles.items}>
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className={styles.item}>
                  <div className={styles.itemIcon} aria-hidden>
                    <Icon size={20} weight="duotone" />
                  </div>
                  <div className={styles.itemText}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.itemDesc}>{item.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cta} onClick={onClose}>
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>
  );
}
