import { db } from "@/lib/db";
import { formatAdminDate } from "@/lib/admin/constants";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminShopLink from "@/components/admin/AdminShopLink";
import AdminPagination from "@/components/admin/AdminPagination";
import FeedbackFilters from "./FeedbackFilters";
import FeedbackRowActions from "./FeedbackRowActions";
import {
  FEEDBACK_STATUS_LABELS,
  feedbackTypeLabel,
} from "@/lib/feedback/constants";
import type { MerchantFeedbackStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const {
    q = "",
    type = "",
    status = "",
    from = "",
    to = "",
    page: pageStr = "1",
  } = await searchParams;

  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const query = q.trim();

  const where: Prisma.MerchantFeedbackWhereInput = {};

  if (type) where.type = type as any;
  if (status) where.status = status as MerchantFeedbackStatus;

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(`${from}T00:00:00.000Z`);
    if (to) where.createdAt.lte = new Date(`${to}T23:59:59.999Z`);
  }

  if (query) {
    where.OR = [
      { message: { contains: query, mode: "insensitive" } },
      { user: { email: { contains: query, mode: "insensitive" } } },
      { user: { firstName: { contains: query, mode: "insensitive" } } },
      { user: { lastName: { contains: query, mode: "insensitive" } } },
      {
        shop: { name: { contains: query, mode: "insensitive" } },
      },
      {
        shop: { slug: { contains: query, mode: "insensitive" } },
      },
    ];
  }

  const [total, feedbacks] = await Promise.all([
    db.merchantFeedback.count({ where }),
    db.merchantFeedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        shop: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = new URLSearchParams();
  if (query) qs.set("q", query);
  if (type) qs.set("type", type);
  if (status) qs.set("status", status);
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const qsStr = qs.toString();

  const base = "/admin/feedback";

  const statusBadgeVariant = (s: string): "ok" | "warn" | "info" | "off" | "danger" => {
    if (s === "NEW") return "warn";
    if (s === "READ") return "info";
    if (s === "HANDLED") return "ok";
    return "off";
  };

  return (
    <div>
      <h1 className="admin-page-title">Feedback</h1>
      <p className="admin-page-sub">
        Suggestions, remarques et bugs envoyés par les marchands. Les actions admin
        mettent à jour le statut sans aucun mouvement d&apos;argent.
      </p>

      <FeedbackFilters
        initialQ={query}
        initialType={type}
        initialStatus={status}
        initialFrom={from}
        initialTo={to}
      />

      <div className="admin-card admin-card--premium" style={{ marginTop: 20 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Marchand</th>
                <th>Boutique</th>
                <th>Type</th>
                <th>Message</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    Aucun feedback
                  </td>
                </tr>
              ) : (
                feedbacks.map((f) => {
                  const statusLabel =
                    FEEDBACK_STATUS_LABELS[f.status as MerchantFeedbackStatus] ??
                    f.status;
                  const variant = statusBadgeVariant(f.status);
                  const shopNode = f.shop;
                  return (
                    <tr key={f.id}>
                      <td>
                        <span className="admin-mono">
                          {[f.user.firstName, f.user.lastName].filter(Boolean).join(" ") ||
                            f.user.email}
                        </span>
                        <div className="admin-muted" style={{ fontSize: 12 }}>
                          {f.user.email}
                        </div>
                      </td>
                      <td>
                        {shopNode ? (
                          <AdminShopLink
                            shopId={shopNode.id}
                            name={shopNode.name}
                            slug={shopNode.slug}
                            className="admin-link"
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{feedbackTypeLabel(f.type)}</td>
                      <td>
                        <span style={{ display: "block", maxWidth: 420 }}>
                          {f.message.length > 140
                            ? `${f.message.slice(0, 140)}…`
                            : f.message}
                        </span>
                      </td>
                      <td>
                        <AdminStatusBadge label={statusLabel} variant={variant} />
                      </td>
                      <td className="admin-date">{formatAdminDate(f.createdAt)}</td>
                      <td>
                        <FeedbackRowActions
                          feedbackId={f.id}
                          status={f.status as MerchantFeedbackStatus}
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

      {total > PAGE_SIZE ? (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          prevHref={
            page > 1
              ? `${base}?page=${page - 1}${qsStr ? `&${qsStr}` : ""}`
              : undefined
          }
          nextHref={
            page < totalPages
              ? `${base}?page=${page + 1}${qsStr ? `&${qsStr}` : ""}`
              : undefined
          }
        />
      ) : null}
    </div>
  );
}

