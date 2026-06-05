import Link from "next/link";
import { getAdminOverviewMetrics } from "@/lib/admin/metrics";
import {
  formatAdminDate,
  formatAdminMoney,
  planLabel,
} from "@/lib/admin/constants";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const m = await getAdminOverviewMetrics();

  return (
    <div>
      <h1 className="admin-page-title">Vue d&apos;ensemble</h1>
      <p className="admin-page-sub">
        Indicateurs plateforme Sellia — lecture seule, agrégations en temps réel.
      </p>

      <div className="admin-kpi-grid">
        <div className="admin-kpi">
          <div className="admin-kpi-label">Boutiques</div>
          <div className="admin-kpi-value">{m.shopsTotal}</div>
          <div className="admin-kpi-hint">{m.shopsPublished} publiées</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">Utilisateurs</div>
          <div className="admin-kpi-value">{m.usersTotal}</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">GMV total</div>
          <div className="admin-kpi-value">{formatAdminMoney(m.gmvTotal)}</div>
          <div className="admin-kpi-hint">Commandes payées (escrow + released + offline)</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">Revenus Sellia (estimé)</div>
          <div className="admin-kpi-value">
            {m.selliaRevenue != null ? formatAdminMoney(m.selliaRevenue) : "—"}
          </div>
          <div className="admin-kpi-hint">Σ commissions Payout (ORDER_*)</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">Retraits en attente</div>
          <div className="admin-kpi-value">{m.pendingWithdrawals}</div>
          <div className="admin-kpi-hint">Statut REQUESTED (&gt;50k)</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">Transactions du mois</div>
          <div className="admin-kpi-value">{m.ordersThisMonth}</div>
          <div className="admin-kpi-hint">Commandes payées ce mois</div>
        </div>
      </div>

      <p className="admin-method-note">
        <strong>Méthode GMV :</strong> somme des <code>Order.total</code> avec{" "}
        <code>paymentStatus</code> ∈ paid_escrow, paid_offline, paid_released.{" "}
        <strong>Revenus Sellia :</strong> somme des <code>Payout.commissionAmount</code>{" "}
        sur payouts commande (hors FAILED/CANCELLED/REFUNDED). Affiche « — » si aucune
        commission enregistrée.
      </p>

      <section className="admin-section">
        <h2 className="admin-section-title">Dernières boutiques créées</h2>
        <div className="admin-card">
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
                    <td>{formatAdminDate(s.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Dernières commandes payées</h2>
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Boutique</th>
                <th>Montant</th>
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
                    <td>{o.orderNumber}</td>
                    <td>{o.shop.name}</td>
                    <td>{formatAdminMoney(o.total)}</td>
                    <td>{formatAdminDate(o.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Derniers retraits</h2>
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Boutique</th>
                <th>Montant</th>
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
                m.recentPayouts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.shop.name}</td>
                    <td>{formatAdminMoney(Number(p.netAmount))}</td>
                    <td>
                      <span className="admin-badge admin-badge--warn">{p.status}</span>
                    </td>
                    <td>{formatAdminDate(p.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
