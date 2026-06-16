import {
  listAdminAuditLogs,
  countAdminAuditLogs,
  AUDIT_ACTION_LABELS,
} from "@/lib/admin/audit-log";
import { formatAdminDate } from "@/lib/admin/constants";
import AdminPagination from "@/components/admin/AdminPagination";
import AuditFilters from "./AuditFilters";
import AdminKpiGrid from "@/components/admin/AdminKpiGrid";
import { getAuditPageKpis } from "@/lib/admin/page-stats";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

function parseDateEnd(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseDateStart(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    action?: string;
    targetType?: string;
    admin?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const {
    q = "",
    action = "",
    targetType = "",
    admin = "",
    from = "",
    to = "",
    page: pageStr = "1",
  } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const fromDate = parseDateStart(from);
  const toDate = parseDateEnd(to);

  const filterOpts = {
    q,
    action: action || undefined,
    targetType: targetType || undefined,
    adminEmail: admin || undefined,
    from: fromDate,
    to: toDate,
  };

  const [kpis, logs, total] = await Promise.all([
    getAuditPageKpis(),
    listAdminAuditLogs({
      ...filterOpts,
      limit: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    countAdminAuditLogs(filterOpts),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const queryParts: string[] = [];
  if (q) queryParts.push(`q=${encodeURIComponent(q)}`);
  if (action) queryParts.push(`action=${encodeURIComponent(action)}`);
  if (targetType) queryParts.push(`targetType=${encodeURIComponent(targetType)}`);
  if (admin) queryParts.push(`admin=${encodeURIComponent(admin)}`);
  if (from) queryParts.push(`from=${encodeURIComponent(from)}`);
  if (to) queryParts.push(`to=${encodeURIComponent(to)}`);
  const querySuffix = queryParts.length ? `&${queryParts.join("&")}` : "";
  const base = "/admin/audit";

  return (
    <div>
      <h1 className="admin-page-title">Journal d&apos;audit</h1>
      <p className="admin-page-sub">
        {total} entrée{total !== 1 ? "s" : ""} — traçabilité des actions admin
        sensibles. Lecture seule.
      </p>

      <AdminKpiGrid items={kpis} />

      <AuditFilters
        initialQ={q}
        initialAction={action}
        initialTargetType={targetType}
        initialAdmin={admin}
        initialFrom={from}
        initialTo={to}
      />

      <div className="admin-card admin-card--premium">
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--premium">
            <thead>
              <tr>
                <th>Quand</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Cible</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty-state">
                    <div className="admin-empty-state-title">
                      Aucune entrée
                    </div>
                    <p className="admin-empty-state-text">
                      Les actions admin apparaîtront ici (après migration audit
                      si besoin).
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((row) => (
                  <tr key={row.id} className="admin-table-row-premium">
                    <td className="admin-date">
                      {formatAdminDate(row.createdAt)}
                    </td>
                    <td className="admin-mono" style={{ fontSize: 12 }}>
                      {row.adminEmail}
                    </td>
                    <td>
                      {AUDIT_ACTION_LABELS[row.action] ?? row.action}
                    </td>
                    <td>
                      {row.targetType ? (
                        <span>
                          {row.targetType}
                          {row.targetId ? (
                            <span className="admin-muted-text">
                              {" "}
                              · {row.targetId.slice(0, 12)}
                              {row.targetId.length > 12 ? "…" : ""}
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      style={{
                        fontSize: 12,
                        color: "var(--admin-muted)",
                        maxWidth: 280,
                      }}
                    >
                      {row.details
                        ? row.details.length > 120
                          ? `${row.details.slice(0, 120)}…`
                          : row.details
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        prevHref={
          page > 1 ? `${base}?page=${page - 1}${querySuffix}` : undefined
        }
        nextHref={
          page < totalPages
            ? `${base}?page=${page + 1}${querySuffix}`
            : undefined
        }
      />
    </div>
  );
}
