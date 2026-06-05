import Link from "next/link";
import { db } from "@/lib/db";
import { formatAdminDate } from "@/lib/admin/constants";
import { TICKET_STATUS_LABELS, TICKET_CATEGORY_LABELS } from "@/lib/admin/labels";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import type { AdminBadgeVariant } from "@/lib/admin/status-badges";

export const dynamic = "force-dynamic";

function ticketBadge(status: string): { label: string; variant: AdminBadgeVariant } {
  const label = TICKET_STATUS_LABELS[status as keyof typeof TICKET_STATUS_LABELS] ?? status;
  if (status === "OPEN" || status === "WAITING_SUPPORT") return { label, variant: "warn" };
  if (status === "RESOLVED") return { label, variant: "ok" };
  if (status === "CLOSED") return { label, variant: "off" };
  return { label, variant: "info" };
}

export default async function AdminSupportPage() {
  const tickets = await db.supportTicket.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  });

  return (
    <div>
      <h1 className="admin-page-title">Support</h1>
      <p className="admin-page-sub">
        {tickets.length} demande{tickets.length !== 1 ? "s" : ""} de support marchands.
      </p>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sujet</th>
                <th>Marchand</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Dernière activité</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Aucun ticket
                  </td>
                </tr>
              ) : (
                tickets.map((t) => {
                  const badge = ticketBadge(t.status);
                  const merchantName =
                    [t.user.firstName, t.user.lastName].filter(Boolean).join(" ") ||
                    t.user.email;
                  return (
                    <tr key={t.id}>
                      <td>
                        <Link href={`/admin/support/${t.id}`}>{t.subject}</Link>
                      </td>
                      <td>{merchantName}</td>
                      <td>{TICKET_CATEGORY_LABELS[t.category] ?? t.category}</td>
                      <td>
                        <AdminStatusBadge label={badge.label} variant={badge.variant} />
                      </td>
                      <td className="admin-date">{formatAdminDate(t.lastMessageAt)}</td>
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
