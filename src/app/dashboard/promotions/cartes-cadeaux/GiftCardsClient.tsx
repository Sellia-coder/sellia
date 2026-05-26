"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  CaretLeft,
  Copy,
  Eye,
  EyeSlash,
  CheckCircle,
} from "@phosphor-icons/react";
import { toggleGiftCardActiveAction } from "@/app/actions/giftcards";
import { useRouter } from "next/navigation";
import GiftCardCreateModal from "./GiftCardCreateModal";
import SuccessModal from "@/components/dashboard/SuccessModal";
import EmptyGiftCards from "../empty-states/EmptyGiftCards";
import styles from "./gift-cards.module.css";

interface GiftCardRow {
  id: string;
  code: string;
  initialAmount: number;
  remainingAmount: number;
  buyerName: string | null;
  recipientName: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Props {
  currency: string;
  stats: { totalIssued: number; totalUsed: number; totalRemaining: number };
  giftCards: GiftCardRow[];
}

function displayCurrency(currency: string) {
  return currency === "XAF" ? "FCFA" : currency;
}

export default function GiftCardsClient({
  currency,
  stats,
  giftCards,
}: Props) {
  const router = useRouter();
  const cur = displayCurrency(currency);
  const formatPrice = (n: number) => n.toLocaleString("fr-FR");
  const [showModal, setShowModal] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const handleToggle = async (g: GiftCardRow) => {
    setBusyId(g.id);
    await toggleGiftCardActiveAction(g.id, !g.isActive);
    router.refresh();
    setBusyId(null);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "Sans expiration";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
          <Plus size={15} weight="bold" /> Nouvelle carte
        </button>
      </div>

      <div className={styles.header}>
        <span className={styles.eyebrow}>— PROMOTIONS / CARTES CADEAUX</span>
        <h1 className={styles.title}>Cartes cadeaux</h1>
        <p className={styles.subtitle}>
          Vendez des cartes pré-payées pour les fêtes et occasions spéciales.
        </p>
      </div>

      {createdCode && (
        <div
          style={{
            padding: "14px 18px",
            background: "#EDE9FE",
            borderRadius: 12,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          Carte créée : <strong>{createdCode}</strong> — partagez ce code avec
          votre client.
        </div>
      )}

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Valeur émise</div>
          <div className={styles.statValue}>
            {formatPrice(stats.totalIssued)} {cur}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Valeur utilisée</div>
          <div className={styles.statValue}>
            {formatPrice(stats.totalUsed)} {cur}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Solde en circulation</div>
          <div className={styles.statValue}>
            {formatPrice(stats.totalRemaining)} {cur}
          </div>
        </div>
      </div>

      {giftCards.length === 0 ? (
        <div className={styles.emptyState}>
          <EmptyGiftCards size={160} />
          <h3>Aucune carte cadeau</h3>
          <p>Créez votre première carte pour offrir un cadeau pré-payé.</p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={styles.btnPrimary}
            style={{ marginTop: 16 }}
          >
            <Plus size={15} weight="bold" /> Créer une carte
          </button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Montant initial</th>
                <th>Solde</th>
                <th>Bénéficiaire</th>
                <th>Expiration</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {giftCards.map((g) => (
                <tr
                  key={g.id}
                  className={!g.isActive ? styles.rowInactive : ""}
                >
                  <td>
                    <button
                      type="button"
                      onClick={() => handleCopy(g.code)}
                      className={styles.cellCode}
                    >
                      <span className={styles.codeMono}>{g.code}</span>
                      {copiedCode === g.code ? (
                        <CheckCircle size={12} weight="fill" color="#15803D" />
                      ) : (
                        <Copy size={11} />
                      )}
                    </button>
                  </td>
                  <td className={styles.cellDiscount}>
                    {formatPrice(g.initialAmount)} {cur}
                  </td>
                  <td>{formatPrice(g.remainingAmount)} {cur}</td>
                  <td className={styles.cellName}>
                    {g.recipientName || g.buyerName || "—"}
                  </td>
                  <td className={styles.cellMeta}>{formatDate(g.expiresAt)}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${g.isActive ? styles.statusActive : styles.statusInactive}`}
                    >
                      {g.isActive ? "Active" : "Désactivée"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        onClick={() => handleToggle(g)}
                        disabled={busyId === g.id}
                        className={styles.actionBtn}
                      >
                        {g.isActive ? <EyeSlash size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <GiftCardCreateModal
          currency={currency}
          onClose={() => setShowModal(false)}
          onSaved={(code) => {
            setShowModal(false);
            setCreatedCode(code);
            setSuccessMessage("Carte cadeau créée avec succès");
            router.refresh();
          }}
        />
      )}

      {successMessage && (
        <SuccessModal
          title={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
}
