import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatAdminDate } from "@/lib/admin/constants";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminShopLink from "@/components/admin/AdminShopLink";
import FeedbackRowActions from "../FeedbackRowActions";
import {
  FEEDBACK_STATUS_LABELS,
  feedbackTypeLabel,
} from "@/lib/feedback/constants";
import type { MerchantFeedbackStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const feedback = await db.merchantFeedback.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      shop: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!feedback) notFound();

  const statusLabel =
    FEEDBACK_STATUS_LABELS[feedback.status as MerchantFeedbackStatus] ??
    feedback.status;

  const variant =
    feedback.status === "NEW"
      ? "warn"
      : feedback.status === "READ"
        ? "info"
        : feedback.status === "HANDLED"
          ? "ok"
          : "off";

  const merchantName =
    [feedback.user.firstName, feedback.user.lastName].filter(Boolean).join(" ") ||
    feedback.user.email;

  return (
    <div>
      <div className="admin-back-bar">
        <Link href="/admin/feedback" className="admin-btn admin-btn--sm">
          ← Feedback
        </Link>
      </div>

      <h1 className="admin-page-title">Feedback — {merchantName}</h1>
      <p className="admin-page-sub">
        {feedbackTypeLabel(feedback.type)} ·{" "}
        <AdminStatusBadge label={statusLabel} variant={variant} /> ·{" "}
        {formatAdminDate(feedback.createdAt)}
      </p>

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Détails</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Message</dt>
              <dd style={{ textAlign: "left", maxWidth: 520 }}>{feedback.message}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Marchand</dt>
              <dd>{merchantName}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Email</dt>
              <dd>{feedback.user.email}</dd>
            </div>
          </dl>
        </div>

        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Boutique</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Boutique</dt>
              <dd>
                {feedback.shop ? (
                  <AdminShopLink
                    shopId={feedback.shop.id}
                    name={feedback.shop.name}
                    slug={feedback.shop.slug}
                    className="admin-link"
                  />
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="admin-detail-card" style={{ marginTop: 20 }}>
        <h2 className="admin-detail-card-title">Actions admin</h2>
        <FeedbackRowActions
          feedbackId={feedback.id}
          status={feedback.status as MerchantFeedbackStatus}
        />
        <p className="admin-muted" style={{ marginTop: 10, fontSize: 12, fontStyle: "italic" }}>
          Cette action met à jour un statut — aucun remboursement automatique ni mouvement d&apos;argent.
        </p>
      </div>
    </div>
  );
}

