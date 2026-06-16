import Link from "next/link";
import { getAdminAbonnementsData } from "@/lib/admin/abonnements";
import { formatAdminMoney } from "@/lib/admin/constants";
import AdminKpiGrid from "@/components/admin/AdminKpiGrid";
import { getAbonnementsPageKpis } from "@/lib/admin/page-stats";

export const dynamic = "force-dynamic";

export default async function AdminAbonnementsPage() {
  const [kpis, data] = await Promise.all([
    getAbonnementsPageKpis(),
    getAdminAbonnementsData(),
  ]);
  const revenue = data.totalRevenue;

  return (
    <div>
      <h1 className="admin-page-title">Abonnements &amp; revenus</h1>
      <p className="admin-page-sub">
        Répartition des plans et commissions Sellia — lecture seule.
      </p>

      <AdminKpiGrid items={kpis} />

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Revenus Sellia</h2>
          <p style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px" }}>
            {revenue != null ? formatAdminMoney(revenue) : "—"}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--admin-muted)" }}>
            Total des commissions encaissées
          </p>
        </div>
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Boutiques par plan</h2>
          <dl>
            {data.planDistribution.map((p) => (
              <div key={p.plan} className="admin-detail-row">
                <dt>
                  {p.label} ({p.percent}%)
                </dt>
                <dd>{p.count}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Commissions par mois</h2>
          {data.monthlyRevenue.length === 0 ? (
            <p style={{ margin: 0, color: "var(--admin-muted)", fontSize: 14 }}>—</p>
          ) : (
            <dl>
              {data.monthlyRevenue.map((m) => (
                <div key={m.month} className="admin-detail-row">
                  <dt>{m.month}</dt>
                  <dd>{formatAdminMoney(m.amount)}</dd>
                </div>
              ))}
            </dl>
          )}
          <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--admin-muted)" }}>
            Pas de MRR d&apos;abonnement récurrent — les forfaits mensuels ne sont pas
            encore facturés automatiquement.
          </p>
        </div>
      </div>

      <section className="admin-section">
        <h2 className="admin-section-title">Boutiques et plans</h2>
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Boutique</th>
                  <th>Plan</th>
                  <th className="admin-th-right">GMV</th>
                </tr>
              </thead>
              <tbody>
                {data.shopsWithGmv.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/admin/boutiques?q=${encodeURIComponent(s.slug)}`}>
                        {s.slug}
                      </Link>
                    </td>
                    <td>{s.planLabel}</td>
                    <td className="admin-td-right">{formatAdminMoney(s.gmv)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
