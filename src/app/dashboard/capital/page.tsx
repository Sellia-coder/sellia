import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import styles from "./capital.module.css";

const VALUE_POINTS = [
  {
    title: "Avance instantanée",
    desc: "Des fonds disponibles en quelques minutes, une fois votre boutique éligible.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: "Remboursement flexible",
    desc: "Un petit pourcentage prélevé sur vos ventes — jamais plus que ce que vous encaissez.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20v-4" />
      </svg>
    ),
  },
  {
    title: "Zéro paperasse",
    desc: "Pas de dossier bancaire, pas de garantie personnelle. Sellia s'appuie sur votre activité.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
] as const;

export default async function CapitalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
  });
  if (!shop) redirect("/personnaliser-ma-boutique");

  return (
    <div className={styles.page}>
      <div className={styles.bgOrbs} aria-hidden="true">
        <span className={styles.orb1} />
        <span className={styles.orb2} />
        <span className={styles.orb3} />
      </div>

      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>SELLIA CAPITAL</span>
          <h1 className={styles.title}>
            Le carburant financier de votre croissance
          </h1>
          <p className={styles.hook}>
            Bientôt, Sellia vous avance la trésorerie pour stocker, lancer une
            campagne ou passer un cap — remboursée automatiquement sur un petit
            pourcentage de vos ventes. Sans dossier, sans garantie, sans stress.
          </p>
          <div className={styles.eligibility}>
            <span className={styles.eligibilityBadge}>Pas encore éligible</span>
            <p className={styles.eligibilityText}>
              Votre éligibilité se construit automatiquement à mesure que votre
              boutique réalise des transactions. Continuez à vendre — nous
              calculons votre potentiel en coulisses.
            </p>
          </div>
        </div>

        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.visualCard}>
            <svg className={styles.ringSvg} viewBox="0 0 200 200">
              <defs>
                <linearGradient id="capitalRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E84B1F" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#E84B1F" stopOpacity="0.25" />
                </linearGradient>
              </defs>
              <circle
                className={styles.ringTrack}
                cx="100"
                cy="100"
                r="78"
                fill="none"
                strokeWidth="6"
              />
              <circle
                className={styles.ringProgress}
                cx="100"
                cy="100"
                r="78"
                fill="none"
                strokeWidth="6"
                stroke="url(#capitalRingGrad)"
                strokeLinecap="round"
              />
            </svg>

            <div className={styles.lockCore}>
              <svg
                className={styles.lockIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className={styles.unlockLabel}>À débloquer</span>
            </div>

            <svg className={styles.growthChart} viewBox="0 0 120 48" preserveAspectRatio="none">
              <path
                className={styles.growthLine}
                d="M0 40 C 20 38, 28 28, 44 26 S 72 18, 88 12 S 108 6, 120 4"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                className={styles.growthArea}
                d="M0 40 C 20 38, 28 28, 44 26 S 72 18, 88 12 S 108 6, 120 4 L 120 48 L 0 48 Z"
              />
            </svg>

            <div className={styles.shimmer} />
          </div>
        </div>
      </div>

      <div className={styles.valueGrid}>
        {VALUE_POINTS.map((point) => (
          <article key={point.title} className={styles.valueCard}>
            <div className={styles.valueIcon}>{point.icon}</div>
            <h2 className={styles.valueTitle}>{point.title}</h2>
            <p className={styles.valueDesc}>{point.desc}</p>
          </article>
        ))}
      </div>

      <p className={styles.trustLine}>
        Conçu pour les commerçants africains. Transparent, sans frais cachés.
      </p>
    </div>
  );
}
