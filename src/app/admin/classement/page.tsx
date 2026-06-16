import Link from "next/link";
import { getMerchantRanking } from "@/lib/admin/insights";
import { formatAdminMoney, planLabel } from "@/lib/admin/constants";
import AdminShopLink from "@/components/admin/AdminShopLink";
import AdminShopLinkActions from "@/components/admin/AdminShopLinkActions";
import AdminKpiGrid from "@/components/admin/AdminKpiGrid";
import { getClassementPageKpis } from "@/lib/admin/page-stats";

export const dynamic = "force-dynamic";

export default async function AdminClassementPage() {
  const [kpis, rows] = await Promise.all([
    getClassementPageKpis(),
    getMerchantRanking(),
  ]);

  return (
    <div>
      <h1 className="admin-page-title">Classement des marchands</h1>
      <p className="admin-page-sub">
        Score indicatif : GMV÷1000 + commandes×5 + note×20 + ancienneté (max
        365 j)×0,05. Lecture seule — ne détermine pas les commissions.
      </p>

      <AdminKpiGrid items={kpis} />

      <div className="admin-card admin-card--premium">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Boutique</th>
                <th className="admin-th-right">GMV</th>
                <th className="admin-th-right">Commandes</th>
                <th className="admin-th-right">Note</th>
                <th>Plan</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.shopId}>
                  <td>
                    {r.rank <= 3 ? (
                      <span className="admin-medal">
                        {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉"}
                      </span>
                    ) : (
                      r.rank
                    )}
                  </td>
                  <td>
                    <AdminShopLink
                      shopId={r.shopId}
                      name={r.shopName}
                      slug={r.shopSlug}
                    />
                  </td>
                  <td className="admin-td-right">
                    {formatAdminMoney(r.gmv)}
                  </td>
                  <td className="admin-td-right">{r.orderCount}</td>
                  <td className="admin-td-right">
                    {r.reviewCount > 0 ? r.avgRating.toFixed(1) : "—"}
                  </td>
                  <td>{planLabel(r.plan)}</td>
                  <td>
                    <AdminShopLinkActions shopId={r.shopId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
