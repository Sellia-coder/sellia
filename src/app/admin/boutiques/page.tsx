import Link from "next/link";
import { db } from "@/lib/db";
import { gmvByShopIds } from "@/lib/admin/metrics";
import {
  formatAdminDate,
  formatAdminMoney,
  planLabel,
} from "@/lib/admin/constants";
import AdminShopActions from "@/components/admin/AdminShopActions";
import AdminBoutiquesSearch from "./AdminBoutiquesSearch";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminBoutiquesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const { q = "", page: pageStr = "1", sort = "date" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const query = q.trim().toLowerCase();

  const where = query
    ? {
        OR: [
          { slug: { contains: query, mode: "insensitive" as const } },
          { name: { contains: query, mode: "insensitive" as const } },
          { owner: { email: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [total, shops] = await Promise.all([
    db.shop.count({ where }),
    db.shop.findMany({
      where,
      orderBy:
        sort === "gmv"
          ? { createdAt: "desc" }
          : { createdAt: "desc" },
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

  return (
    <div>
      <h1 className="admin-page-title">Boutiques</h1>
      <p className="admin-page-sub">
        {total} boutique{total !== 1 ? "s" : ""} — suspension via dépublication (
        <code>isPublished</code> + statut MAINTENANCE). Pas de champ{" "}
        <code>isSuspended</code> dédié (migration possible plus tard).
      </p>

      <AdminBoutiquesSearch initialQ={q} sort={sort} />

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Slug / Nom</th>
              <th>Propriétaire</th>
              <th>Plan</th>
              <th>Publiée</th>
              <th>GMV</th>
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
              rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.slug}</div>
                    <div style={{ fontSize: 12, color: "var(--admin-muted)" }}>
                      {s.name}
                    </div>
                  </td>
                  <td>{s.owner.email}</td>
                  <td>{planLabel(s.plan)}</td>
                  <td>
                    <span
                      className={`admin-badge ${s.isPublished ? "admin-badge--ok" : "admin-badge--off"}`}
                    >
                      {s.isPublished ? "Oui" : "Non"}
                    </span>
                  </td>
                  <td>{formatAdminMoney(s.gmv)}</td>
                  <td>{formatAdminDate(s.createdAt)}</td>
                  <td>
                    <AdminShopActions
                      shopId={s.id}
                      isPublished={s.isPublished}
                      publicUrl={`${appUrl.replace(/\/$/, "")}/shop/${s.slug}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-toolbar" style={{ marginTop: 16 }}>
          {page > 1 && (
            <Link
              href={`/admin/boutiques?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}&sort=${sort}`}
              className="admin-btn"
            >
              ← Précédent
            </Link>
          )}
          <span style={{ fontSize: 13, color: "var(--admin-muted)" }}>
            Page {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/boutiques?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}&sort=${sort}`}
              className="admin-btn"
            >
              Suivant →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
