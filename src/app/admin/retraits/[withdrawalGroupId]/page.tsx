import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PayoutStatus } from "@prisma/client";
import { formatAdminDate, formatAdminMoney } from "@/lib/admin/constants";
import { payoutStatusBadge } from "@/lib/admin/status-badges";
import { payoutStatusLabel, payoutTypeLabel } from "@/lib/admin/labels";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminWithdrawalRowActions from "@/components/admin/AdminWithdrawalRowActions";
import AdminWithdrawalMgmt from "@/components/admin/AdminWithdrawalMgmt";
import AdminShopLink from "@/components/admin/AdminShopLink";
import AdminEntityHistory from "@/components/admin/AdminEntityHistory";

export const dynamic = "force-dynamic";

export default async function AdminRetraitDetailPage({
  params,
}: {
  params: Promise<{ withdrawalGroupId: string }>;
}) {
  const { withdrawalGroupId } = await params;

  const rows = await db.payout.findMany({
    where: { withdrawalGroupId },
    include: {
      shop: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (rows.length === 0) notFound();

  const lead = rows[0];
  const gross =
    lead.withdrawalGrossAmount != null
      ? Number(lead.withdrawalGrossAmount)
      : rows.reduce((s, r) => s + Number(r.amount), 0);
  const net =
    lead.withdrawalNetAmount != null
      ? Number(lead.withdrawalNetAmount)
      : gross - (gross - rows.reduce((s, r) => s + Number(r.netAmount), 0));
  const fee = gross - net;

  const statuses = new Set(rows.map((r) => r.status));
  let status: PayoutStatus = lead.status;
  if (statuses.has(PayoutStatus.PROCESSING)) status = PayoutStatus.PROCESSING;
  if (statuses.has(PayoutStatus.REQUESTED)) status = PayoutStatus.REQUESTED;

  const badge = payoutStatusBadge(status);
  const shopUrl = `/admin/boutiques/${lead.shop.id}`;

  let reviewerEmail: string | null = null;
  if (lead.reviewedBy) {
    const reviewer = await db.user.findUnique({
      where: { id: lead.reviewedBy },
      select: { email: true },
    });
    reviewerEmail = reviewer?.email ?? lead.reviewedBy;
  }

  let verifierEmail: string | null = null;
  if (lead.adminVerifiedBy) {
    const verifier = await db.user.findUnique({
      where: { id: lead.adminVerifiedBy },
      select: { email: true },
    });
    verifierEmail = verifier?.email ?? lead.adminVerifiedBy;
  }

  const manualReviewRequired =
    lead.manualReviewRequired || rows.some((r) => r.manualReviewRequired);

  return (
    <div>
      <div className="admin-back-bar">
        <Link href="/admin/retraits" className="admin-btn admin-btn--sm">
          ← Retraits
        </Link>
      </div>

      <h1 className="admin-page-title">Retrait — {lead.shop.name}</h1>
      <p className="admin-page-sub">
        Groupe {withdrawalGroupId.slice(0, 8)}… ·{" "}
        {formatAdminDate(lead.requestedAt)}
      </p>

      {manualReviewRequired ? (
        <div className="admin-alert admin-alert--warn">
          <strong>À vérifier manuellement</strong> — Ce retrait nécessite une
          décision humaine avant toute action sur les fonds.
          {lead.errorMessage ? (
            <p style={{ margin: "8px 0 0", fontSize: 13 }}>{lead.errorMessage}</p>
          ) : null}
        </div>
      ) : null}

      <div className="admin-detail-actions-bar">
        <AdminWithdrawalRowActions
          withdrawalGroupId={withdrawalGroupId}
          status={status}
          shopAdminUrl={shopUrl}
        />
      </div>

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Demande</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Boutique</dt>
              <dd>
                <AdminShopLink
                  shopId={lead.shop.id}
                  name={lead.shop.name}
                  slug={lead.shop.slug}
                  className="admin-link"
                />
              </dd>
            </div>
            <div className="admin-detail-row">
              <dt>Montant brut</dt>
              <dd>{formatAdminMoney(gross)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Frais</dt>
              <dd>{formatAdminMoney(fee)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Net versé</dt>
              <dd>{formatAdminMoney(net)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Statut</dt>
              <dd>
                <AdminStatusBadge label={badge.label} variant={badge.variant} />
              </dd>
            </div>
            <div className="admin-detail-row">
              <dt>Date demande</dt>
              <dd>{formatAdminDate(lead.requestedAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Traçabilité</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Cartevo TX</dt>
              <dd className="admin-mono">{lead.cartevoTxId ?? "—"}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Validé par</dt>
              <dd>{reviewerEmail ?? "—"}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Validé le</dt>
              <dd>
                {lead.reviewedAt ? formatAdminDate(lead.reviewedAt) : "—"}
              </dd>
            </div>
            <div className="admin-detail-row">
              <dt>Motif rejet</dt>
              <dd>{lead.rejectionReason ?? "—"}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Lignes payout</dt>
              <dd>{rows.length}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Vérifié manuellement</dt>
              <dd>
                {lead.adminVerifiedAt
                  ? `${verifierEmail ?? "—"} · ${formatAdminDate(lead.adminVerifiedAt)}`
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <AdminWithdrawalMgmt
        withdrawalGroupId={withdrawalGroupId}
        initialNote={lead.adminInternalNote}
        manualReviewRequired={manualReviewRequired}
        cartevoTxId={lead.cartevoTxId}
        status={status}
      />

      <section className="admin-section">
        <h2 className="admin-section-title">Lignes du groupe</h2>
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th className="admin-th-right">Brut</th>
                  <th className="admin-th-right">Net</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>{payoutTypeLabel(p.payoutType)}</td>
                    <td className="admin-td-right">
                      {formatAdminMoney(Number(p.amount))}
                    </td>
                    <td className="admin-td-right">
                      {formatAdminMoney(Number(p.netAmount))}
                    </td>
                    <td>{payoutStatusLabel(p.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <AdminEntityHistory
        targetType="withdrawal_group"
        targetId={withdrawalGroupId}
        title="Historique admin — retrait"
      />
    </div>
  );
}
