import Link from "next/link";
import {
  getOrdersForFulfillmentAdmin,
  getFulfillmentCounts,
  type AdminFulfillmentBucket,
} from "@/lib/admin/insights";
import AdminKpiGrid from "@/components/admin/AdminKpiGrid";
import { getCommandesPageKpis } from "@/lib/admin/page-stats";
import { formatAdminDate, formatAdminMoney } from "@/lib/admin/constants";
import { paymentStatusBadge } from "@/lib/admin/status-badges";
import { STATUS_CONFIG } from "@/lib/order-status";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminOrderRowActions from "@/components/admin/AdminOrderRowActions";
import CommandesFilters from "./CommandesFilters";

export const dynamic = "force-dynamic";

const EMPTY_LABELS: Record<string, string> = {
  "": "Aucune commande pour le moment.",
  in_progress: "Aucune commande en cours de traitement.",
  pending_delivery: "Aucune commande en attente de livraison.",
  delivered: "Aucune commande livrée récemment.",
};

export default async function AdminCommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "" } = await searchParams;
  const bucket = (
    ["in_progress", "pending_delivery", "delivered"].includes(tab)
      ? tab
      : undefined
  ) as AdminFulfillmentBucket | undefined;

  const [kpis, counts, allOrders] = await Promise.all([
    getCommandesPageKpis(),
    getFulfillmentCounts(),
    getOrdersForFulfillmentAdmin({ limit: 500 }),
  ]);

  const orders = bucket
    ? allOrders.filter((o) => o.bucket === bucket).slice(0, 100)
    : allOrders.slice(0, 100);

  return (
    <div className="admin-commandes-page">
      <header className="admin-page-header-premium">
        <h1 className="admin-page-title">Commandes</h1>
        <p className="admin-page-sub">
          Suivi livraison par statut — lecture seule. Paiement et fulfillment
          calculés via <code>computeDisplayStatus</code>.
        </p>
      </header>

      <AdminKpiGrid items={kpis} />

      <CommandesFilters
        activeTab={tab}
        counts={counts}
        total={counts.total}
      />

      <div className="admin-card admin-card--premium">
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--premium">
            <thead>
              <tr>
                <th>N° commande</th>
                <th>Boutique</th>
                <th>Client</th>
                <th className="admin-th-right">Montant</th>
                <th>Paiement</th>
                <th>Livraison</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty-state">
                    <div className="admin-empty-state-icon">📦</div>
                    <div className="admin-empty-state-title">
                      Rien à afficher
                    </div>
                    <p className="admin-empty-state-text">
                      {EMPTY_LABELS[tab] ?? EMPTY_LABELS[""]}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const payBadge = paymentStatusBadge(o.paymentStatus);
                  const fulfill = STATUS_CONFIG[o.displayStatus];
                  return (
                    <tr key={o.orderNumber} className="admin-table-row-premium">
                      <td>
                        <Link
                          href={`/admin/transactions/${encodeURIComponent(o.orderNumber)}`}
                          className="admin-mono"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td>
                        <Link
                          href={`/admin/boutiques/${o.shop.id}`}
                          className="admin-table-link"
                        >
                          {o.shop.name}
                        </Link>
                      </td>
                      <td>{o.customerName}</td>
                      <td className="admin-td-right admin-amount">
                        {formatAdminMoney(o.total)}
                      </td>
                      <td>
                        <AdminStatusBadge
                          label={payBadge.label}
                          variant={payBadge.variant}
                        />
                      </td>
                      <td>
                        <AdminStatusBadge
                          label={fulfill?.label ?? o.displayStatus}
                          variant={
                            o.bucket === "delivered"
                              ? "ok"
                              : o.bucket === "pending_delivery"
                                ? "warn"
                                : "info"
                          }
                        />
                      </td>
                      <td className="admin-date">
                        {formatAdminDate(o.createdAt)}
                      </td>
                      <td>
                        <AdminOrderRowActions
                          orderNumber={o.orderNumber}
                          shopId={o.shop.id}
                        />
                      </td>
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
