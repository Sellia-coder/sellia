import { listAdminAuditLogs, AUDIT_ACTION_LABELS } from "@/lib/admin/audit-log";
import { formatAdminDate } from "@/lib/admin/constants";

export default async function AdminEntityHistory({
  targetType,
  targetId,
  limit = 15,
  title = "Historique admin",
}: {
  targetType: string;
  targetId: string;
  limit?: number;
  title?: string;
}) {
  const logs = await listAdminAuditLogs({
    targetType,
    targetId,
    limit,
  });

  if (logs.length === 0) {
    return (
      <div className="admin-detail-card" style={{ marginTop: 24 }}>
        <h2 className="admin-detail-card-title">{title}</h2>
        <p className="admin-empty-state">
          Aucune action admin enregistrée pour cette entité.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-detail-card" style={{ marginTop: 24 }}>
      <h2 className="admin-detail-card-title">{title}</h2>
    <div className="admin-table-wrap">
      <table className="admin-table admin-table--compact">
        <thead>
          <tr>
            <th>Date</th>
            <th>Admin</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((row) => (
            <tr key={row.id}>
              <td className="admin-date">{formatAdminDate(row.createdAt)}</td>
              <td style={{ fontSize: 12 }}>{row.adminEmail}</td>
              <td>{AUDIT_ACTION_LABELS[row.action] ?? row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
