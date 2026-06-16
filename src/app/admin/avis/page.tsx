import Link from "next/link";
import { getShopReviewStatsList } from "@/lib/admin/insights";
import AdminAvisRowActions from "@/components/admin/AdminAvisRowActions";
import AdminKpiGrid from "@/components/admin/AdminKpiGrid";
import { getAvisPageKpis } from "@/lib/admin/page-stats";
import AdminShopLink from "@/components/admin/AdminShopLink";

export const dynamic = "force-dynamic";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span title={`${rating.toFixed(1)} / 5`}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}{" "}
      <span style={{ fontSize: 13 }}>{rating > 0 ? rating.toFixed(1) : "—"}</span>
    </span>
  );
}

export default async function AdminAvisPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "rating" } = await searchParams;
  const [kpis, statsRaw] = await Promise.all([
    getAvisPageKpis(),
    getShopReviewStatsList(),
  ]);
  let stats = statsRaw;

  if (sort === "rating") {
    stats = [...stats].sort((a, b) => b.avgRating - a.avgRating);
  } else if (sort === "count") {
    stats = [...stats].sort((a, b) => b.reviewCount - a.reviewCount);
  }

  return (
    <div>
      <h1 className="admin-page-title">Avis &amp; notes</h1>
      <p className="admin-page-sub">
        Note moyenne par boutique (avis approuvés + en attente). Masquage
        réversible sans suppression.
      </p>

      <AdminKpiGrid items={kpis} />

      <div className="admin-card admin-card--premium">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Boutique</th>
                <th>Note</th>
                <th className="admin-th-right">Nb avis</th>
                <th>Répartition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.filter((s) => s.reviewCount > 0).length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Aucun avis pour le moment
                  </td>
                </tr>
              ) : (
                stats
                  .filter((s) => s.reviewCount > 0)
                  .map((s) => (
                    <tr key={s.shopId}>
                      <td>
                        <AdminShopLink
                          shopId={s.shopId}
                          name={s.shopName}
                          slug={s.shopSlug}
                        />
                      </td>
                      <td>
                        <Stars rating={s.avgRating} />
                      </td>
                      <td className="admin-td-right">{s.reviewCount}</td>
                      <td style={{ fontSize: 12 }}>
                        {[5, 4, 3, 2, 1].map((n) => (
                          <span key={n} style={{ marginRight: 8 }}>
                            {n}★:{s.distribution[n as 1 | 2 | 3 | 4 | 5]}
                          </span>
                        ))}
                      </td>
                      <td>
                        <AdminAvisRowActions shopId={s.shopId} />
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
