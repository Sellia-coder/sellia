import Link from "next/link";
import { db } from "@/lib/db";
import { formatAdminDate } from "@/lib/admin/constants";
import { REPORT_REASON_LABELS } from "@/lib/admin/labels";
import { reportStatusBadge } from "@/lib/admin/status-badges";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminSignalementsPage() {
  const reports = await db.productReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      product: { select: { name: true } },
      shop: { select: { name: true, slug: true } },
    },
  });

  return (
    <div>
      <h1 className="admin-page-title">Signalements</h1>
      <p className="admin-page-sub">
        {reports.length} signalement{reports.length !== 1 ? "s" : ""} de produits
        signalés par des visiteurs.
      </p>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Boutique</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Aucun signalement
                  </td>
                </tr>
              ) : (
                reports.map((r) => {
                  const badge = reportStatusBadge(r.status);
                  return (
                    <tr key={r.id}>
                      <td>
                        <Link href={`/admin/signalements/${r.id}`}>
                          {r.product.name}
                        </Link>
                      </td>
                      <td>
                        <Link href={`/admin/boutiques?q=${encodeURIComponent(r.shop.slug)}`}>
                          {r.shop.name}
                        </Link>
                      </td>
                      <td>{REPORT_REASON_LABELS[r.reason] ?? r.reason}</td>
                      <td>
                        <AdminStatusBadge label={badge.label} variant={badge.variant} />
                      </td>
                      <td className="admin-date">{formatAdminDate(r.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
