import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import CapitalValueCards from "./CapitalValueCards";
import styles from "./capital.module.css";

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
      <div className={styles.shell}>
        <div className={styles.hero}>
          <header className={styles.header}>
            <span className={styles.eyebrow}>SELLIA CAPITAL</span>
            <h1 className={styles.title}>
              Obtenez un soutien de Sellia pour développer votre activité.
            </h1>
            <div className={styles.body}>
              <p>
                Cette fonctionnalité n’est pas encore disponible pour votre compte.
                Sellia avance de la trésorerie à ses marchands les plus actifs pour
                financer leur croissance — atteignez un volume minimum de
                transactions et l’accès s’active automatiquement.
              </p>
            </div>
          </header>

          <div className={styles.visual} aria-hidden>
          <div className={styles.mesh} />
          <div className={styles.particles}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={styles.particle} style={{ "--i": i } as CSSProperties} />
            ))}
          </div>
          <svg className={styles.gauge} viewBox="0 0 240 240">
            <defs>
              <linearGradient id="capSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E84B1F" stopOpacity="0" />
                <stop offset="45%" stopColor="#E84B1F" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#E84B1F" stopOpacity="0.1" />
              </linearGradient>
              <radialGradient id="capCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E84B1F" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#E84B1F" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="120" cy="120" r="88" fill="url(#capCore)" />
            <circle
              cx="120"
              cy="120"
              r="92"
              fill="none"
              stroke="rgba(14,17,22,0.05)"
              strokeWidth="6"
            />
            <circle
              className={styles.arcOuter}
              cx="120"
              cy="120"
              r="92"
              fill="none"
              stroke="url(#capSweep)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="420 160"
            />
            <circle
              className={styles.arcInner}
              cx="120"
              cy="120"
              r="72"
              fill="none"
              stroke="rgba(232,75,31,0.18)"
              strokeWidth="2"
              strokeDasharray="8 14"
            />
            <circle
              className={styles.arcMid}
              cx="120"
              cy="120"
              r="82"
              fill="none"
              stroke="rgba(232,75,31,0.35)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="60 200"
            />
          </svg>
          <div className={styles.core}>
            <span className={styles.coreDot} />
            <span className={styles.coreLabel}>Capital</span>
          </div>
          </div>
        </div>

        <CapitalValueCards />
      </div>
    </div>
  );
}
