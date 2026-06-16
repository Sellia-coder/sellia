"use client";

import { useTransition } from "react";
import { adminUpdateFeedbackStatusAction } from "@/app/actions/feedback";
import AdminIconAction from "@/components/admin/AdminIconAction";
import { Eye, CheckCircle } from "@phosphor-icons/react";

export default function FeedbackRowActions({
  feedbackId,
  status,
}: {
  feedbackId: string;
  status: "NEW" | "READ" | "HANDLED";
}) {
  const [pending, startTransition] = useTransition();

  const markRead = () => {
    if (!window.confirm("Marquer ce feedback comme lu ?")) return;
    startTransition(async () => {
      const res = await adminUpdateFeedbackStatusAction(feedbackId, "READ");
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  const markHandled = () => {
    if (!window.confirm("Marquer ce feedback comme traité ?")) return;
    startTransition(async () => {
      const res = await adminUpdateFeedbackStatusAction(
        feedbackId,
        "HANDLED"
      );
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  if (status === "HANDLED") {
    return (
      <div className="admin-icon-actions">
        <AdminIconAction title="Traité" disabled>
          <CheckCircle size={18} weight="duotone" />
        </AdminIconAction>
      </div>
    );
  }

  return (
    <div className="admin-icon-actions">
      {status === "NEW" ? (
        <AdminIconAction
          onClick={markRead}
          disabled={pending}
          variant="neutral"
          title="Marquer comme lu"
        >
          <Eye size={18} weight="duotone" />
        </AdminIconAction>
      ) : null}
      <AdminIconAction
        onClick={markHandled}
        disabled={pending || status !== "READ" && status !== "NEW"}
        variant={status === "READ" ? "ok" : "neutral"}
        title="Marquer comme traité"
      >
        <CheckCircle size={18} weight="duotone" />
      </AdminIconAction>
    </div>
  );
}

