"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { createFaqAction, updateFaqAction } from "@/app/actions/shop-pages";
import styles from "./pages.module.css";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

interface Props {
  faq: FaqRow | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function FaqEditorModal({ faq, onClose, onSaved }: Props) {
  const isEdit = !!faq;
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [category, setCategory] = useState(faq?.category ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    const res = isEdit
      ? await updateFaqAction(
          faq!.id,
          question,
          answer,
          category || undefined
        )
      : await createFaqAction(question, answer, category || undefined);
    setSaving(false);
    if (res.ok) onSaved();
    else setError(res.error ?? "Erreur");
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit ? "Modifier la question" : "Nouvelle question"}
          </h2>
          <button type="button" onClick={onClose} className={styles.actionBtn}>
            <X size={18} weight="bold" />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.field}>
            <label>Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              style={{ minHeight: 60 }}
            />
          </div>
          <div className={styles.field}>
            <label>Réponse</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
            />
          </div>
          <div className={styles.field}>
            <label>Catégorie (optionnel)</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Commande, Livraison, Retour..."
              list="faq-categories"
            />
            <datalist id="faq-categories">
              <option value="Commande" />
              <option value="Livraison" />
              <option value="Retour" />
              <option value="Paiement" />
            </datalist>
          </div>
          {error && <div className={styles.errorBox}>{error}</div>}
        </div>
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.btnSecondary}>
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !question.trim() || !answer.trim()}
            className={styles.btnPrimary}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
