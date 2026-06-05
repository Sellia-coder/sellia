import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { formatAdminDate } from "@/lib/admin/constants";
import AdminUserActions from "@/components/admin/AdminUserActions";
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

  return (
    <div>
      <h1 className="admin-page-title">Utilisateurs</h1>
      <p className="admin-page-sub">
        {total} compte{total !== 1 ? "s" : ""}. Verrouillage compte : le rate-limit
        auth (G10.B) est en mémoire — pas de champ <code>lockedUntil</code> en BDD ;
        le déblocage expire automatiquement (aucune action DB requise).
      </p>

      <AdminUsersSearch initialQ={q} />

      <div className="admin-card">
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
                return (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`admin-badge ${u.role === "admin" ? "admin-badge--warn" : "admin-badge--ok"}`}
                      >
                        {u.role ?? "user"}
                      </span>
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
                    <td>{formatAdminDate(u.createdAt)}</td>
                    <td>
                      <span className="admin-badge admin-badge--ok">Actif</span>
                    </td>
                    <td>
                      <AdminUserActions
                        userId={u.id}
                        role={u.role}
                        isSelf={current?.id === u.id}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-toolbar" style={{ marginTop: 16 }}>
          {page > 1 && (
            <Link
              href={`/admin/utilisateurs?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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
              href={`/admin/utilisateurs?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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
