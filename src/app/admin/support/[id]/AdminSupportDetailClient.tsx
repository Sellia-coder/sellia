"use client";

import { useState, useTransition } from "react";
import {
  adminReplySupportTicketAction,
  adminCloseSupportTicketAction,
} from "@/app/actions/admin-platform";

export default function AdminSupportDetailClient({
  ticketId,
  isClosed,
}: {
  ticketId: string;
  isClosed: boolean;
}) {
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();

  const reply = () => {
    if (!content.trim()) return;
    startTransition(async () => {
      const res = await adminReplySupportTicketAction(ticketId, content);
      if (!res.ok) alert(res.error ?? "Erreur");
      else setContent("");
    });
  };

  const close = () => {
    if (!window.confirm("Clore ce ticket ?")) return;
    startTransition(async () => {
      const res = await adminCloseSupportTicketAction(ticketId);
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  if (isClosed) {
    return (
      <p style={{ color: "var(--admin-muted)", fontSize: 14 }}>Ce ticket est fermé.</p>
    );
  }

  return (
    <div className="admin-support-reply">
      <textarea
        className="admin-search"
        style={{ maxWidth: "none", width: "100%", minHeight: 100, resize: "vertical" }}
        placeholder="Votre réponse au marchand…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={pending}
      />
      <div className="admin-toolbar" style={{ marginBottom: 0 }}>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={reply}
          disabled={pending || !content.trim()}
        >
          Répondre
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--danger"
          onClick={close}
          disabled={pending}
        >
          Clore le ticket
        </button>
      </div>
    </div>
  );
}
