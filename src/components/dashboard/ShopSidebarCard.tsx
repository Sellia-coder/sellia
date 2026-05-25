"use client";

import { ArrowSquareOut, CheckCircle } from "@phosphor-icons/react";
import ShopAvatar from "./ShopAvatar";
import styles from "./shop-sidebar-card.module.css";

interface Props {
  shopName: string;
  shopSlug: string;
  planId: string;
  shopDomain?: string;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Plan Découverte",
  pro: "Plan Pro",
  business: "Plan Business",
};

export default function ShopSidebarCard({
  shopName,
  shopSlug,
  planId,
  shopDomain,
}: Props) {
  const url = shopDomain || `${shopSlug}.getsellia.com`;
  const planLabel = PLAN_LABELS[planId] || "Plan Découverte";
  const isPaidPlan = planId !== "free";

  return (
    <a
      href={`https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      aria-label="Voir ma boutique"
    >
      <div className={styles.avatarWrap}>
        <ShopAvatar size={42} />
        <div className={styles.statusDot} aria-hidden />
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{shopName}</span>
          <ArrowSquareOut
            size={11}
            weight="bold"
            className={styles.linkIcon}
          />
        </div>
        <div className={styles.url}>{url}</div>
        <div className={styles.planRow}>
          {isPaidPlan && (
            <CheckCircle
              size={10}
              weight="fill"
              color="#15803D"
              className={styles.planIcon}
            />
          )}
          <span
            className={`${styles.planBadge} ${isPaidPlan ? styles.planPaid : ""}`}
          >
            {planLabel}
          </span>
        </div>
      </div>
    </a>
  );
}
