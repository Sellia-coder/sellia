"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, ChatCircle, CheckCircle } from "@phosphor-icons/react";
import { merchantReplyToReviewAction } from "@/app/actions/merchant-review";
import type { ShopReviewRow } from "./ClientsHubClient";
import styles from "./customers-list.module.css";

type Filter = "all" | "replied" | "unreplied" | "5" | "4" | "3" | "2" | "1";

interface Props {
  reviews: ShopReviewRow[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.reviewStars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          weight={n <= rating ? "fill" : "regular"}
          color={n <= rating ? "#E84B1F" : "#C4C0B8"}
        />
      ))}
    </span>
  );
}

export default function ShopReviewsClient({ reviews }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const stats = useMemo(() => {
    const approved = reviews.filter((r) => r.status === "approved");
    const list = approved.length > 0 ? approved : reviews;
    const count = list.length;
    const avg =
      count > 0
        ? Math.round(
            (list.reduce((s, r) => s + r.rating, 0) / count) * 10
          ) / 10
        : 0;
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: list.filter((r) => r.rating === star).length,
      pct: count > 0 ? Math.round((list.filter((r) => r.rating === star).length / count) * 100) : 0,
    }));
    const replied = reviews.filter((r) => r.merchantReply).length;
    return { avg, count, dist, replied };
  }, [reviews]);

  const filtered = useMemo(() => {
    let list = [...reviews];
    if (filter === "replied") list = list.filter((r) => r.merchantReply);
    else if (filter === "unreplied") list = list.filter((r) => !r.merchantReply);
    else if (filter !== "all") {
      const star = Number(filter);
      list = list.filter((r) => r.rating === star);
    }
    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reviews, filter]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const statusLabel = (s: string) => {
    if (s === "approved") return "Publié";
    if (s === "pending") return "En attente";
    if (s === "rejected") return "Refusé";
    return s;
  };

  const startEdit = (r: ShopReviewRow) => {
    setEditingId(r.id);
    setReplyText(r.merchantReply || "");
    setError(null);
  };

  const submitReply = (reviewId: string) => {
    setError(null);
    startTransition(async () => {
      const res = await merchantReplyToReviewAction(reviewId, replyText);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditingId(null);
      setReplyText("");
      router.refresh();
    });
  };

  const filters: Array<{ key: Filter; label: string }> = [
    { key: "all", label: "Tous" },
    { key: "replied", label: "Avec réponse" },
    { key: "unreplied", label: "Sans réponse" },
    { key: "5", label: "5★" },
    { key: "4", label: "4★" },
    { key: "3", label: "3★" },
  ];

  return (
    <div className={styles.reviewsSection}>
      <div className={styles.reviewSummary}>
        <div className={styles.reviewSummaryMain}>
          <div className={styles.reviewAvgValue}>{stats.avg || "—"}</div>
          <Stars rating={Math.round(stats.avg)} />
          <p className={styles.reviewSummaryMeta}>
            {stats.count} avis · {stats.replied} réponse
            {stats.replied > 1 ? "s" : ""}
          </p>
        </div>
        <div className={styles.reviewDist}>
          {stats.dist.map((d) => (
            <div key={d.star} className={styles.reviewDistRow}>
              <span className={styles.reviewDistStar}>{d.star}★</span>
              <div className={styles.reviewDistBar}>
                <div
                  className={styles.reviewDistFill}
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className={styles.reviewDistPct}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.filterPills}>
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`${styles.filterPill} ${filter === f.key ? styles.filterPillActive : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? <div className={styles.reviewError}>{error}</div> : null}

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <ChatCircle size={48} weight="duotone" color="var(--sellia-subtle)" />
          <h3>Aucun avis</h3>
          <p>Les avis de vos clients apparaîtront ici.</p>
        </div>
      ) : (
        <div className={styles.reviewList}>
          {filtered.map((r) => (
            <article key={r.id} className={styles.reviewCard}>
              <div className={styles.reviewCardHead}>
                <div>
                  <div className={styles.reviewAuthor}>{r.authorName}</div>
                  <div className={styles.reviewMeta}>
                    <Stars rating={r.rating} />
                    <span>·</span>
                    <span>{formatDate(r.createdAt)}</span>
                    <span
                      className={`${styles.reviewStatus} ${r.status === "approved" ? styles.reviewStatusOk : ""}`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </div>
                </div>
                {r.product ? (
                  <div className={styles.reviewProduct}>{r.product.name}</div>
                ) : null}
              </div>

              {r.title ? (
                <div className={styles.reviewTitle}>{r.title}</div>
              ) : null}
              <p className={styles.reviewBody}>{r.content}</p>

              {r.merchantReply && editingId !== r.id ? (
                <div className={styles.merchantReplyBlock}>
                  <div className={styles.merchantReplyLabel}>
                    <CheckCircle size={14} weight="fill" />
                    Votre réponse
                  </div>
                  <p>{r.merchantReply}</p>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => startEdit(r)}
                  >
                    Modifier la réponse
                  </button>
                </div>
              ) : null}

              {editingId === r.id ? (
                <div className={styles.replyForm}>
                  <label className={styles.replyLabel}>
                    Réponse du vendeur
                  </label>
                  <textarea
                    className={styles.replyInput}
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Remerciez votre client et répondez à ses remarques…"
                    maxLength={2000}
                  />
                  <div className={styles.replyActions}>
                    <button
                      type="button"
                      className={styles.btnGhost}
                      onClick={() => {
                        setEditingId(null);
                        setReplyText("");
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      disabled={pending || replyText.trim().length < 2}
                      onClick={() => submitReply(r.id)}
                    >
                      {pending ? "Enregistrement…" : "Publier la réponse"}
                    </button>
                  </div>
                </div>
              ) : !r.merchantReply ? (
                <button
                  type="button"
                  className={styles.replyBtn}
                  onClick={() => startEdit(r)}
                >
                  <ChatCircle size={16} weight="duotone" />
                  Répondre
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
