"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useTransition } from "react";
import {
  sendMessageAction,
  getTicketWithMessagesAction,
  markTicketAsReadAction,
  pollTicketMessagesAction,
  closeTicketAction,
} from "@/app/actions/support";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Ouvert", color: "warning" },
  WAITING_SUPPORT: { label: "En attente Sellia", color: "info" },
  WAITING_USER: { label: "Réponse Sellia", color: "success" },
  RESOLVED: { label: "Résolu", color: "neutral" },
  CLOSED: { label: "Fermé", color: "neutral" },
};

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  lastMessageAt: string;
  lastMessageBy: string;
  unreadByUser: number;
  createdAt: string;
  resolvedAt: string | null;
}

interface Message {
  id: string;
  senderId: string | null;
  senderType: string;
  senderName: string;
  content: string;
  attachments: string[];
  readAt: string | null;
  createdAt: string;
}

interface Props {
  currentUserId: string;
  currentUserEmail: string;
  initialTickets: Ticket[];
}

export default function AideClient({ currentUserId, initialTickets }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTickets[0]?.id || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ticketDetails, setTicketDetails] = useState<{ status: string; subject: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedTicketId) {
      setMessages([]);
      setTicketDetails(null);
      return;
    }
    setLoading(true);
    getTicketWithMessagesAction(selectedTicketId).then((res) => {
      if (res.ok && res.messages && res.ticket) {
        setMessages(res.messages);
        setTicketDetails({ status: res.ticket.status, subject: res.ticket.subject });
        lastMessageIdRef.current = res.messages[res.messages.length - 1]?.id ?? null;
        markTicketAsReadAction(selectedTicketId).then(() => {
          setTickets((ts) => ts.map((t) => (t.id === selectedTicketId ? { ...t, unreadByUser: 0 } : t)));
        });
      }
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
  }, [selectedTicketId]);

  useEffect(() => {
    if (!selectedTicketId) return;
    const interval = setInterval(async () => {
      const res = await pollTicketMessagesAction(selectedTicketId, lastMessageIdRef.current);
      if (res.ok && res.messages && res.messages.length > 0) {
        setMessages((m) => [...m, ...res.messages]);
        lastMessageIdRef.current = res.messages[res.messages.length - 1]?.id ?? null;
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        markTicketAsReadAction(selectedTicketId);
      }
      if (res.ok && res.status && ticketDetails) {
        setTicketDetails({ ...ticketDetails, status: res.status });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedTicketId, ticketDetails]);

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Support</div>
          <h1 className="dash-page-title">Aide & Support</h1>
          <p className="dash-page-subtitle">Discutez directement avec notre équipe support. Réponse sous 24h ouvrées.</p>
        </div>
        <div className="dash-page-header-right">
          <Link href="/dashboard/aide/nouveau" className="dash-btn dash-btn-ember">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouveau ticket
          </Link>
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="dash-animate-fade-up" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "0", border: "1px solid var(--dash-border)", borderRadius: "12px", overflow: "hidden", background: "white", height: "calc(100vh - 240px)", minHeight: "560px" }}>
          <div style={{ borderRight: "1px solid var(--dash-border)", overflowY: "auto", background: "var(--dash-bg-active)" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--dash-border)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--dash-text-secondary)", fontWeight: 600 }}>
              {tickets.length} ticket{tickets.length > 1 ? "s" : ""}
            </div>
            {tickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId;
              const statusLabel = STATUS_LABELS[ticket.status] || STATUS_LABELS.OPEN;
              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "14px 16px",
                    background: isSelected ? "white" : "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--dash-border)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    borderLeft: isSelected ? "3px solid var(--dash-ember)" : "3px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                    <span className={`dash-badge dash-badge-${statusLabel.color}`} style={{ fontSize: "10px" }}>
                      <span className="dash-badge-dot"></span>{statusLabel.label}
                    </span>
                    {ticket.unreadByUser > 0 && (
                      <span style={{ background: "var(--dash-ember)", color: "white", borderRadius: "10px", padding: "2px 8px", fontSize: "10px", fontWeight: 700 }}>
                        {ticket.unreadByUser}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--dash-text-primary)", lineHeight: 1.3 }}>
                    {ticket.subject}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--dash-text-secondary)" }}>
                    {formatRelativeDate(ticket.lastMessageAt)}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {!selectedTicketId ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--dash-text-secondary)", fontSize: "14px" }}>
                Sélectionnez un ticket pour voir la conversation
              </div>
            ) : (
              <ConversationView
                ticketId={selectedTicketId}
                messages={messages}
                ticketDetails={ticketDetails}
                loading={loading}
                currentUserId={currentUserId}
                onMessageSent={(newMsg) => {
                  setMessages((m) => [...m, newMsg]);
                  lastMessageIdRef.current = newMsg.id;
                  setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
                }}
                onTicketClosed={() => {
                  setTicketDetails((td) => (td ? { ...td, status: "CLOSED" } : null));
                  setTickets((ts) => ts.map((t) => (t.id === selectedTicketId ? { ...t, status: "CLOSED" } : t)));
                }}
                messagesEndRef={messagesEndRef}
              />
            )}
          </div>
        </div>
      )}

    </>
  );
}

