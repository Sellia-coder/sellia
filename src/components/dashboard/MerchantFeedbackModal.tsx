"use client";

import { useEffect, useState, useTransition } from "react";
import { X, Lightbulb, CheckCircle2 } from "lucide-react";
import { submitMerchantFeedbackAction } from "@/app/actions/feedback";
import { FEEDBACK_TYPES, type FeedbackType } from "@/lib/feedback/constants";
import styles from "./MerchantFeedbackModal.module.css";

interface Props {
  onClose: () => void;
}

export default function MerchantFeedbackModal({ onClose }: Props) {
  const [type, setType] = useState<FeedbackType>("SUGGESTION");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await submitMerchantFeedbackAction(type, message);
      if (!res.ok) {
        setError(res.error ?? "Erreur");
        return;
      }
      setSuccess(true);
    });
  };

  return (
    <div
      className={styles.merchantFeedbackOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="merchant-feedback-title"
      onClick={onClose}
    >
      <div
        className={styles.merchantFeedbackModal}
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className={styles.merchantFeedbackSuccess}>
            <div className={styles.merchantFeedbackSuccessIcon}>
              <CheckCircle2 size={28} />
            </div>
            <h2 className={styles.merchantFeedbackSuccessTitle}>Merci !</h2>
            <p className={styles.merchantFeedbackSuccessText}>
              Votre retour a bien été transmis à l&apos;équipe Sellia. Nous l&apos;examinons
              avec attention.
            </p>
            <button
              type="button"
              className={styles.merchantFeedbackDoneBtn}
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className={styles.merchantFeedbackHead}>
              <div>
                <span className={styles.merchantFeedbackEyebrow}>
                  <Lightbulb size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                  Feedback
                </span>
                <h2 id="merchant-feedback-title" className={styles.merchantFeedbackTitle}>
                  Partagez votre avis
                </h2>
              </div>
              <button
                type="button"
                className={styles.merchantFeedbackClose}
                onClick={onClose}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.merchantFeedbackBody}>
              <p className={styles.merchantFeedbackLead}>
                Votre retour aide Sellia à s&apos;améliorer. Suggestion, remarque ou signalement
                — nous lisons chaque message.
              </p>

              <label className={styles.merchantFeedbackLabel} htmlFor="feedback-type">
                Type (optionnel)
              </label>
              <select
                id="feedback-type"
                className={styles.merchantFeedbackSelect}
                value={type}
                onChange={(e) => setType(e.target.value as FeedbackType)}
                disabled={pending}
              >
                {FEEDBACK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <label className={styles.merchantFeedbackLabel} htmlFor="feedback-message">
                Votre message
              </label>
              <textarea
                id="feedback-message"
                className={styles.merchantFeedbackTextarea}
                rows={5}
                placeholder="Décrivez votre idée, remarque ou problème rencontré…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={pending}
              />

              {error ? <p className={styles.merchantFeedbackError}>{error}</p> : null}

              <button
                type="button"
                className={styles.merchantFeedbackSubmit}
                onClick={submit}
                disabled={pending || message.trim().length < 10}
              >
                {pending ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
