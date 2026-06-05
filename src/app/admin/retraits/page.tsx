import Link from "next/link";
import { db } from "@/lib/db";
import { PayoutStatus } from "@prisma/client";
import { formatAdminDate, formatAdminMoney } from "@/lib/admin/constants";
import { payoutStatusBadge } from "@/lib/admin/status-badges";
import { payoutTypeLabel } from "@/lib/admin/labels";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminWithdrawalRowActions from "@/components/admin/AdminWithdrawalRowActions";
import AdminExportButton from "@/components/admin/AdminExportButton";
import AdminReconcilePayoutsButton from "@/components/admin/AdminReconcilePayoutsButton";
import RetraitsFilters from "./RetraitsFilters";
import {
  listWithdrawalGroups,
  backfillLegacyWithdrawalGroups,
} from "@/lib/payouts/withdrawal";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminRetraitsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; filter?: string }>;
}) {
  const { status = "", page: pageStr = "1", filter = "" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const legacyBackfill = await backfillLegacyWithdrawalGroups();
  const pendingGroups = await listWithdrawalGroups();

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
        withdrawalGroupId: true,
        manualReviewRequired: true,
        errorMessage: true,
        shop: { select: { id: true, name: true, slug: true } },
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
        Validation des retraits importants (&gt; 50 000 FCFA) et réconciliation
        des versements en cours.
        {legacyBackfill.hadLegacy ? (
          <span className="admin-legacy-warn">
            {" "}
            — Des demandes anciennes ont été regroupées automatiquement (
            {legacyBackfill.groupsCreated} groupe
            {legacyBackfill.groupsCreated !== 1 ? "s" : ""}).
          </span>
        ) : null}
      </p>

      <div className="admin-retraits-toolbar">
        <RetraitsFilters initialStatus={status} initialFilter={filter} />
        <div className="admin-reconcile-toolbar">
          <AdminReconcilePayoutsButton />
          <AdminExportButton resource="retraits" />
        </div>
      </div>

      {pendingGroups.length > 0 ? (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h2 className="admin-section-title">Demandes de retrait</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Boutique</th>
                  <th className="admin-th-right">Brut</th>
                  <th className="admin-th-right">Net versé</th>
                  <th>Statut</th>
                  <th>Lignes</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingGroups.map((g) => {
                  const badge = payoutStatusBadge(g.status);
                  const isPending = g.status === PayoutStatus.REQUESTED;
                  const displayBadge = g.manualReviewRequired
                    ? { label: "À vérifier manuellement", variant: "warn" as const }
                    : badge;

                  return (
                    <tr
                      key={g.withdrawalGroupId}
                      className={isPending ? "admin-row-highlight" : undefined}
                    >
                      <td>
                        <Link href={`/admin/boutiques/${g.shopId}`}>
                          {g.shopName}
                        </Link>
                      </td>
                      <td className="admin-td-right">
                        {formatAdminMoney(g.grossAmount)}
                      </td>
                      <td className="admin-td-right">
                        {formatAdminMoney(g.netAmount)}
                      </td>
                      <td>
                        <AdminStatusBadge
                          label={displayBadge.label}
                          variant={displayBadge.variant}
                        />
                      </td>
                      <td>{g.payoutCount}</td>
                      <td className="admin-date">
                        {formatAdminDate(g.requestedAt)}
                      </td>
                      <td>
                        <AdminWithdrawalRowActions
                          withdrawalGroupId={g.withdrawalGroupId}
                          status={g.status}
                          shopAdminUrl={`/admin/boutiques/${g.shopId}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="admin-card">
        <h2 className="admin-section-title">Historique des payouts</h2>
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
                  let badge = payoutStatusBadge(p.status);
                  if (p.manualReviewRequired) {
                    badge = {
                      label: "À vérifier manuellement",
                      variant: "warn",
                    };
                  } else if (p.errorMessage?.includes("fonds restitués")) {
                    badge = {
                      label: "Échoué (fonds restitués)",
                      variant: "danger",
                    };
                  }
                  const isPendingValidation = p.status === PayoutStatus.REQUESTED;
                  return (
                    <tr
                      key={p.id}
                      className={
                        isPendingValidation ? "admin-row-highlight" : undefined
                      }
                    >
                      <td>
                        <Link href={`/admin/boutiques/${p.shop.id}`}>
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
                        <AdminStatusBadge
                          label={badge.label}
                          variant={badge.variant}
                        />
                      </td>
                      <td>{payoutTypeLabel(p.payoutType)}</td>
                      <td className="admin-date">
                        {formatAdminDate(p.createdAt)}
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
        prevHref={page > 1 ? `${base}?page=${page - 1}${statusParam}` : undefined}
        nextHref={
          page < totalPages ? `${base}?page=${page + 1}${statusParam}` : undefined
        }
      />
    </div>
  );
}