function ConversationView({
  ticketId,
  messages,
  ticketDetails,
  loading,
  currentUserId,
  onMessageSent,
  onTicketClosed,
  messagesEndRef,
}: {
  ticketId: string;
  messages: Message[];
  ticketDetails: { status: string; subject: string } | null;
  loading: boolean;
  currentUserId: string;
  onMessageSent: (msg: Message) => void;
  onTicketClosed: () => void;
  messagesEndRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isClosing, startCloseTransition] = useTransition();

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || isPending) return;

    startTransition(async () => {
      const res = await sendMessageAction(ticketId, trimmed);
      if (res.ok) {
        const optimisticMsg: Message = {
          id: `temp-${Date.now()}`,
          senderId: currentUserId,
          senderType: "MERCHANT",
          senderName: "Vous",
          content: trimmed,
          attachments: [],
          readAt: null,
          createdAt: new Date().toISOString(),
        };
        onMessageSent(optimisticMsg);
        setContent("");
      } else {
        alert(res.error || "Erreur");
      }
    });
  };

  const handleClose = () => {
    if (!confirm("Fermer ce ticket ? Vous ne pourrez plus envoyer de message.")) return;
    startCloseTransition(async () => {
      const res = await closeTicketAction(ticketId);
      if (res.ok) onTicketClosed();
      else alert(res.error || "Erreur");
    });
  };

  const isClosed = ticketDetails?.status === "CLOSED";
  const statusLabel = ticketDetails ? STATUS_LABELS[ticketDetails.status] || STATUS_LABELS.OPEN : null;

  return (
    <>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "white" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--dash-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ticketDetails?.subject || "Chargement..."}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {statusLabel && (
              <span className={`dash-badge dash-badge-${statusLabel.color}`} style={{ fontSize: "10px" }}>
                <span className="dash-badge-dot"></span>{statusLabel.label}
              </span>
            )}
            <span style={{ fontSize: "11px", color: "var(--dash-text-secondary)" }}>Ticket #{ticketId.slice(0, 8)}</span>
          </div>
        </div>
        {!isClosed && (
          <button type="button" onClick={handleClose} disabled={isClosing} className="dash-btn dash-btn-ghost dash-btn-sm" style={{ fontSize: "12px" }}>
            {isClosing ? "Fermeture..." : "Fermer le ticket"}
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "var(--dash-bg-active)", display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--dash-text-secondary)", fontSize: "13px" }}>Chargement...</div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} currentUserId={currentUserId} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {isClosed ? (
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--dash-border)", background: "var(--dash-bg-active)", textAlign: "center", fontSize: "13px", color: "var(--dash-text-secondary)" }}>
          Ce ticket est fermé. Créez un nouveau ticket pour toute nouvelle demande.
        </div>
      ) : (
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--dash-border)", background: "white" }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tapez votre message... (Cmd+Enter pour envoyer)"
            rows={3}
            maxLength={5000}
            className="dash-form-textarea"
            style={{ width: "100%", resize: "vertical", minHeight: "60px", marginBottom: "8px" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--dash-text-secondary)" }}>
              {content.length}/5000
            </div>
            <button type="button" onClick={handleSend} disabled={!content.trim() || isPending} className="dash-btn dash-btn-ember dash-btn-sm">
              {isPending ? "Envoi..." : "Envoyer"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "6px" }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function MessageBubble({ message, currentUserId }: { message: Message; currentUserId: string }) {
  if (message.senderType === "SYSTEM") {
    return (
      <div style={{ textAlign: "center", padding: "8px 12px" }}>
        <div style={{ display: "inline-block", padding: "8px 14px", background: "var(--dash-bg-active)", border: "1px dashed var(--dash-border)", borderRadius: "8px", fontSize: "12px", color: "var(--dash-text-secondary)", maxWidth: "85%" }}>
          {message.content}
        </div>
        <div style={{ fontSize: "10px", color: "var(--dash-text-tertiary)", marginTop: "4px" }}>
          {formatDateTime(message.createdAt)}
        </div>
      </div>
    );
  }

  const isMine = message.senderType === "MERCHANT" && message.senderId === currentUserId;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", gap: "4px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", flexDirection: isMine ? "row-reverse" : "row", maxWidth: "75%" }}>
        {!isMine && (
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--dash-ember)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
            S
          </div>
        )}
        <div style={{
          padding: "10px 14px",
          background: isMine ? "var(--dash-ember)" : "white",
          color: isMine ? "white" : "var(--dash-text-primary)",
          borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          fontSize: "13px",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          border: isMine ? "none" : "1px solid var(--dash-border)",
          wordBreak: "break-word",
        }}>
          {message.content}
        </div>
      </div>
      <div style={{ fontSize: "10px", color: "var(--dash-text-tertiary)", padding: isMine ? "0 12px 0 0" : "0 0 0 44px" }}>
        {message.senderName} · {formatDateTime(message.createdAt)}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="dash-animate-fade-up" style={{ padding: "80px 20px", textAlign: "center", border: "1px solid var(--dash-border)", borderRadius: "12px", background: "white" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(232, 75, 31, 0.12), rgba(232, 75, 31, 0.04))", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--dash-ember)" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
        </svg>
      </div>
      <h2 style={{ margin: "0 0 8px", fontSize: "20px", color: "var(--dash-text-primary)", fontWeight: 600 }}>Aucun ticket pour le moment</h2>
      <p style={{ margin: "0 0 24px", fontSize: "14px", color: "var(--dash-text-secondary)", maxWidth: "440px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
        Une question ? Un problème ? Notre équipe est là pour vous aider. Créez un ticket et nous vous répondons sous 24h ouvrées.
      </p>
      <Link href="/dashboard/aide/nouveau" className="dash-btn dash-btn-ember">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Créer mon premier ticket
      </Link>
    </div>
  );
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHour < 24) return `Il y a ${diffHour}h`;
  if (diffDay < 7) return `Il y a ${diffDay}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
