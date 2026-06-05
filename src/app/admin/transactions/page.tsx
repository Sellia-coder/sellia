import Link from "next/link";
import { db } from "@/lib/db";
import { formatAdminDate, formatAdminMoney } from "@/lib/admin/constants";
import { paymentStatusBadge } from "@/lib/admin/status-badges";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminReconcileButton from "@/components/admin/AdminReconcileButton";
import TransactionsFilters from "./TransactionsFilters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q = "", status = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const query = q.trim();

  const where: {
    paymentStatus?: string;
    OR?: Array<Record<string, unknown>>;
  } = {};

  if (status) where.paymentStatus = status;
  if (query) {
    where.OR = [
      { orderNumber: { contains: query, mode: "insensitive" } },
      { shop: { slug: { contains: query, mode: "insensitive" } } },
      { shop: { name: { contains: query, mode: "insensitive" } } },
      { customerName: { contains: query, mode: "insensitive" } },
    ];
  }

  const [total, orders] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        orderNumber: true,
        customerName: true,
        total: true,
        paymentStatus: true,
        createdAt: true,
        shop: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = "/admin/transactions";
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const qSuffix = params.toString() ? `&${params.toString()}` : "";

  return (
    <div>
      <h1 className="admin-page-title">Transactions</h1>
      <p className="admin-page-sub">
        {total} commande{total !== 1 ? "s" : ""} — consultation et réconciliation
        des paiements Mobile Money.
      </p>

      <TransactionsFilters initialQ={q} initialStatus={status} />

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Boutique</th>
                <th>Client</th>
                <th className="admin-th-right">Montant</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    Aucune commande
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const badge = paymentStatusBadge(o.paymentStatus);
                  return (
                    <tr key={o.orderNumber}>
                      <td className="admin-mono">{o.orderNumber}</td>
                      <td>
                        <Link href={`/admin/boutiques?q=${encodeURIComponent(o.shop.slug)}`}>
                          {o.shop.slug}
                        </Link>
                      </td>
                      <td>{o.customerName}</td>
                      <td className="admin-td-right">{formatAdminMoney(o.total)}</td>
                      <td>
                        <AdminStatusBadge label={badge.label} variant={badge.variant} />
                      </td>
                      <td className="admin-date">{formatAdminDate(o.createdAt)}</td>
                      <td>
                        <AdminReconcileButton orderNumber={o.orderNumber} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        prevHref={page > 1 ? `${base}?page=${page - 1}${qSuffix}` : undefined}
        nextHref={
          page < totalPages ? `${base}?page=${page + 1}${qSuffix}` : undefined
        }
      />
    </div>
  );
}
