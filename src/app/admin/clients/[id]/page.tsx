import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatAdminDate, formatAdminMoney } from "@/lib/admin/constants";
import { paymentStatusBadge } from "@/lib/admin/status-badges";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminClientRowActions from "@/components/admin/AdminClientRowActions";
import AdminShopLink from "@/components/admin/AdminShopLink";

export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: { shop: { select: { id: true, name: true, slug: true } } },
  });
  if (!customer) notFound();

  const orders = await db.order.findMany({
    where: { shopId: customer.shopId, customerPhone: customer.phone },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      orderNumber: true,
      total: true,
      paymentStatus: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <div className="admin-back-bar">
        <Link href="/admin/clients" className="admin-btn admin-btn--sm">
          ← Clients
        </Link>
      </div>
      <h1 className="admin-page-title">{customer.fullName}</h1>
      <p className="admin-page-sub">
        {customer.shop.name} · {customer.totalOrders} commande
        {customer.totalOrders !== 1 ? "s" : ""}
      </p>

      <div className="admin-detail-actions-bar">
        <AdminClientRowActions
          customerId={customer.id}
          email={customer.email}
          phone={customer.phone}
        />
      </div>

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Coordonnées</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Boutique</dt>
              <dd>
                <AdminShopLink
                  shopId={customer.shop.id}
                  name={customer.shop.name}
                  slug={customer.shop.slug}
                  className="admin-link"
                />
              </dd>
            </div>
            <div className="admin-detail-row">
              <dt>Téléphone</dt>
              <dd className="admin-mono">{customer.phone}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Email</dt>
              <dd>{customer.email ?? "—"}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Total dépensé</dt>
              <dd>{formatAdminMoney(customer.totalSpent)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Dernière commande</dt>
              <dd>
                {customer.lastOrderAt
                  ? formatAdminDate(customer.lastOrderAt)
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="admin-section">
        <h2 className="admin-section-title">Commandes</h2>
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th className="admin-th-right">Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const badge = paymentStatusBadge(o.paymentStatus);
                  return (
                    <tr key={o.orderNumber}>
                      <td>
                        <Link
                          href={`/admin/transactions/${encodeURIComponent(o.orderNumber)}`}
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="admin-td-right">
                        {formatAdminMoney(o.total)}
                      </td>
                      <td>
                        <AdminStatusBadge
                          label={badge.label}
                          variant={badge.variant}
                        />
                      </td>
                      <td className="admin-date">
                        {formatAdminDate(o.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
