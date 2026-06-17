"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChatCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import {
  closeLandingSupportAction,
  markLandingSupportReadAction,
  pollLandingSupportAdminAction,
  sendLandingSupportReplyAction,
} from "@/app/actions/landing-support";
import { CHAT_POLL_INTERVAL_MS } from "@/lib/chat/constants";
import MessageReceiptTicks from "@/components/chat/MessageReceiptTicks";
import styles from "@/app/dashboard/clients/customers-list.module.css";

export type LandingSupportRow = {
  id: string;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  status: string;
  unreadForAdmin: number;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  messages: LandingSupportMessageRow[];
};

export type LandingSupportMessageRow = {
  id: string;
  sender: "visitor" | "admin";
  content: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "Nouveau",
  REPLIED: "Répondu",
  CLOSED: "Clos",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportLandingAdminClient({
  conversations,
}: {
  conversations: LandingSupportRow[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [liveMessages, setLiveMessages] = useState<
    Record<string, LandingSupportMessageRow[]>
  >(() => Object.fromEntries(conversations.map((c) => [c.id, c.messages])));
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
    const res = await pollLandingSupportAdminAction(conversationId, since);
    if (!res.ok) return;

    if (res.messages.length > 0) {
      setLiveMessages((prev) => {
        const map = new Map((prev[conversationId] ?? []).map((m) => [m.id, m]));
        for (const m of res.messages) map.set(m.id, m);
        return {
          ...prev,
          [conversationId]: [...map.values()].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
        };
      });
      lastPollRef.current[conversationId] =
        res.messages[res.messages.length - 1].createdAt;
    }

    if (res.receipts.length > 0) {
      setLiveMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] ?? []).map((m) => {
          const patch = res.receipts.find((r) => r.id === m.id);
          return patch
            ? { ...m, deliveredAt: patch.deliveredAt, readAt: patch.readAt }
            : m;
        }),
      }));
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    pollThread(selectedId);
    const id = setInterval(() => pollThread(selectedId), CHAT_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [selectedId, pollThread]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setError(null);
    const conv = sorted.find((c) => c.id === id);
    if (conv?.unreadForAdmin) {
      startTransition(async () => {
        await markLandingSupportReadAction(id);
        router.refresh();
      });
    }
    pollThread(id);
  };

  const handleSend = () => {
    if (!selectedId || !reply.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await sendLandingSupportReplyAction(selectedId, reply.trim());
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.message) {
        setLiveMessages((prev) => ({
          ...prev,
          [selectedId]: [...(prev[selectedId] ?? []), res.message],
        }));
        lastPollRef.current[selectedId] = res.message.createdAt;
      }
      setReply("");
      router.refresh();
    });
  };

  const handleClose = () => {
    if (!selectedId) return;
    startTransition(async () => {
      await closeLandingSupportAction(selectedId);
      router.refresh();
    });
  };

  if (sorted.length === 0) {
    return (
      <div className={styles.emptyState}>
        <ChatCircle size={48} weight="duotone" color="var(--sellia-subtle)" />
        <h3>Aucune conversation</h3>
        <p>Les messages des visiteurs de getsellia.com apparaîtront ici.</p>
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
              <span className={styles.chatListName}>
                {c.visitorName || "Visiteur"}
              </span>
              <span className={styles.chatListDate}>
                {formatDate(c.lastMessageAt)}
              </span>
            </div>
            <div className={styles.chatListPreview}>
              {STATUS_LABEL[c.status] ?? c.status} ·{" "}
              {c.lastMessagePreview || "—"}
            </div>
            {c.unreadForAdmin > 0 ? (
              <span className={styles.chatUnreadBadge}>{c.unreadForAdmin}</span>
            ) : null}
          </button>
        ))}
      </aside>

      <div className={styles.chatThread}>
        {selected ? (
          <>
            <div className={styles.chatThreadHead}>
              <div>
                <h3 className={styles.chatThreadTitle}>
                  {selected.visitorName || "Visiteur"}
                </h3>
                {selected.visitorEmail ? (
                  <p className={styles.chatThreadEmail}>{selected.visitorEmail}</p>
                ) : null}
                {selected.visitorPhone ? (
                  <p className={styles.chatThreadEmail}>
                    <a href={`tel:${selected.visitorPhone.replace(/\s/g, "")}`}>
                      {selected.visitorPhone}
                    </a>
                  </p>
                ) : null}
              </div>
              {selected.status !== "CLOSED" ? (
                <button
                  type="button"
                  className={styles.chatSendBtn}
                  onClick={handleClose}
                  disabled={pending}
                >
                  Clore
                </button>
              ) : null}
            </div>

            <div className={styles.chatMessages}>
              {threadMessages.map((m) => (
                <div
                  key={m.id}
                  className={`${styles.chatBubble} ${
                    m.sender === "admin"
                      ? styles.chatBubbleMerchant
                      : styles.chatBubbleCustomer
                  }`}
                >
                  {m.content}
                  <span className={styles.chatBubbleMeta}>
                    <span className={styles.chatBubbleTime}>
                      {formatDate(m.createdAt)}
                    </span>
                    {m.sender === "admin" && (
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

            {selected.status !== "CLOSED" ? (
              <div className={styles.chatReplyBox}>
                <textarea
                  className={styles.chatReplyInput}
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Répondre au visiteur…"
                  maxLength={2000}
                />
                <button
                  type="button"
                  className={styles.chatSendBtn}
                  disabled={pending || !reply.trim()}
                  onClick={handleSend}
                >
                  <PaperPlaneTilt size={16} weight="fill" />
                  {pending ? "Envoi…" : "Envoyer"}
                </button>
              </div>
            ) : null}
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
