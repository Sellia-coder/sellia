import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatAdminDate, formatAdminMoney } from "@/lib/admin/constants";
import { paymentStatusBadge } from "@/lib/admin/status-badges";
import { payoutStatusLabel } from "@/lib/admin/labels";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminTransactionRowActions from "@/components/admin/AdminTransactionRowActions";
import AdminShopLink from "@/components/admin/AdminShopLink";
import type { OrderItem } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function AdminTransactionDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber: raw } = await params;
  const orderNumber = decodeURIComponent(raw);

  const order = await db.order.findFirst({
    where: { orderNumber },
    include: {
      shop: {
        select: { id: true, name: true, slug: true },
      },
      payouts: {
        select: {
          id: true,
          payoutType: true,
          amount: true,
          netAmount: true,
          status: true,
        },
      },
      cartevoTransaction: {
        select: {
          cartevoTxId: true,
          status: true,
          amount: true,
          currency: true,
        },
      },
    },
  });

  if (!order) notFound();

  const items = order.items as unknown as OrderItem[];
  const payBadge = paymentStatusBadge(order.paymentStatus);
  const shopUrl = `/admin/boutiques/${order.shop.id}`;

  return (
    <div>
      <div className="admin-back-bar">
        <Link href="/admin/transactions" className="admin-btn admin-btn--sm">
          ← Transactions
        </Link>
      </div>

      <h1 className="admin-page-title">Commande {order.orderNumber}</h1>
      <p className="admin-page-sub">
        {order.shop.name} · {formatAdminDate(order.createdAt)}
      </p>

      <div className="admin-detail-actions-bar">
        <AdminTransactionRowActions
          orderNumber={order.orderNumber}
          shopAdminUrl={shopUrl}
        />
      </div>

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Commande</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>N°</dt>
              <dd className="admin-mono">{order.orderNumber}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Statut paiement</dt>
              <dd>
                <AdminStatusBadge
                  label={payBadge.label}
                  variant={payBadge.variant}
                />
              </dd>
            </div>
            <div className="admin-detail-row">
              <dt>Montant total</dt>
              <dd>{formatAdminMoney(order.total)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Boutique</dt>
              <dd>
                <AdminShopLink
                  shopId={order.shop.id}
                  name={order.shop.name}
                  slug={order.shop.slug}
                  className="admin-link"
                />
              </dd>
            </div>
          </dl>
        </div>

        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Client</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Nom</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Téléphone</dt>
              <dd>{order.customerPhone}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Email</dt>
              <dd>{order.customerEmail ?? "—"}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Ville</dt>
              <dd>{order.customerCity ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="admin-section">
        <h2 className="admin-section-title">Articles</h2>
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th className="admin-th-right">Qté</th>
                  <th className="admin-th-right">Prix unit.</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td>{it.name ?? "Article"}</td>
                    <td className="admin-td-right">{it.quantity ?? 1}</td>
                    <td className="admin-td-right">
                      {formatAdminMoney(Number(it.price))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Paiement &amp; escrow</h2>
        <div className="admin-detail-card">
          {order.cartevoTransaction ? (
            <dl>
              <div className="admin-detail-row">
                <dt>Cartevo</dt>
                <dd className="admin-mono">
                  {order.cartevoTransaction.cartevoTxId}
                </dd>
              </div>
              <div className="admin-detail-row">
                <dt>Statut Cartevo</dt>
                <dd>{order.cartevoTransaction.status}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Montant</dt>
                <dd>
                  {formatAdminMoney(Number(order.cartevoTransaction.amount))}{" "}
                  {order.cartevoTransaction.currency}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="admin-page-sub">Pas de transaction Mobile Money liée.</p>
          )}
        </div>
      </section>

      {order.payouts.length > 0 ? (
        <section className="admin-section">
          <h2 className="admin-section-title">Payouts liés</h2>
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th className="admin-th-right">Montant</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {order.payouts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.payoutType}</td>
                      <td className="admin-td-right">
                        {formatAdminMoney(Number(p.netAmount))}
                      </td>
                      <td>{payoutStatusLabel(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
