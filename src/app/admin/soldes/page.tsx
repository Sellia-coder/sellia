import { db } from "@/lib/db";
import { formatAdminMoney } from "@/lib/admin/constants";
import { getAllShopBalancesMap } from "@/lib/admin/insights";
import AdminBalanceRowActions from "@/components/admin/AdminBalanceRowActions";
import AdminShopLink from "@/components/admin/AdminShopLink";
import SoldesFilters from "./SoldesFilters";
import AdminKpiGrid from "@/components/admin/AdminKpiGrid";
import { getSoldesPageKpis } from "@/lib/admin/page-stats";

export const dynamic = "force-dynamic";

export default async function AdminSoldesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q = "", sort = "available" } = await searchParams;
  const query = q.trim().toLowerCase();

  const [kpis, shops, balancesMap] = await Promise.all([
    getSoldesPageKpis(),
    db.shop.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        owner: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getAllShopBalancesMap(),
  ]);

  let rows = shops
    .filter(
      (s) =>
        !query ||
        s.slug.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        s.owner.email.toLowerCase().includes(query)
    )
    .map((s) => ({
      ...s,
      balances: balancesMap[s.id] ?? {
        available: 0,
        pendingEscrow: 0,
        inProgress: 0,
        paidTotal: 0,
        refunded: 0,
      },
    }));

  const sortKey = sort as keyof (typeof rows)[0]["balances"];
  if (sort === "available" || sort === "pendingEscrow" || sort === "inProgress" || sort === "paidTotal" || sort === "refunded") {
    rows = [...rows].sort((a, b) => b.balances[sortKey] - a.balances[sortKey]);
  } else if (sort === "name") {
    rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div>
      <h1 className="admin-page-title">Soldes marchands</h1>
      <p className="admin-page-sub">
        Lecture seule — agrégation des lignes Payout par statut. Aucune édition
        de solde possible.
      </p>
      <p className="admin-method-note">
        <strong>Disponible</strong> : retirable · <strong>Séquestre</strong> :
        en attente de libération · <strong>En cours</strong> : retraits
        demandés · <strong>Versé</strong> : déjà payé au marchand ·{" "}
        <strong>Remboursé</strong> : annulations comptables.
      </p>

      <AdminKpiGrid items={kpis} />

      <SoldesFilters initialQ={q} sort={sort} />

      <div className="admin-card admin-card--premium">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Boutique</th>
                <th>Propriétaire</th>
                <th className="admin-th-right">Disponible</th>
                <th className="admin-th-right">Séquestre</th>
                <th className="admin-th-right">En cours</th>
                <th className="admin-th-right">Versé</th>
                <th className="admin-th-right">Remboursé</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    Aucune boutique
                  </td>
                </tr>
              ) : (
                rows.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <AdminShopLink shopId={s.id} name={s.name} slug={s.slug} />
                    </td>
                    <td>{s.owner.email}</td>
                    <td className="admin-td-right">
                      {formatAdminMoney(s.balances.available)}
                    </td>
                    <td className="admin-td-right">
                      {formatAdminMoney(s.balances.pendingEscrow)}
                    </td>
                    <td className="admin-td-right">
                      {formatAdminMoney(s.balances.inProgress)}
                    </td>
                    <td className="admin-td-right">
                      {formatAdminMoney(s.balances.paidTotal)}
                    </td>
                    <td className="admin-td-right">
                      {formatAdminMoney(s.balances.refunded)}
                    </td>
                    <td>
                      <AdminBalanceRowActions shopId={s.id} />
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
