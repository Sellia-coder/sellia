import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatAdminDate } from "@/lib/admin/constants";
import {
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
} from "@/lib/admin/labels";
import { reportStatusBadge } from "@/lib/admin/status-badges";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminReportDetailClient from "./AdminReportDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminSignalementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await db.productReport.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, status: true, slug: true } },
      shop: {
        select: {
          slug: true,
          name: true,
          owner: { select: { email: true } },
        },
      },
    },
  });
  if (!report) notFound();

  const statusBadge = reportStatusBadge(report.status);
  const productHidden = report.product.status !== "active";

  return (
    <div>
      <div className="admin-back-bar">
        <Link href="/admin/signalements" className="admin-btn admin-btn--sm">
          ← Signalements
        </Link>
      </div>

      <h1 className="admin-page-title">{report.product.name}</h1>
      <p className="admin-page-sub">
        {REPORT_REASON_LABELS[report.reason]} ·{" "}
        <AdminStatusBadge label={statusBadge.label} variant={statusBadge.variant} /> ·{" "}
        {formatAdminDate(report.createdAt)}
      </p>

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Signalement</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Motif</dt>
              <dd>{REPORT_REASON_LABELS[report.reason]}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Statut</dt>
              <dd>{REPORT_STATUS_LABELS[report.status]}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Description</dt>
              <dd style={{ textAlign: "left", maxWidth: 280 }}>{report.description}</dd>
            </div>
            {report.reporterEmail ? (
              <div className="admin-detail-row">
                <dt>Signalé par</dt>
                <dd>
                  {report.reporterName || "Anonyme"} ({report.reporterEmail})
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Boutique</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Nom</dt>
              <dd>{report.shop.name}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Marchand</dt>
              <dd>{report.shop.owner.email}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Produit</dt>
              <dd>{productHidden ? "Masqué" : "Visible"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <AdminReportDetailClient
        reportId={report.id}
        currentStatus={report.status}
        productId={report.product.id}
        productHidden={productHidden}
        merchantEmail={report.shop.owner.email}
        shopSlug={report.shop.slug}
      />
    </div>
  );
}
