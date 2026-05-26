"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import {
  createCouponAction,
  updateCouponAction,
  type CreateCouponInput,
} from "@/app/actions/coupons";
import type { DiscountType } from "@prisma/client";
import styles from "@/components/dashboard/coupon-editor-modal.module.css";

interface CouponRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  startsAt: string;
  endsAt: string | null;
  maxUses: number | null;
  maxUsesPerCustomer: number | null;
  firstOrderOnly: boolean;
}

interface Props {
  coupon: CouponRow | null;
  currency: string;
  onClose: () => void;
  onSaved: () => void;
}

function toLocalDatetime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStartsAt() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CouponEditorModal({
  coupon,
  currency,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!coupon;
  const cur = currency === "XAF" ? "FCFA" : currency;

  const [code, setCode] = useState(coupon?.code || "");
  const [name, setName] = useState(coupon?.name || "");
  const [description, setDescription] = useState(coupon?.description || "");
  const [discountType, setDiscountType] = useState<DiscountType>(
    coupon?.discountType || "PERCENTAGE"
  );
  const [discountValue, setDiscountValue] = useState(
    coupon?.discountValue?.toString() || "10"
  );
  const [minOrderAmount, setMinOrderAmount] = useState(
    coupon?.minOrderAmount?.toString() || ""
  );
  const [maxDiscount, setMaxDiscount] = useState(
    coupon?.maxDiscount?.toString() || ""
  );
  const [startsAt, setStartsAt] = useState(
    coupon ? toLocalDatetime(coupon.startsAt) : defaultStartsAt()
  );
  const [endsAt, setEndsAt] = useState(toLocalDatetime(coupon?.endsAt));
  const [maxUses, setMaxUses] = useState(coupon?.maxUses?.toString() || "");
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState(
    coupon?.maxUsesPerCustomer?.toString() || "1"
  );
  const [firstOrderOnly, setFirstOrderOnly] = useState(
    coupon?.firstOrderOnly || false
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);

    const payload: CreateCouponInput = {
      code,
      name,
      description: description || undefined,
      discountType,
      discountValue: parseInt(discountValue, 10) || 0,
      minOrderAmount: minOrderAmount ? parseInt(minOrderAmount, 10) : undefined,
      maxDiscount: maxDiscount ? parseInt(maxDiscount, 10) : undefined,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
      maxUsesPerCustomer: parseInt(maxUsesPerCustomer, 10) || 1,
      firstOrderOnly,
    };

    const res = isEdit
      ? await updateCouponAction(coupon!.id, payload)
      : await createCouponAction(payload);

    setSaving(false);
    if (res.ok) onSaved();
    else setError(res.error ?? null);
  };

  const recap =
    discountType === "PERCENTAGE"
      ? `${discountValue}% de réduction${maxDiscount ? ` (max ${maxDiscount} ${cur})` : ""}`
      : `${parseInt(discountValue, 10).toLocaleString("fr-FR")} ${cur} de réduction`;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {isEdit ? "Modifier le coupon" : "Nouveau coupon"}
            </h2>
            <p className={styles.subtitle}>
              {isEdit
                ? "Mettez à jour les conditions de votre code promo."
                : "Créez un code promo pour votre boutique."}
            </p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className={styles.body}>
          {!isEdit && (
            <div className={styles.field}>
              <label className={styles.label}>Code promo</label>
              <input
                className={styles.input}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
                }
                placeholder="NOEL2026"
                maxLength={30}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Nom affiché</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Promotion de Noël"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description (optionnel)</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Type de réduction</label>
            <div className={styles.typeToggle}>
              <button
                type="button"
                className={`${styles.typeBtn} ${discountType === "PERCENTAGE" ? styles.typeBtnActive : ""}`}
                onClick={() => setDiscountType("PERCENTAGE")}
              >
                Pourcentage (%)
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${discountType === "FIXED_AMOUNT" ? styles.typeBtnActive : ""}`}
                onClick={() => setDiscountType("FIXED_AMOUNT")}
              >
                Montant fixe ({cur})
              </button>
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Valeur</label>
              <input
                type="number"
                className={styles.input}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                min={1}
                max={discountType === "PERCENTAGE" ? 100 : undefined}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Commande min ({cur})</label>
              <input
                type="number"
                className={styles.input}
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="Optionnel"
              />
            </div>
          </div>

          {discountType === "PERCENTAGE" && (
            <div className={styles.field}>
              <label className={styles.label}>Plafond réduction ({cur})</label>
              <input
                type="number"
                className={styles.input}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Optionnel"
              />
            </div>
          )}

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
              <label className={styles.label}>Fin (optionnel)</label>
              <input
                type="datetime-local"
                className={styles.input}
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Utilisations max</label>
              <input
                type="number"
                className={styles.input}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Illimité"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Max / client</label>
              <input
                type="number"
                className={styles.input}
                value={maxUsesPerCustomer}
                onChange={(e) => setMaxUsesPerCustomer(e.target.value)}
                min={1}
              />
            </div>
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={firstOrderOnly}
              onChange={(e) => setFirstOrderOnly(e.target.checked)}
            />
            Première commande uniquement
          </label>

          <div className={styles.recap} style={{ marginTop: 14 }}>
            <strong>Récap :</strong> {recap}
            {minOrderAmount
              ? ` · Commande min ${parseInt(minOrderAmount, 10).toLocaleString("fr-FR")} ${cur}`
              : ""}
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
            disabled={saving || !name.trim() || (!isEdit && !code.trim())}
            className={styles.btnPrimary}
          >
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
