"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChatCircle, PaperPlaneTilt, ShieldWarning } from "@phosphor-icons/react";
import {
  markChatConversationReadAction,
  sendMerchantChatMessageAction,
} from "@/app/actions/shop-chat";
import styles from "./customers-list.module.css";

export type ChatConversationRow = {
  id: string;
  customerName: string;
  customerEmail: string | null;
  status: string;
  unreadForMerchant: number;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  messages: ChatMessageRow[];
};

export type ChatMessageRow = {
  id: string;
  sender: "customer" | "merchant" | "system";
  content: string;
  flagged: boolean;
  blockedReason: string | null;
  createdAt: string;
};

interface Props {
  conversations: ChatConversationRow[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ShopMessagesClient({ conversations }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(
    () =>
      [...conversations].sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      ),
    [conversations]
  );

  const selected = sorted.find((c) => c.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setError(null);
    const conv = sorted.find((c) => c.id === id);
    if (conv?.unreadForMerchant) {
      startTransition(async () => {
        await markChatConversationReadAction(id);
        router.refresh();
      });
    }
  };

  const handleSend = () => {
    if (!selectedId || reply.trim().length < 1) return;
    setError(null);
    startTransition(async () => {
      const res = await sendMerchantChatMessageAction(selectedId, reply.trim());
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setReply("");
      router.refresh();
    });
  };

  if (sorted.length === 0) {
    return (
      <div className={styles.emptyState}>
        <ChatCircle size={48} weight="duotone" color="var(--sellia-subtle)" />
        <h3>Aucun message</h3>
        <p>
          Les conversations de vos visiteurs apparaîtront ici lorsqu&apos;ils
          utiliseront le chat sur votre boutique.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.chatLayout}>
      <aside className={styles.chatList}>
        {sorted.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.chatListItem} ${
              selectedId === c.id ? styles.chatListItemActive : ""
            }`}
            onClick={() => handleSelect(c.id)}
          >
            <div className={styles.chatListTop}>
              <span className={styles.chatListName}>{c.customerName}</span>
              <span className={styles.chatListDate}>
                {formatDate(c.lastMessageAt)}
              </span>
            </div>
            <div className={styles.chatListPreview}>
              {c.lastMessagePreview || "—"}
            </div>
            {c.unreadForMerchant > 0 ? (
              <span className={styles.chatUnreadBadge}>
                {c.unreadForMerchant}
              </span>
            ) : null}
          </button>
        ))}
      </aside>

      <div className={styles.chatThread}>
        {selected ? (
          <>
            <div className={styles.chatThreadHead}>
              <div>
                <h3 className={styles.chatThreadTitle}>{selected.customerName}</h3>
                {selected.customerEmail ? (
                  <p className={styles.chatThreadEmail}>{selected.customerEmail}</p>
                ) : null}
              </div>
            </div>

            <div className={styles.chatMessages}>
              {selected.messages.map((m) => (
                <div
                  key={m.id}
                  className={`${styles.chatBubble} ${
                    m.sender === "merchant"
                      ? styles.chatBubbleMerchant
                      : styles.chatBubbleCustomer
                  } ${m.flagged ? styles.chatBubbleFlagged : ""}`}
                >
                  {m.flagged ? (
                    <div className={styles.chatFlaggedLabel}>
                      <ShieldWarning size={14} weight="duotone" />
                      Tentative bloquée
                      {m.blockedReason === "phone_number"
                        ? " (numéro)"
                        : m.blockedReason === "offsite_transaction"
                          ? " (paiement hors site)"
                          : ""}
                    </div>
                  ) : (
                    m.content
                  )}
                  <span className={styles.chatBubbleTime}>
                    {formatDate(m.createdAt)}
                  </span>
                </div>
              ))}
            </div>

            {error ? <div className={styles.reviewError}>{error}</div> : null}

            <div className={styles.chatReplyBox}>
              <textarea
                className={styles.chatReplyInput}
                rows={3}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Répondre au client…"
                maxLength={2000}
              />
              <button
                type="button"
                className={styles.chatSendBtn}
                disabled={pending || reply.trim().length < 1}
                onClick={handleSend}
              >
                <PaperPlaneTilt size={16} weight="fill" />
                {pending ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.chatThreadEmpty}>
            Sélectionnez une conversation
          </div>
        )}
      </div>
    </div>
  );
}
