"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatCircle, PaperPlaneTilt, X } from "@phosphor-icons/react";
import {
  CHAT_POLL_INTERVAL_MS,
  CHAT_SECURITY_BANNER,
  CHAT_STORAGE_KEY_PREFIX,
} from "@/lib/chat/constants";
import MessageReceiptTicks from "@/components/chat/MessageReceiptTicks";
import styles from "./shop-chat-widget.module.css";

type ChatMessage = {
  id: string;
  sender: "customer" | "merchant" | "system";
  content: string;
  flagged?: boolean;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
};

type StoredSession = {
  conversationId: string;
  visitorToken: string;
  customerName: string;
};

interface Props {
  shopSlug: string;
  shopName: string;
  shopLogoUrl?: string | null;
  primaryColor?: string | null;
}

function storageKey(slug: string) {
  return `${CHAT_STORAGE_KEY_PREFIX}${slug}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ShopChatWidget({
  shopSlug,
  shopName,
  shopLogoUrl,
  primaryColor = "#E84B1F",
}: Props) {
  const accent = primaryColor || "#E84B1F";
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPollRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(shopSlug));
      if (raw) {
        const parsed = JSON.parse(raw) as StoredSession;
        if (parsed.conversationId && parsed.visitorToken) {
          setSession(parsed);
          setName(parsed.customerName);
        }
      }
    } catch {
      // ignore
    }
  }, [shopSlug]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const pollMessages = useCallback(async () => {
    if (!session) return;
    const params = new URLSearchParams({
      conversationId: session.conversationId,
      visitorToken: session.visitorToken,
      markRead: "1",
    });
    if (lastPollRef.current) {
      params.set("since", lastPollRef.current);
    }
    try {
      const res = await fetch(
        `/api/shop/${shopSlug}/chat/poll?${params.toString()}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok || !Array.isArray(data.messages)) return;

      if (data.messages.length > 0) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const merged = [...prev];
          for (const m of data.messages as ChatMessage[]) {
            if (!ids.has(m.id)) merged.push(m);
          }
          return merged.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        const last = data.messages[data.messages.length - 1] as ChatMessage;
        lastPollRef.current = last.createdAt;
        scrollToBottom();
      }

      if (Array.isArray(data.receipts) && data.receipts.length > 0) {
        setMessages((prev) =>
          prev.map((m) => {
            const patch = (
              data.receipts as Array<{
                id: string;
                deliveredAt: string | null;
                readAt: string | null;
              }>
            ).find((r) => r.id === m.id);
            if (!patch) return m;
            return {
              ...m,
              deliveredAt: patch.deliveredAt,
              readAt: patch.readAt,
            };
          })
        );
      }
    } catch {
      // silent poll failure
    }
  }, [session, shopSlug, scrollToBottom]);

  useEffect(() => {
    if (!open || !session) return;
    pollMessages();
    const id = setInterval(pollMessages, CHAT_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open, session, pollMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const persistSession = (s: StoredSession) => {
    setSession(s);
    localStorage.setItem(storageKey(shopSlug), JSON.stringify(s));
  };

  const startConversation = async () => {
    setError(null);
    setLoading(true);
    try {
      const body: Record<string, string> = {
        customerName: name.trim(),
      };
      if (email.trim()) body.customerEmail = email.trim();
      if (session) {
        body.conversationId = session.conversationId;
        body.visitorToken = session.visitorToken;
      }

      const res = await fetch(`/api/shop/${shopSlug}/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Impossible de démarrer la conversation");
        return;
      }

      const newSession: StoredSession = {
        conversationId: data.conversationId,
        visitorToken: data.visitorToken,
        customerName: data.customerName,
      };
      persistSession(newSession);
      lastPollRef.current = null;
      setMessages([]);
      await pollMessages();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!session || !draft.trim() || sending) return;
    setWarning(null);
    setError(null);
    setSending(true);
    const content = draft.trim();
    setDraft("");

    try {
      const res = await fetch(`/api/shop/${shopSlug}/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: session.conversationId,
          visitorToken: session.visitorToken,
          content,
        }),
      });
      const data = await res.json();

      if (data.blocked) {
        setWarning(data.warning);
        setDraft(content);
        return;
      }

      if (!res.ok || !data.ok) {
        setError(data.error || "Envoi impossible");
        setDraft(content);
        return;
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message as ChatMessage]);
        lastPollRef.current = data.message.createdAt;
      }
    } catch {
      setError("Erreur réseau");
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  const initial = (shopName?.[0] ?? "S").toUpperCase();
  const showOnboarding = open && !session;

  return (
    <>
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Chat avec la boutique">
          <div className={styles.header}>
            <div className={styles.avatar}>
              {shopLogoUrl ? (
                <img src={shopLogoUrl} alt="" />
              ) : (
                initial
              )}
            </div>
            <div className={styles.headerText}>
              <p className={styles.shopName}>{shopName}</p>
              <p className={styles.headerSub}>Réponse sous 24h en moyenne</p>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          <div className={styles.securityBanner}>
            <strong>Sécurité Sellia</strong>
            {CHAT_SECURITY_BANNER}
          </div>

          {showOnboarding ? (
            <div className={styles.onboarding}>
              <h3 className={styles.onboardingTitle}>Discutez avec nous</h3>
              <p className={styles.onboardingDesc}>
                Posez vos questions sur nos produits. Nous ne demandons pas votre
                numéro de téléphone ici.
              </p>
              <div className={styles.field}>
                <label htmlFor="chat-name">Votre prénom ou nom *</label>
                <input
                  id="chat-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Marie"
                  maxLength={80}
                  autoComplete="name"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="chat-email">Email (optionnel)</label>
                <input
                  id="chat-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pour vous recontacter"
                  autoComplete="email"
                />
              </div>
              {error ? <p className={styles.error}>{error}</p> : null}
              <button
                type="button"
                className={styles.startBtn}
                style={{ background: accent }}
                disabled={loading || name.trim().length < 2}
                onClick={startConversation}
              >
                {loading ? "Connexion…" : "Démarrer la conversation"}
              </button>
            </div>
          ) : open && session ? (
            <>
              {warning ? <div className={styles.warning}>{warning}</div> : null}
              {error ? <p className={styles.error}>{error}</p> : null}
              <div className={styles.messages}>
                {messages.length === 0 ? (
                  <p className={styles.emptyMessages}>
                    Envoyez votre premier message…
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`${styles.bubble} ${
                        m.sender === "customer"
                          ? styles.bubbleCustomer
                          : styles.bubbleMerchant
                      }`}
                      style={
                        m.sender === "customer"
                          ? { background: accent }
                          : undefined
                      }
                    >
                      {m.content}
                      <div className={styles.bubbleMeta}>
                        <span className={styles.bubbleTime}>
                          {formatTime(m.createdAt)}
                        </span>
                        {m.sender === "customer" && (
                          <MessageReceiptTicks
                            deliveredAt={m.deliveredAt}
                            readAt={m.readAt}
                            onDark
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className={styles.composer}>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Écrivez votre message…"
                  maxLength={2000}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.sendBtn}
                  style={{ background: accent }}
                  disabled={sending || !draft.trim()}
                  onClick={sendMessage}
                  aria-label="Envoyer"
                >
                  <PaperPlaneTilt size={18} weight="fill" />
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}

      <button
        type="button"
        className={`${styles.fab} ${open ? styles.fabOpen : ""}`}
        style={{ background: accent }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {open ? (
          <X size={24} weight="bold" />
        ) : (
          <ChatCircle size={26} weight="duotone" />
        )}
      </button>
    </>
  );
}
