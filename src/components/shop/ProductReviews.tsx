"use client";

import { useEffect, useState, useTransition } from "react";
import { Star, MessageSquare, AlertCircle, Check } from "lucide-react";
import {
  createReviewAction,
  listApprovedReviewsAction,
} from "@/app/actions/review";

interface Props {
  shopId: string;
  productId: string;
  /** Bloc léger sans liste (liste gérée ailleurs, ex. onglet fiche produit) */
  embedded?: boolean;
}

interface ReviewRow {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  content: string;
  createdAt: Date | string;
}

export default function ProductReviews({
  shopId,
  productId,
  embedded = false,
}: Props) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (embedded) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await listApprovedReviewsAction(productId);
      if (!cancelled && result.ok) {
        setReviews(result.reviews as ReviewRow[]);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, embedded]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = () => {
    setError(null);
    if (authorName.trim().length < 2) {
      setError("Renseigne ton nom");
      return;
    }
    if (rating < 1) {
      setError("Choisis une note");
      return;
    }
    if (content.trim().length < 10) {
      setError("Écris un avis d'au moins 10 caractères");
      return;
    }

    startTransition(async () => {
      const result = await createReviewAction({
        shopId,
        productId,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim() || undefined,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
      });
      if (!result.ok) {
        setError(result.error ?? "Erreur");
        return;
      }
      setSuccess(true);
      setShowForm(false);
      setAuthorName("");
      setAuthorEmail("");
      setRating(0);
      setTitle("");
      setContent("");
    });
  };

  if (embedded) {
    return (
      <div className="shop-reviews shop-reviews-embedded">
        {success && (
          <div className="shop-reviews-success">
            <Check size={14} strokeWidth={2.5} />
            Merci pour ton avis ! Il sera publié après validation.
          </div>
        )}
        {!showForm ? (
          <button
            type="button"
            className="shop-btn shop-btn-secondary"
            onClick={() => setShowForm(true)}
          >
            Laisser un avis
          </button>
        ) : (
          <div className="shop-review-form">
            <h3 className="shop-review-form-title">Ton avis</h3>
            <div className="shop-form-row">
              <label className="shop-form-label">Note *</label>
              <div className="shop-review-rating-input">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="shop-review-rating-star"
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(n)}
                    aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                  >
                    <Star
                      size={26}
                      strokeWidth={1.5}
                      fill={
                        n <= (hoverRating || rating)
                          ? "var(--shop-primary)"
                          : "none"
                      }
                      color={
                        n <= (hoverRating || rating)
                          ? "var(--shop-primary)"
                          : "#D9D6CC"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="shop-form-row">
              <label className="shop-form-label">Ton nom *</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="shop-input"
              />
            </div>
            <div className="shop-form-row">
              <label className="shop-form-label">Email</label>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="shop-input"
              />
            </div>
            <div className="shop-form-row">
              <label className="shop-form-label">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="shop-input"
              />
            </div>
            <div className="shop-form-row">
              <label className="shop-form-label">Ton avis *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="shop-input shop-textarea"
                rows={4}
              />
            </div>
            {error && (
              <div className="shop-alert-error">
                <AlertCircle size={14} strokeWidth={2} />
                {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                className="shop-btn shop-btn-primary"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? "Envoi…" : "Envoyer"}
              </button>
              <button
                type="button"
                className="shop-btn shop-btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="shop-reviews">
      <div className="shop-reviews-header">
        <h2 className="shop-product-section-title">
          <MessageSquare size={14} strokeWidth={2} />
          Avis clients
        </h2>
        {reviews.length > 0 && (
          <div className="shop-reviews-summary">
            <div className="shop-reviews-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={16}
                  strokeWidth={1.5}
                  fill={
                    n <= Math.round(avgRating)
                      ? "var(--shop-primary)"
                      : "none"
                  }
                  color={
                    n <= Math.round(avgRating)
                      ? "var(--shop-primary)"
                      : "#D9D6CC"
                  }
                />
              ))}
            </div>
            <span className="shop-reviews-avg">
              {avgRating.toFixed(1)}/5 · {reviews.length} avis
            </span>
          </div>
        )}
      </div>

      {success && (
        <div className="shop-reviews-success">
          <Check size={14} strokeWidth={2.5} />
          Merci pour ton avis ! Il sera publié après validation.
        </div>
      )}

      {!loading && reviews.length === 0 && !showForm && (
        <div className="shop-reviews-empty">
          <p>Aucun avis pour ce produit. Sois le premier !</p>
          <button
            type="button"
            className="shop-btn shop-btn-secondary"
            onClick={() => setShowForm(true)}
          >
            Laisser un avis
          </button>
        </div>
      )}

      {reviews.length > 0 && (
        <>
          <ul className="shop-reviews-list">
            {reviews.slice(0, 5).map((r) => (
              <li key={r.id} className="shop-review">
                <div className="shop-review-header">
                  <div className="shop-review-avatar">
                    {r.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="shop-review-meta">
                    <div className="shop-review-author">{r.authorName}</div>
                    <div className="shop-review-stars">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={11}
                          strokeWidth={1.5}
                          fill={
                            n <= r.rating ? "var(--shop-primary)" : "none"
                          }
                          color={
                            n <= r.rating ? "var(--shop-primary)" : "#D9D6CC"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {r.title && <div className="shop-review-title">{r.title}</div>}
                <p className="shop-review-content">{r.content}</p>
              </li>
            ))}
          </ul>
          {!showForm && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                type="button"
                className="shop-btn shop-btn-secondary"
                onClick={() => setShowForm(true)}
              >
                Laisser un avis
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="shop-review-form">
          <h3 className="shop-review-form-title">Ton avis</h3>

          <div className="shop-form-row">
            <label className="shop-form-label">Note *</label>
            <div className="shop-review-rating-input">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="shop-review-rating-star"
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                  aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                >
                  <Star
                    size={26}
                    strokeWidth={1.5}
                    fill={
                      n <= (hoverRating || rating)
                        ? "var(--shop-primary)"
                        : "none"
                    }
                    color={
                      n <= (hoverRating || rating)
                        ? "var(--shop-primary)"
                        : "#D9D6CC"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="shop-form-row">
            <label className="shop-form-label">Ton nom *</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="shop-input"
              maxLength={50}
            />
          </div>

          <div className="shop-form-row">
            <label className="shop-form-label">
              Email <span className="shop-form-optional">(optionnel)</span>
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="shop-input"
              maxLength={100}
            />
          </div>

          <div className="shop-form-row">
            <label className="shop-form-label">
              Titre <span className="shop-form-optional">(optionnel)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shop-input"
              maxLength={80}
              placeholder="Ex : Excellent produit"
            />
          </div>

          <div className="shop-form-row">
            <label className="shop-form-label">Ton avis *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="shop-input shop-textarea"
              rows={4}
              maxLength={1000}
              placeholder="Décris ton expérience avec ce produit..."
            />
          </div>

          {error && (
            <div className="shop-alert-error">
              <AlertCircle size={14} strokeWidth={2} />
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="shop-btn shop-btn-primary"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "Envoi…" : "Publier mon avis"}
            </button>
            <button
              type="button"
              className="shop-btn shop-btn-secondary"
              onClick={() => setShowForm(false)}
              disabled={isPending}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
