import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatAdminDate } from "@/lib/admin/constants";
import {
  TICKET_STATUS_LABELS,
  TICKET_CATEGORY_LABELS,
} from "@/lib/admin/labels";
import AdminSupportDetailClient from "./AdminSupportDetailClient";
import AdminShopLink from "@/components/admin/AdminShopLink";

export const dynamic = "force-dynamic";

export default async function AdminSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await db.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!ticket) notFound();

  const merchantName =
    [ticket.user.firstName, ticket.user.lastName].filter(Boolean).join(" ") ||
    ticket.user.email;

  return (
    <div>
      <div className="admin-back-bar">
        <Link href="/admin/support" className="admin-btn admin-btn--sm">
          ← Support
        </Link>
      </div>

      <h1 className="admin-page-title">{ticket.subject}</h1>
      <p className="admin-page-sub">
        {merchantName} · {TICKET_CATEGORY_LABELS[ticket.category]} ·{" "}
        {TICKET_STATUS_LABELS[ticket.status]} · {formatAdminDate(ticket.createdAt)}
      </p>

      {ticket.shopId ? (
        <p className="admin-page-sub" style={{ marginTop: -16 }}>
          Boutique :{" "}
          <AdminShopLink
            shopId={ticket.shopId}
            name={ticket.shopName ?? ticket.shopSlug ?? "Boutique"}
            slug={ticket.shopSlug ?? undefined}
            className="admin-link"
          />
        </p>
      ) : ticket.shopSlug ? (
        <p className="admin-page-sub" style={{ marginTop: -16 }}>
          Boutique : {ticket.shopName ?? ticket.shopSlug}
        </p>
      ) : null}

      <section className="admin-section">
        <h2 className="admin-section-title">Messages</h2>
        <div className="admin-report-list">
          {ticket.messages.map((m) => (
            <article key={m.id} className="admin-report-item">
              <div className="admin-report-item-header">
                <strong className="admin-report-item-title">
                  {m.senderName}{" "}
                  <span style={{ fontWeight: 500, color: "var(--admin-muted)" }}>
                    ({m.senderType === "SUPPORT" ? "Support" : m.senderType === "MERCHANT" ? "Marchand" : "Système"})
                  </span>
                </strong>
                <span className="admin-date">{formatAdminDate(m.createdAt)}</span>
              </div>
              <p className="admin-report-meta" style={{ color: "var(--admin-ink)", whiteSpace: "pre-wrap" }}>
                {m.content}
              </p>
            </article>
          ))}
        </div>
      </section>

      <AdminSupportDetailClient
        ticketId={ticket.id}
        isClosed={ticket.status === "CLOSED"}
      />
    </div>
  );
}
