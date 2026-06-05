import Link from "next/link";
import { getAdminOverviewMetrics } from "@/lib/admin/metrics";
import {
  formatAdminDate,
  formatAdminMoney,
  planLabel,
} from "@/lib/admin/constants";
import { payoutStatusBadge } from "@/lib/admin/status-badges";
import AdminKpiGrid from "@/components/admin/AdminKpiGrid";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const m = await getAdminOverviewMetrics();

  const kpiItems = [
    {
      label: "Boutiques",
      value: String(m.shopsTotal),
      hint: `${m.shopsPublished} publiées`,
      icon: "shops" as const,
    },
    {
      label: "Utilisateurs",
      value: String(m.usersTotal),
      icon: "users" as const,
    },
    {
      label: "GMV total",
      value: formatAdminMoney(m.gmvTotal),
      hint: "Commandes payées",
      icon: "gmv" as const,
      ember: true,
    },
    {
      label: "Revenus Sellia",
      value: m.selliaRevenue != null ? formatAdminMoney(m.selliaRevenue) : "—",
      hint: "Commissions Sellia",
      icon: "revenue" as const,
      ember: true,
    },
    {
      label: "Retraits en attente",
      value: String(m.pendingWithdrawals),
      hint: "En attente de validation",
      icon: "withdrawals" as const,
    },
    {
      label: "Transactions du mois",
      value: String(m.ordersThisMonth),
      hint: "Commandes payées",
      icon: "orders" as const,
    },
  ];

  return (
    <div>
      <h1 className="admin-page-title">Vue d&apos;ensemble</h1>
      <p className="admin-page-sub">
        Indicateurs plateforme Sellia — lecture seule, agrégations en temps réel.
      </p>

      <AdminKpiGrid items={kpiItems} />

      <p className="admin-method-note">
        <strong>GMV total :</strong> le montant total de toutes les commandes payées sur
        la plateforme. <strong>Revenus Sellia :</strong> le total des commissions
        encaissées par Sellia sur ces ventes. Si aucune commission n&apos;est encore
        enregistrée, on affiche « — ».
      </p>

      <section className="admin-section">
        <h2 className="admin-section-title">Dernières boutiques créées</h2>
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Slug</th>
                  <th>Propriétaire</th>
                  <th>Plan</th>
                  <th>Créée le</th>
                </tr>
              </thead>
              <tbody>
                {m.recentShops.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-empty">
                      Aucune boutique
                    </td>
                  </tr>
                ) : (
                  m.recentShops.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link href={`/admin/boutiques?q=${encodeURIComponent(s.slug)}`}>
                          {s.slug}
                        </Link>
                      </td>
                      <td>{s.owner.email}</td>
                      <td>{planLabel(s.plan)}</td>
                      <td className="admin-date">{formatAdminDate(s.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Dernières commandes payées</h2>
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Boutique</th>
                  <th className="admin-th-right">Montant</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {m.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-empty">
                      Aucune commande
                    </td>
                  </tr>
                ) : (
                  m.recentOrders.map((o) => (
                    <tr key={o.orderNumber}>
                      <td className="admin-mono">{o.orderNumber}</td>
                      <td>{o.shop.name}</td>
                      <td className="admin-td-right">{formatAdminMoney(o.total)}</td>
                      <td className="admin-date">{formatAdminDate(o.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Derniers retraits</h2>
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Boutique</th>
                  <th className="admin-th-right">Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {m.recentPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-empty">
                      Aucun retrait
                    </td>
                  </tr>
                ) : (
                  m.recentPayouts.map((p) => {
                    const badge = payoutStatusBadge(p.status);
                    return (
                      <tr key={p.id}>
                        <td>{p.shop.name}</td>
                        <td className="admin-td-right">
                          {formatAdminMoney(Number(p.netAmount))}
                        </td>
                        <td>
                          <AdminStatusBadge label={badge.label} variant={badge.variant} />
                        </td>
                        <td className="admin-date">{formatAdminDate(p.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
