import Link from "next/link";
import { db } from "@/lib/db";
import { formatAdminDate } from "@/lib/admin/constants";
import { disputeStatusBadge } from "@/lib/admin/status-badges";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminShopLink from "@/components/admin/AdminShopLink";
import AdminPagination from "@/components/admin/AdminPagination";
import LitigesFilters from "./LitigesFilters";
import { disputeReasonLabel } from "@/lib/disputes/constants";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminLitigesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    shop?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const {
    q = "",
    status = "",
    shop = "",
    from = "",
    to = "",
    page: pageStr = "1",
  } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const query = q.trim();
  const shopSlug = shop.trim();

  const where: Prisma.DisputeWhereInput = {};

  if (status === "open") {
    where.status = "OPEN";
  } else if (status === "in_review") {
    where.status = "IN_REVIEW";
  } else if (status === "resolved") {
    where.status = {
      in: ["RESOLVED_CUSTOMER", "RESOLVED_MERCHANT", "CLOSED"],
    };
  }

  if (shopSlug) {
    where.shop = { slug: { contains: shopSlug, mode: "insensitive" } };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(`${from}T00:00:00.000Z`);
    if (to) where.createdAt.lte = new Date(`${to}T23:59:59.999Z`);
  }

  if (query) {
    where.OR = [
      { customerEmail: { contains: query, mode: "insensitive" } },
      { order: { orderNumber: { contains: query, mode: "insensitive" } } },
      { shop: { name: { contains: query, mode: "insensitive" } } },
      { shop: { slug: { contains: query, mode: "insensitive" } } },
    ];
  }

  const [total, openCount, inReviewCount, resolvedCount, disputes] =
    await Promise.all([
      db.dispute.count({ where }),
      db.dispute.count({ where: { status: "OPEN" } }),
      db.dispute.count({ where: { status: "IN_REVIEW" } }),
      db.dispute.count({
        where: {
          status: { in: ["RESOLVED_CUSTOMER", "RESOLVED_MERCHANT", "CLOSED"] },
        },
      }),
      db.dispute.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          order: { select: { orderNumber: true, total: true } },
          shop: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (query) qs.set("q", query);
  if (shopSlug) qs.set("shop", shopSlug);
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const filterSuffix = qs.toString();
  const querySuffix = filterSuffix ? `&${filterSuffix}` : "";
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const base = "/admin/litiges";

  return (
    <div>
      <h1 className="admin-page-title">Litiges</h1>
      <p className="admin-page-sub">
        Litiges clients sur les paiements — trancher enregistre une décision et un
        statut, sans remboursement automatique.
      </p>

      <LitigesFilters
        activeStatus={status}
        counts={{
          total: openCount + inReviewCount + resolvedCount,
          open: openCount,
          in_review: inReviewCount,
          resolved: resolvedCount,
        }}
        q={query}
        shop={shopSlug}
        from={from}
        to={to}
      />

      <div className="admin-card admin-card--premium" style={{ marginTop: 20 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Boutique</th>
                <th>Client</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {disputes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Aucun litige
                  </td>
                </tr>
              ) : (
                disputes.map((d) => {
                  const badge = disputeStatusBadge(d.status);
                  return (
                    <tr key={d.id}>
                      <td>
                        <Link href={`/admin/litiges/${d.id}`}>
                          #{d.order.orderNumber}
                        </Link>
                      </td>
                      <td>
                        <AdminShopLink
                          shopId={d.shop.id}
                          name={d.shop.name}
                          slug={d.shop.slug}
                        />
                      </td>
                      <td>{d.customerEmail}</td>
                      <td>{disputeReasonLabel(d.reason)}</td>
                      <td>
                        <AdminStatusBadge
                          label={badge.label}
                          variant={badge.variant}
                        />
                      </td>
                      <td className="admin-date">
                        {formatAdminDate(d.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 ? (
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
      ) : null}
    </div>
  );
}
