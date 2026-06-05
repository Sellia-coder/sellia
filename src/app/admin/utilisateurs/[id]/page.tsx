import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserDetail } from "@/lib/admin/user-detail";
import {
  formatAdminDate,
  formatAdminMoney,
  planLabel,
} from "@/lib/admin/constants";
import {
  roleBadge,
  shopPublishedBadge,
  userStatusBadge,
} from "@/lib/admin/status-badges";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { getCurrentUser } from "@/lib/auth/session";
import AdminUserDetailActions from "./AdminUserDetailActions";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const current = await getCurrentUser();
  const detail = await getAdminUserDetail(id);
  if (!detail) notFound();

  const { user, shop, stats } = detail;
  const appUrl = process.env.APP_URL || "https://getsellia.com";
  const publicShopUrl = shop
    ? `${appUrl.replace(/\/$/, "")}/shop/${shop.slug}`
    : null;

  const role = roleBadge(user.role);
  const status = userStatusBadge(user.isBlocked);
  const shopStatus = shop ? shopPublishedBadge(shop.isPublished) : null;

  return (
    <div>
      <div className="admin-back-bar">
        <Link href="/admin/utilisateurs" className="admin-btn admin-btn--sm">
          ← Utilisateurs
        </Link>
      </div>

      <h1 className="admin-page-title">{user.email}</h1>
      <p className="admin-page-sub">
        Fiche compte — lecture seule. Inscrit le {formatAdminDate(user.createdAt)}.
      </p>

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Compte</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Rôle</dt>
              <dd>
                <AdminStatusBadge label={role.label} variant={role.variant} />
              </dd>
            </div>
            <div className="admin-detail-row">
              <dt>Statut</dt>
              <dd>
                <AdminStatusBadge label={status.label} variant={status.variant} />
              </dd>
            </div>
            {user.blockedAt ? (
              <div className="admin-detail-row">
                <dt>Bloqué le</dt>
                <dd>{formatAdminDate(user.blockedAt)}</dd>
              </div>
            ) : null}
            <div className="admin-detail-row">
              <dt>Dernière connexion</dt>
              <dd>{formatAdminDate(user.lastLoginAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Boutique liée</h2>
          {shop ? (
            <dl>
              <div className="admin-detail-row">
                <dt>Slug</dt>
                <dd>
                  <Link href={`/admin/boutiques?q=${encodeURIComponent(shop.slug)}`}>
                    {shop.slug}
                  </Link>
                </dd>
              </div>
              <div className="admin-detail-row">
                <dt>Nom</dt>
                <dd>{shop.name}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Plan</dt>
                <dd>{planLabel(shop.plan)}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Publication</dt>
                <dd>
                  {shopStatus ? (
                    <AdminStatusBadge
                      label={shopStatus.label}
                      variant={shopStatus.variant}
                    />
                  ) : null}
                </dd>
              </div>
              <div className="admin-detail-row">
                <dt>Créée le</dt>
                <dd>{formatAdminDate(shop.createdAt)}</dd>
              </div>
            </dl>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "var(--admin-muted)" }}>
              Aucune boutique associée.
            </p>
          )}
        </div>

        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Statistiques boutique</h2>
          {shop ? (
            <dl>
              <div className="admin-detail-row">
                <dt>Commandes payées</dt>
                <dd>{stats.orderCount}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>GMV</dt>
                <dd>{formatAdminMoney(stats.gmv)}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Dernier paiement</dt>
                <dd>{formatAdminDate(stats.lastPaymentAt)}</dd>
              </div>
            </dl>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "var(--admin-muted)" }}>
              —
            </p>
          )}
        </div>
      </div>

      <AdminUserDetailActions
        userId={user.id}
        role={user.role}
        isBlocked={user.isBlocked}
        isSelf={current?.id === user.id}
        shopSlug={shop?.slug ?? null}
        publicShopUrl={publicShopUrl}
      />
    </div>
  );
}
