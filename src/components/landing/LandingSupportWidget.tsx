"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatCircle, PaperPlaneTilt, X } from "@phosphor-icons/react";
import {
  LANDING_SUPPORT_POLL_INTERVAL_MS,
  LANDING_SUPPORT_SECURITY_BANNER,
  LANDING_SUPPORT_STORAGE_KEY,
} from "@/lib/chat/constants";
import MessageReceiptTicks from "@/components/chat/MessageReceiptTicks";
import styles from "./landing-support-widget.module.css";

type SupportMessage = {
  id: string;
  sender: "visitor" | "admin";
  content: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
};

type StoredSession = {
  conversationId: string;
  visitorToken: string;
  visitorName?: string | null;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LandingSupportWidget() {
  const accent = "#E84B1F";
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [draft, setDraft] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPollRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LANDING_SUPPORT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredSession;
        if (parsed.conversationId && parsed.visitorToken) {
          setSession(parsed);
          if (parsed.visitorName) setName(parsed.visitorName);
        }
      }
    } catch {
      // ignore
    }
  }, []);

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
    if (lastPollRef.current) params.set("since", lastPollRef.current);

    try {
      const res = await fetch(`/api/support/landing/poll?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok) return;

      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const merged = [...prev];
          for (const m of data.messages as SupportMessage[]) {
            if (!ids.has(m.id)) merged.push(m);
          }
          return merged.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        const last = data.messages[data.messages.length - 1] as SupportMessage;
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
            return { ...m, deliveredAt: patch.deliveredAt, readAt: patch.readAt };
          })
        );
      }
    } catch {
      // silent
    }
  }, [session, scrollToBottom]);

  useEffect(() => {
    if (!open || !session) return;
    pollMessages();
    const id = setInterval(pollMessages, LANDING_SUPPORT_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open, session, pollMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const persistSession = (s: StoredSession) => {
    setSession(s);
    localStorage.setItem(LANDING_SUPPORT_STORAGE_KEY, JSON.stringify(s));
  };

  const startConversation = async () => {
    setError(null);
    setLoading(true);
    try {
      const body: Record<string, string> = {};
      if (name.trim()) body.visitorName = name.trim();
      if (email.trim()) body.visitorEmail = email.trim();
      if (phone.trim()) body.visitorPhone = phone.trim();
      if (session) {
        body.conversationId = session.conversationId;
        body.visitorToken = session.visitorToken;
      }

      const res = await fetch("/api/support/landing/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Impossible de démarrer");
        return;
      }

      const newSession: StoredSession = {
        conversationId: data.conversationId,
        visitorToken: data.visitorToken,
        visitorName: data.visitorName ?? name.trim(),
      };
      persistSession(newSession);
      lastPollRef.current = null;
      if (!data.resumed) setMessages([]);
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
      const res = await fetch("/api/support/landing/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: session.conversationId,
          visitorToken: session.visitorToken,
          content,
          visitorName: name.trim() || undefined,
          visitorEmail: email.trim() || undefined,
          visitorPhone: phone.trim() || undefined,
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
        setMessages((prev) => [...prev, data.message as SupportMessage]);
        lastPollRef.current = data.message.createdAt;
      }
    } catch {
      setError("Erreur réseau");
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  const showOnboarding = open && !session;
  const needsName = open && session && messages.length === 0 && !name.trim();

  return (
    <>
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Support Sellia">
          <div className={styles.header}>
            <div className={styles.avatar}>S</div>
            <div className={styles.headerText}>
              <p className={styles.title}>Support Sellia</p>
              <p className={styles.headerSub}>Équipe disponible · réponse rapide</p>
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
            <strong>Canal officiel</strong>
            {LANDING_SUPPORT_SECURITY_BANNER}
          </div>

          {showOnboarding ? (
            <div className={styles.onboarding}>
              <h3 className={styles.onboardingTitle}>Comment pouvons-nous vous aider ?</h3>
              <p className={styles.onboardingDesc}>
                Posez votre question sur Sellia. Notre équipe vous répond ici.
              </p>
              <div className={styles.field}>
                <label htmlFor="support-name">Votre nom (optionnel)</label>
                <input
                  id="support-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Marie"
                  maxLength={80}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="support-email">Email (optionnel)</label>
                <input
                  id="support-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pour vous recontacter"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="support-phone">Téléphone (optionnel)</label>
                <input
                  id="support-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="pour un rappel rapide"
                  maxLength={30}
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
              {error ? <p className={styles.error}>{error}</p> : null}
              <button
                type="button"
                className={styles.startBtn}
                disabled={loading}
                onClick={startConversation}
              >
                {loading ? "Connexion…" : "Démarrer"}
              </button>
            </div>
          ) : open && session ? (
            <>
              {needsName ? (
                <div className={styles.onboarding}>
                  <p className={styles.onboardingDesc}>
                    Indiquez votre prénom pour personnaliser l&apos;échange.
                  </p>
                  <div className={styles.field}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom"
                      maxLength={80}
                    />
                  </div>
                </div>
              ) : null}
              {warning ? <div className={styles.warning}>{warning}</div> : null}
              {error ? <p className={styles.error}>{error}</p> : null}
              <div className={styles.messages}>
                {messages.length === 0 ? (
                  <p className={styles.emptyMessages}>Écrivez votre message…</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`${styles.bubble} ${
                        m.sender === "visitor"
                          ? styles.bubbleVisitor
                          : styles.bubbleAdmin
                      }`}
                      style={
                        m.sender === "visitor" ? { background: accent } : undefined
                      }
                    >
                      {m.content}
                      <div className={styles.bubbleMeta}>
                        <span className={styles.bubbleTime}>
                          {formatTime(m.createdAt)}
                        </span>
                        {m.sender === "visitor" && (
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
                  placeholder="Votre message…"
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
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le support" : "Contacter le support Sellia"}
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
