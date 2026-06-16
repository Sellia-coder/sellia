import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatAdminDate, formatAdminMoney } from "@/lib/admin/constants";
import { disputeStatusBadge } from "@/lib/admin/status-badges";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminShopLink from "@/components/admin/AdminShopLink";
import AdminEntityHistory from "@/components/admin/AdminEntityHistory";
import AdminDisputeDetailClient from "./AdminDisputeDetailClient";
import {
  DISPUTE_STATUS_LABELS,
  disputeReasonLabel,
  type DisputeStatus,
} from "@/lib/disputes/constants";

export const dynamic = "force-dynamic";

export default async function AdminLitigeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dispute = await db.dispute.findUnique({
    where: { id },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          paymentStatus: true,
          customerName: true,
          createdAt: true,
        },
      },
      shop: {
        select: {
          id: true,
          slug: true,
          name: true,
          owner: { select: { email: true } },
        },
      },
    },
  });
  if (!dispute) notFound();

  const resolver = dispute.resolvedBy
    ? await db.user.findUnique({
        where: { id: dispute.resolvedBy },
        select: { email: true, firstName: true, lastName: true },
      })
    : null;

  const statusBadge = disputeStatusBadge(dispute.status);
  const resolverName = resolver
    ? [resolver.firstName, resolver.lastName].filter(Boolean).join(" ") ||
      resolver.email
    : null;

  return (
    <div>
      <div className="admin-back-bar">
        <Link href="/admin/litiges" className="admin-btn admin-btn--sm">
          ← Litiges
        </Link>
      </div>

      <h1 className="admin-page-title">
        Litige — commande #{dispute.order.orderNumber}
      </h1>
      <p className="admin-page-sub">
        {disputeReasonLabel(dispute.reason)} ·{" "}
        <AdminStatusBadge label={statusBadge.label} variant={statusBadge.variant} /> ·{" "}
        {formatAdminDate(dispute.createdAt)}
      </p>

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Client</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Email</dt>
              <dd>{dispute.customerEmail}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Motif</dt>
              <dd>{disputeReasonLabel(dispute.reason)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Description</dt>
              <dd style={{ textAlign: "left", maxWidth: 320 }}>{dispute.description}</dd>
            </div>
          </dl>
        </div>

        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Commande & boutique</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Commande</dt>
              <dd>
                <Link
                  href={`/admin/transactions/${dispute.order.orderNumber}`}
                  className="admin-link"
                >
                  #{dispute.order.orderNumber}
                </Link>
              </dd>
            </div>
            <div className="admin-detail-row">
              <dt>Montant</dt>
              <dd>{formatAdminMoney(dispute.order.total)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Boutique</dt>
              <dd>
                <AdminShopLink
                  shopId={dispute.shop.id}
                  name={dispute.shop.name}
                  slug={dispute.shop.slug}
                  className="admin-link"
                />
              </dd>
            </div>
            <div className="admin-detail-row">
              <dt>Marchand</dt>
              <dd>{dispute.shop.owner.email}</dd>
            </div>
          </dl>
        </div>
      </div>

      {dispute.merchantResponse ? (
        <div className="admin-detail-card" style={{ marginTop: 20 }}>
          <h2 className="admin-detail-card-title">Réponse du marchand</h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            {dispute.merchantResponse}
          </p>
          {dispute.merchantRespondedAt ? (
            <p className="admin-muted" style={{ marginTop: 8, fontSize: 12 }}>
              {formatAdminDate(dispute.merchantRespondedAt)}
            </p>
          ) : null}
        </div>
      ) : null}

      {dispute.adminResolution ? (
        <div className="admin-detail-card" style={{ marginTop: 20 }}>
          <h2 className="admin-detail-card-title">Décision admin</h2>
          <p style={{ margin: "0 0 8px", fontSize: 14 }}>
            <strong>
              {DISPUTE_STATUS_LABELS[dispute.status as DisputeStatus] ??
                dispute.status}
            </strong>
          </p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            {dispute.adminResolution}
          </p>
          {resolverName || dispute.resolvedAt ? (
            <p className="admin-muted" style={{ marginTop: 8, fontSize: 12 }}>
              {resolverName ? `Par ${resolverName}` : ""}
              {dispute.resolvedAt
                ? ` · ${formatAdminDate(dispute.resolvedAt)}`
                : ""}
            </p>
          ) : null}
          <p
            className="admin-muted"
            style={{ marginTop: 12, fontSize: 12, fontStyle: "italic" }}
          >
            Cette décision n&apos;effectue pas de remboursement automatique.
          </p>
        </div>
      ) : null}

      <AdminDisputeDetailClient
        disputeId={dispute.id}
        currentStatus={dispute.status}
      />

      <AdminEntityHistory
        targetType="dispute"
        targetId={dispute.id}
        title="Historique admin — litige"
      />
    </div>
  );
}
