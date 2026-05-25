"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { createGiftCardAction } from "@/app/actions/giftcards";
import styles from "@/components/dashboard/coupon-editor-modal.module.css";

interface Props {
  currency: string;
  onClose: () => void;
  onSaved: (code: string) => void;
}

function displayCurrency(currency: string) {
  return currency === "XAF" ? "FCFA" : currency;
}

export default function GiftCardCreateModal({
  currency,
  onClose,
  onSaved,
}: Props) {
  const cur = displayCurrency(currency);
  const [amount, setAmount] = useState("10000");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [message, setMessage] = useState("");
  const [expiresInMonths, setExpiresInMonths] = useState("12");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    const res = await createGiftCardAction({
      amount: parseInt(amount, 10) || 0,
      buyerName: buyerName || undefined,
      buyerPhone: buyerPhone || undefined,
      recipientName: recipientName || undefined,
      recipientPhone: recipientPhone || undefined,
      message: message || undefined,
      expiresInMonths: parseInt(expiresInMonths, 10) || 12,
    });
    setSaving(false);
    if (res.ok && res.code) onSaved(res.code);
    else setError(res.error || "Erreur");
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Nouvelle carte cadeau</h2>
            <p className={styles.subtitle}>
              Un code unique sera généré automatiquement.
            </p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Montant ({cur})</label>
            <input
              type="number"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1000}
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Acheteur (optionnel)</label>
              <input
                className={styles.input}
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tél. acheteur</label>
              <input
                className={styles.input}
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Bénéficiaire</label>
              <input
                className={styles.input}
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tél. bénéficiaire</label>
              <input
                className={styles.input}
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Message</label>
            <textarea
              className={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Validité (mois)</label>
            <input
              type="number"
              className={styles.input}
              value={expiresInMonths}
              onChange={(e) => setExpiresInMonths(e.target.value)}
              min={1}
              max={36}
            />
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose} className={styles.btnSecondary}>
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className={styles.btnPrimary}
          >
            {saving ? "Création..." : "Créer la carte"}
          </button>
        </div>
      </div>
    </div>
  );
}
