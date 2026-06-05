import Link from "next/link";
import { db } from "@/lib/db";
import { gmvByShopIds } from "@/lib/admin/metrics";
import {
  formatAdminDate,
  formatAdminMoney,
  planLabel,
} from "@/lib/admin/constants";
import { shopPublishedBadge } from "@/lib/admin/status-badges";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminShopRowActions from "@/components/admin/AdminShopRowActions";
import AdminExportButton from "@/components/admin/AdminExportButton";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminBoutiquesSearch from "./AdminBoutiquesSearch";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminBoutiquesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string; plan?: string }>;
}) {
  const { q = "", page: pageStr = "1", sort = "date", plan = "" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const query = q.trim().toLowerCase();

  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { slug: { contains: query, mode: "insensitive" as const } },
      { name: { contains: query, mode: "insensitive" as const } },
      { owner: { email: { contains: query, mode: "insensitive" as const } } },
    ];
  }
  if (plan && ["free", "pro", "business"].includes(plan)) {
    where.plan = plan;
  }

  const [total, shops] = await Promise.all([
    db.shop.count({ where }),
    db.shop.findMany({
      where,
      orderBy: sort === "gmv" ? { createdAt: "desc" } : { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        name: true,
        plan: true,
        isPublished: true,
        status: true,
        createdAt: true,
        owner: { select: { email: true } },
      },
    }),
  ]);

  const gmvMap = await gmvByShopIds(shops.map((s) => s.id));

  let rows = shops.map((s) => ({
    ...s,
    gmv: gmvMap[s.id] ?? 0,
  }));

  if (sort === "gmv") {
    rows = [...rows].sort((a, b) => b.gmv - a.gmv);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const appUrl = process.env.APP_URL || "https://getsellia.com";
  const base = `/admin/boutiques`;
  const qParam = q ? `&q=${encodeURIComponent(q)}` : "";

  return (
    <div>
      <h1 className="admin-page-title">Boutiques</h1>
      <p className="admin-page-sub">
        {total} boutique{total !== 1 ? "s" : ""} — suspendre une boutique la retire
        de la vente publique.
      </p>

      <div className="admin-retraits-toolbar">
        <AdminBoutiquesSearch initialQ={q} sort={sort} plan={plan} />
        <AdminExportButton resource="boutiques" />
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Slug / Nom</th>
                <th>Propriétaire</th>
                <th>Plan</th>
                <th>Statut</th>
                <th className="admin-th-right">GMV</th>
                <th>Créée</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    Aucune boutique trouvée
                  </td>
                </tr>
              ) : (
                rows.map((s) => {
                  const pub = shopPublishedBadge(s.isPublished);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          <Link href={`/admin/boutiques/${s.id}`}>{s.slug}</Link>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--admin-muted)" }}>
                          {s.name}
                        </div>
                      </td>
                      <td>{s.owner.email}</td>
                      <td>{planLabel(s.plan)}</td>
                      <td>
                        <AdminStatusBadge label={pub.label} variant={pub.variant} />
                      </td>
                      <td className="admin-td-right">{formatAdminMoney(s.gmv)}</td>
                      <td className="admin-date">{formatAdminDate(s.createdAt)}</td>
                      <td>
                        <AdminShopRowActions
                          shopId={s.id}
                          isPublished={s.isPublished}
                          publicUrl={`${appUrl.replace(/\/$/, "")}/shop/${s.slug}`}
                          ownerEmail={s.owner.email}
                          plan={s.plan}
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

      <AdminPagination
        page={page}
        totalPages={totalPages}
        prevHref={
          page > 1 ? `${base}?page=${page - 1}${qParam}&sort=${sort}` : undefined
        }
        nextHref={
          page < totalPages
            ? `${base}?page=${page + 1}${qParam}&sort=${sort}`
            : undefined
        }
      />
    </div>
  );
}
