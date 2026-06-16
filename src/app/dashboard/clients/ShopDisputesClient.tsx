"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Scales } from "@phosphor-icons/react";
import { merchantRespondDisputeAction } from "@/app/actions/disputes";
import {
  DISPUTE_STATUS_LABELS,
  OPEN_DISPUTE_STATUSES,
  disputeReasonLabel,
  type DisputeStatus,
} from "@/lib/disputes/constants";
import styles from "./customers-list.module.css";

export type ShopDisputeRow = {
  id: string;
  orderNumber: string;
  orderId: string;
  customerEmail: string;
  reason: string;
  description: string;
  status: string;
  merchantResponse: string | null;
  merchantRespondedAt: string | null;
  adminResolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
};

type Filter = "all" | "open" | "resolved";

interface Props {
  disputes: ShopDisputeRow[];
}

export default function ShopDisputesClient({ disputes }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "open") {
      return disputes.filter((d) =>
        OPEN_DISPUTE_STATUSES.includes(d.status as DisputeStatus)
      );
    }
    if (filter === "resolved") {
      return disputes.filter(
        (d) => !OPEN_DISPUTE_STATUSES.includes(d.status as DisputeStatus)
      );
    }
    return disputes;
  }, [disputes, filter]);

  const openCount = disputes.filter((d) =>
    OPEN_DISPUTE_STATUSES.includes(d.status as DisputeStatus)
  ).length;

  const submitReply = (disputeId: string) => {
    setError(null);
    startTransition(async () => {
      const res = await merchantRespondDisputeAction(disputeId, replyText);
      if (!res.ok) {
        setError(res.error ?? "Erreur");
        return;
      }
      setReplyId(null);
      setReplyText("");
    });
  };

  return (
    <div>
      <div className={styles.disputesFilters}>
        {(
          [
            { key: "all", label: "Tous" },
            { key: "open", label: "Ouverts" },
            { key: "resolved", label: "Tranchés" },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            type="button"
            className={`${styles.disputesFilterBtn} ${filter === f.key ? styles.disputesFilterActive : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === "open" && openCount > 0 ? (
              <span className={styles.hubTabBadgeUnread}>{openCount}</span>
            ) : null}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.disputesEmpty}>
          <Scales size={32} weight="duotone" />
          <p>Aucun litige sur cette période.</p>
        </div>
      ) : (
        <ul className={styles.disputesList}>
          {filtered.map((d) => (
            <li key={d.id} className={styles.disputeCard}>
              <div className={styles.disputeCardHead}>
                <div>
                  <span className={styles.disputeOrder}>
                    Commande #{d.orderNumber}
                  </span>
                  <span className={styles.disputeMeta}>
                    {d.customerEmail} ·{" "}
                    {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <span className={styles.disputeStatus}>
                  {DISPUTE_STATUS_LABELS[d.status as DisputeStatus] ?? d.status}
                </span>
              </div>
              <p className={styles.disputeReason}>
                <strong>{disputeReasonLabel(d.reason)}</strong>
              </p>
              <p className={styles.disputeDesc}>{d.description}</p>

              {d.merchantResponse && (
                <div className={styles.disputeReplyBox}>
                  <strong>Votre réponse</strong>
                  <p>{d.merchantResponse}</p>
                </div>
              )}

              {d.adminResolution && (
                <div className={styles.disputeAdminBox}>
                  <strong>Décision Sellia</strong>
                  <p>{d.adminResolution}</p>
                  <span className={styles.disputeMoneyNote}>
                    Cette décision n&apos;effectue pas de remboursement automatique.
                  </span>
                </div>
              )}

              {!d.merchantResponse &&
                OPEN_DISPUTE_STATUSES.includes(d.status as DisputeStatus) && (
                  <>
                    {replyId === d.id ? (
                      <div className={styles.disputeReplyForm}>
                        <textarea
                          className={styles.disputeTextarea}
                          rows={4}
                          placeholder="Votre version des faits…"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        {error && <p className={styles.disputeError}>{error}</p>}
                        <div className={styles.disputeReplyActions}>
                          <button
                            type="button"
                            className={styles.disputeSubmitBtn}
                            disabled={pending}
                            onClick={() => submitReply(d.id)}
                          >
                            {pending ? "Envoi…" : "Envoyer ma réponse"}
                          </button>
                          <button
                            type="button"
                            className={styles.disputeCancelBtn}
                            onClick={() => setReplyId(null)}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.disputeReplyBtn}
                        onClick={() => {
                          setReplyId(d.id);
                          setReplyText("");
                          setError(null);
                        }}
                      >
                        Répondre au litige
                      </button>
                    )}
                  </>
                )}

              <Link
                href={`/dashboard/commandes/${d.orderNumber}`}
                className={styles.disputeOrderLink}
              >
                Voir la commande →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
