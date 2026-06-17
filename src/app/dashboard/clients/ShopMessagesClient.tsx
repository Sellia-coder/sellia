"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChatCircle, PaperPlaneTilt, ShieldWarning } from "@phosphor-icons/react";
import {
  markChatConversationReadAction,
  pollMerchantChatAction,
  sendMerchantChatMessageAction,
} from "@/app/actions/shop-chat";
import { CHAT_POLL_INTERVAL_MS } from "@/lib/chat/constants";
import MessageReceiptTicks from "@/components/chat/MessageReceiptTicks";
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
  deliveredAt?: string | null;
  readAt?: string | null;
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

function mergeMessages(
  prev: ChatMessageRow[],
  incoming: ChatMessageRow[]
): ChatMessageRow[] {
  const map = new Map(prev.map((m) => [m.id, m]));
  for (const m of incoming) {
    map.set(m.id, { ...map.get(m.id), ...m });
  }
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function applyReceipts(
  prev: ChatMessageRow[],
  receipts: Array<{
    id: string;
    deliveredAt: string | null;
    readAt: string | null;
  }>
): ChatMessageRow[] {
  if (!receipts.length) return prev;
  return prev.map((m) => {
    const patch = receipts.find((r) => r.id === m.id);
    if (!patch) return m;
    return {
      ...m,
      deliveredAt: patch.deliveredAt,
      readAt: patch.readAt,
    };
  });
}

export default function ShopMessagesClient({ conversations }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [liveMessages, setLiveMessages] = useState<Record<string, ChatMessageRow[]>>(
    () =>
      Object.fromEntries(
        conversations.map((c) => [c.id, c.messages])
      )
  );
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const lastPollRef = useRef<Record<string, string | null>>({});

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
  const threadMessages = selected
    ? liveMessages[selected.id] ?? selected.messages
    : [];

  const pollThread = useCallback(async (conversationId: string) => {
    const since = lastPollRef.current[conversationId] ?? null;
    const res = await pollMerchantChatAction(conversationId, since);
    if (!res.ok) return;

    if (res.messages.length > 0) {
      setLiveMessages((prev) => ({
        ...prev,
        [conversationId]: mergeMessages(
          prev[conversationId] ?? [],
          res.messages
        ),
      }));
      const last = res.messages[res.messages.length - 1];
      lastPollRef.current[conversationId] = last.createdAt;
    }

    if (res.receipts.length > 0) {
      setLiveMessages((prev) => ({
        ...prev,
        [conversationId]: applyReceipts(
          prev[conversationId] ?? [],
          res.receipts
        ),
      }));
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    pollThread(selectedId);
    const id = setInterval(() => pollThread(selectedId), CHAT_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [selectedId, pollThread]);

  useEffect(() => {
    setLiveMessages(
      Object.fromEntries(conversations.map((c) => [c.id, c.messages]))
    );
  }, [conversations]);

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
    pollThread(id);
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
      if (res.message) {
        setLiveMessages((prev) => ({
          ...prev,
          [selectedId]: mergeMessages(prev[selectedId] ?? [], [
            {
              id: res.message.id,
              sender: "merchant",
              content: res.message.content,
              flagged: false,
              blockedReason: null,
              deliveredAt: res.message.deliveredAt,
              readAt: res.message.readAt,
              createdAt: res.message.createdAt,
            },
          ]),
        }));
        lastPollRef.current[selectedId] = res.message.createdAt;
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
              {threadMessages.map((m) => (
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
                  <span className={styles.chatBubbleMeta}>
                    <span className={styles.chatBubbleTime}>
                      {formatDate(m.createdAt)}
                    </span>
                    {m.sender === "merchant" && !m.flagged && (
                      <MessageReceiptTicks
                        deliveredAt={m.deliveredAt}
                        readAt={m.readAt}
                      />
                    )}
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
