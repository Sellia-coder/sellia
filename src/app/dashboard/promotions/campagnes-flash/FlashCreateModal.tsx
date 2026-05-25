"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { createFlashCampaignAction } from "@/app/actions/flash-campaigns";
import type { DiscountType } from "@prisma/client";
import styles from "@/components/dashboard/coupon-editor-modal.module.css";

interface ProductOption {
  id: string;
  name: string;
}

interface Props {
  products: ProductOption[];
  onClose: () => void;
  onSaved: () => void;
}

function defaultDatetime(offsetHours: number) {
  const d = new Date(Date.now() + offsetHours * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function FlashCreateModal({
  products,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("15");
  const [startsAt, setStartsAt] = useState(defaultDatetime(0));
  const [endsAt, setEndsAt] = useState(defaultDatetime(48));
  const [productIds, setProductIds] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleProduct = (id: string) => {
    setProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    const res = await createFlashCampaignAction({
      name,
      description: description || undefined,
      discountType,
      discountValue: parseInt(discountValue, 10) || 0,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      productIds: allProducts ? [] : productIds,
    });
    setSaving(false);
    if (res.ok) onSaved();
    else setError(res.error || "Erreur");
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Nouvelle campagne flash</h2>
            <p className={styles.subtitle}>
              Promotion limitée dans le temps avec réduction visible.
            </p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Nom</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Flash Weekend"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.typeToggle}>
            <button
              type="button"
              className={`${styles.typeBtn} ${discountType === "PERCENTAGE" ? styles.typeBtnActive : ""}`}
              onClick={() => setDiscountType("PERCENTAGE")}
            >
              %
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${discountType === "FIXED_AMOUNT" ? styles.typeBtnActive : ""}`}
              onClick={() => setDiscountType("FIXED_AMOUNT")}
            >
              Montant fixe
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Valeur</label>
            <input
              type="number"
              className={styles.input}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Début</label>
              <input
                type="datetime-local"
                className={styles.input}
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Fin</label>
              <input
                type="datetime-local"
                className={styles.input}
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={allProducts}
              onChange={(e) => setAllProducts(e.target.checked)}
            />
            Tous les produits
          </label>

          {!allProducts && products.length > 0 && (
            <div
              style={{
                maxHeight: 140,
                overflowY: "auto",
                border: "1px solid var(--sellia-border)",
                borderRadius: 10,
                padding: 10,
              }}
            >
              {products.map((p) => (
                <label
                  key={p.id}
                  className={styles.checkboxRow}
                  style={{ marginBottom: 6 }}
                >
                  <input
                    type="checkbox"
                    checked={productIds.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          )}

          {error && <div className={styles.errorBox}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose} className={styles.btnSecondary}>
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
            className={styles.btnPrimary}
          >
            {saving ? "Création..." : "Lancer la campagne"}
          </button>
        </div>
      </div>
    </div>
  );
}
