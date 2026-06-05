import Link from "next/link";
import { db } from "@/lib/db";
import { PayoutStatus } from "@prisma/client";
import { formatAdminDate, formatAdminMoney } from "@/lib/admin/constants";
import { payoutStatusBadge } from "@/lib/admin/status-badges";
import { payoutTypeLabel } from "@/lib/admin/labels";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import RetraitsFilters from "./RetraitsFilters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminRetraitsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const where = status
    ? { status: status as PayoutStatus }
    : {};

  const [total, payouts] = await Promise.all([
    db.payout.count({ where }),
    db.payout.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        amount: true,
        commissionAmount: true,
        netAmount: true,
        status: true,
        payoutType: true,
        createdAt: true,
        shop: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = "/admin/retraits";
  const statusParam = status ? `&status=${encodeURIComponent(status)}` : "";

  return (
    <div>
      <h1 className="admin-page-title">Retraits</h1>
      <p className="admin-page-sub">
        {total} retrait{total !== 1 ? "s" : ""} — consultation uniquement. La
        validation des retraits importants sera disponible prochainement.
      </p>

      <RetraitsFilters initialStatus={status} />

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Boutique</th>
                <th className="admin-th-right">Montant</th>
                <th className="admin-th-right">Commission</th>
                <th>Statut</th>
                <th>Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Aucun retrait
                  </td>
                </tr>
              ) : (
                payouts.map((p) => {
                  const badge = payoutStatusBadge(p.status);
                  const isPendingValidation = p.status === PayoutStatus.REQUESTED;
                  return (
                    <tr
                      key={p.id}
                      className={isPendingValidation ? "admin-row-highlight" : undefined}
                    >
                      <td>
                        <Link href={`/admin/boutiques?q=${encodeURIComponent(p.shop.slug)}`}>
                          {p.shop.name}
                        </Link>
                      </td>
                      <td className="admin-td-right">
                        {formatAdminMoney(Number(p.netAmount))}
                      </td>
                      <td className="admin-td-right">
                        {p.commissionAmount != null
                          ? formatAdminMoney(Number(p.commissionAmount))
                          : "—"}
                      </td>
                      <td>
                        <AdminStatusBadge label={badge.label} variant={badge.variant} />
                      </td>
                      <td>{payoutTypeLabel(p.payoutType)}</td>
                      <td className="admin-date">{formatAdminDate(p.createdAt)}</td>
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
        prevHref={page > 1 ? `${base}?page=${page - 1}${statusParam}` : undefined}
        nextHref={
          page < totalPages ? `${base}?page=${page + 1}${statusParam}` : undefined
        }
      />
    </div>
  );
}
