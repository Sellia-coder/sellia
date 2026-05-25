"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  CaretLeft,
  Lightning,
  Trash,
  Eye,
  EyeSlash,
  Percent,
  CurrencyDollar,
} from "@phosphor-icons/react";
import {
  toggleFlashActiveAction,
  deleteFlashCampaignAction,
} from "@/app/actions/flash-campaigns";
import { useRouter } from "next/navigation";
import FlashCreateModal from "./FlashCreateModal";
import EmptyFlash from "../empty-states/EmptyFlash";
import styles from "./flash.module.css";

interface CampaignRow {
  id: string;
  name: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  startsAt: string;
  endsAt: string;
  productIds: string[];
  isActive: boolean;
  ordersCount: number;
  totalDiscount: number;
}

interface ProductOption {
  id: string;
  name: string;
}

interface Props {
  currency: string;
  products: ProductOption[];
  campaigns: CampaignRow[];
}

function displayCurrency(currency: string) {
  return currency === "XAF" ? "FCFA" : currency;
}

function getPhase(c: CampaignRow): "upcoming" | "live" | "ended" {
  const now = Date.now();
  const start = new Date(c.startsAt).getTime();
  const end = new Date(c.endsAt).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "live";
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}j ${pad(h % 24)}:${pad(m)}:${pad(sec)}`;
  }
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function Countdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState(
    new Date(endsAt).getTime() - Date.now()
  );

  useEffect(() => {
    const t = setInterval(() => {
      setRemaining(new Date(endsAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (remaining <= 0) return null;
  return (
    <div className={styles.countdown}>
      ⏱ Fin dans {formatCountdown(remaining)}
    </div>
  );
}

export default function FlashCampaignsClient({
  currency,
  products,
  campaigns,
}: Props) {
  const router = useRouter();
  const cur = displayCurrency(currency);
  const formatPrice = (n: number) => n.toLocaleString("fr-FR");
  const [showModal, setShowModal] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleToggle = async (c: CampaignRow) => {
    setBusyId(c.id);
    await toggleFlashActiveAction(c.id, !c.isActive);
    router.refresh();
    setBusyId(null);
  };

  const handleDelete = async (c: CampaignRow) => {
    if (!confirm(`Supprimer la campagne « ${c.name} » ?`)) return;
    setBusyId(c.id);
    await deleteFlashCampaignAction(c.id);
    router.refresh();
    setBusyId(null);
  };

  const phaseLabel = (phase: string, active: boolean) => {
    if (!active) return { label: "Désactivée", cls: styles.statusInactive };
    if (phase === "upcoming")
      return { label: "À venir", cls: styles.statusUpcoming };
    if (phase === "live") return { label: "En cours", cls: styles.statusLive };
    return { label: "Terminée", cls: styles.statusEnded };
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <Link href="/dashboard/promotions" className={styles.backLink}>
          <CaretLeft size={14} weight="bold" /> Promotions
        </Link>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={styles.btnPrimary}
        >
          <Plus size={15} weight="bold" /> Nouvelle campagne
        </button>
      </div>

      <div className={styles.header}>
        <span className={styles.eyebrow}>— PROMOTIONS / FLASH</span>
        <h1 className={styles.title}>Campagnes flash</h1>
        <p className={styles.subtitle}>
          Lancez des promotions limitées dans le temps avec compte à rebours.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className={styles.emptyState}>
          <EmptyFlash size={160} />
          <h3>Aucune campagne</h3>
          <p>Créez une campagne flash pour créer l&apos;urgence d&apos;achat.</p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={styles.btnPrimary}
            style={{ marginTop: 16 }}
          >
            <Plus size={15} weight="bold" /> Créer une campagne
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {campaigns.map((c) => {
            const phase = getPhase(c);
            const status = phaseLabel(phase, c.isActive);
            return (
              <div key={c.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardName}>
                    <Lightning
                      size={18}
                      weight="duotone"
                      color="#1D4ED8"
                      style={{ marginRight: 6, verticalAlign: "middle" }}
                    />
                    {c.name}
                  </div>
                  <span className={`${styles.statusBadge} ${status.cls}`}>
                    {status.label}
                  </span>
                </div>
                <div className={styles.discount}>
                  {c.discountType === "PERCENTAGE" ? (
                    <>
                      <Percent
                        size={16}
                        style={{ display: "inline", verticalAlign: "middle" }}
                      />{" "}
                      {c.discountValue}%
                    </>
                  ) : (
                    <>
                      <CurrencyDollar
                        size={16}
                        style={{ display: "inline", verticalAlign: "middle" }}
                      />{" "}
                      {formatPrice(c.discountValue)} {cur}
                    </>
                  )}
                </div>
                {phase === "live" && c.isActive && (
                  <Countdown endsAt={c.endsAt} />
                )}
                <div className={styles.meta}>
                  {new Date(c.startsAt).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}{" "}
                  →{" "}
                  {new Date(c.endsAt).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
                <div className={styles.meta}>
                  {c.productIds.length === 0
                    ? "Tous les produits"
                    : `${c.productIds.length} produit(s) ciblé(s)`}
                  · {c.ordersCount} commande(s) · -
                  {formatPrice(c.totalDiscount)} {cur}
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => handleToggle(c)}
                    disabled={busyId === c.id}
                    className={styles.actionBtn}
                  >
                    {c.isActive ? (
                      <EyeSlash size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    disabled={busyId === c.id}
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <FlashCreateModal
          products={products}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
