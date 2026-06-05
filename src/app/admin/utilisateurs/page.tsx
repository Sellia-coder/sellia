import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { formatAdminDate } from "@/lib/admin/constants";
import { roleBadge, userStatusBadge } from "@/lib/admin/status-badges";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminUserRowActions from "@/components/admin/AdminUserRowActions";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminUsersSearch from "./AdminUsersSearch";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminUtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const current = await getCurrentUser();
  const { q = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const query = q.trim().toLowerCase();
  const appUrl = process.env.APP_URL || "https://getsellia.com";

  const where = query
    ? { email: { contains: query, mode: "insensitive" as const } }
    : {};

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        shops: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { slug: true, name: true },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = `/admin/utilisateurs`;
  const qParam = q ? `&q=${encodeURIComponent(q)}` : "";

  return (
    <div>
      <h1 className="admin-page-title">Utilisateurs</h1>
      <p className="admin-page-sub">
        {total} compte{total !== 1 ? "s" : ""} — gestion des marchands (lecture,
        boutique publique, blocage). La promotion admin se fait en SQL, pas via
        l&apos;interface.
      </p>

      <AdminUsersSearch initialQ={q} />

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rôle</th>
                <th>Boutique</th>
                <th>Créé le</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Aucun utilisateur
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const shop = u.shops[0];
                  const role = roleBadge(u.role);
                  const status = userStatusBadge(u.isBlocked);
                  const publicShopUrl = shop
                    ? `${appUrl.replace(/\/$/, "")}/shop/${shop.slug}`
                    : null;

                  return (
                    <tr key={u.id}>
                      <td>
                        <Link href={`/admin/utilisateurs/${u.id}`}>{u.email}</Link>
                      </td>
                      <td>
                        <AdminStatusBadge label={role.label} variant={role.variant} />
                      </td>
                      <td>
                        {shop ? (
                          <Link href={`/admin/boutiques?q=${encodeURIComponent(shop.slug)}`}>
                            {shop.slug}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="admin-date">{formatAdminDate(u.createdAt)}</td>
                      <td>
                        <AdminStatusBadge label={status.label} variant={status.variant} />
                      </td>
                      <td>
                        <AdminUserRowActions
                          userId={u.id}
                          role={u.role}
                          isBlocked={u.isBlocked}
                          isSelf={current?.id === u.id}
                          publicShopUrl={publicShopUrl}
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
          page > 1 ? `${base}?page=${page - 1}${qParam}` : undefined
        }
        nextHref={
          page < totalPages ? `${base}?page=${page + 1}${qParam}` : undefined
        }
      />
    </div>
  );
}
