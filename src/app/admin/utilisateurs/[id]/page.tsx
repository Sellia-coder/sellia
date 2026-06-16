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
import AdminShopLink from "@/components/admin/AdminShopLink";
import AdminEntityHistory from "@/components/admin/AdminEntityHistory";
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

  const { user, shop, shops, stats } = detail;
  const appUrl = process.env.APP_URL || "https://getsellia.com";
  const publicShopUrl = shop
    ? `${appUrl.replace(/\/$/, "")}/shop/${shop.slug}`
    : null;

  const role = roleBadge(user.role);
  const status = userStatusBadge(user.isBlocked);
  const shopStatus = shop ? shopPublishedBadge(shop.isPublished) : null;
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <div>
      <div className="admin-back-bar">
        <Link href="/admin/utilisateurs" className="admin-btn admin-btn--sm">
          ← Utilisateurs
        </Link>
      </div>

      <header className="admin-page-header-premium">
        <h1 className="admin-page-title">{displayName}</h1>
        <p className="admin-page-sub admin-mono">{user.email}</p>
      </header>

      <div className="admin-status-chips" style={{ marginBottom: 20 }}>
        <AdminStatusBadge label={role.label} variant={role.variant} />
        <AdminStatusBadge label={status.label} variant={status.variant} />
        {shopStatus ? (
          <AdminStatusBadge
            label={shopStatus.label}
            variant={shopStatus.variant}
          />
        ) : null}
      </div>

      <AdminUserDetailActions
        userId={user.id}
        role={user.role}
        isBlocked={user.isBlocked}
        isSelf={current?.id === user.id}
        shopId={shop?.id ?? null}
        shopSlug={shop?.slug ?? null}
        publicShopUrl={publicShopUrl}
      />

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Compte</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Inscrit le</dt>
              <dd>{formatAdminDate(user.createdAt)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Dernière connexion</dt>
              <dd>{formatAdminDate(user.lastLoginAt)}</dd>
            </div>
            {user.blockedAt ? (
              <div className="admin-detail-row">
                <dt>Bloqué le</dt>
                <dd>{formatAdminDate(user.blockedAt)}</dd>
              </div>
            ) : null}
            {user.phone ? (
              <div className="admin-detail-row">
                <dt>Téléphone</dt>
                <dd>{user.phone}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Boutique(s)</h2>
          {shops.length === 0 ? (
            <p className="admin-muted-text">Aucune boutique.</p>
          ) : (
            <ul className="admin-link-list">
              {shops.map((s) => (
                <li key={s.id}>
                  <AdminShopLink shopId={s.id} name={s.name} slug={s.slug} />
                  <span className="admin-muted-text">
                    {planLabel(s.plan)} · {formatAdminDate(s.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {shop ? (
          <div className="admin-detail-card">
            <h2 className="admin-detail-card-title">Vue 360° boutique</h2>
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
                <dt>Clients</dt>
                <dd>{stats.customerCount}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Retraits en cours</dt>
                <dd>{stats.withdrawalPending}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Signalements</dt>
                <dd>{stats.reportCount}</dd>
              </div>
              <div className="admin-detail-row">
                <dt>Tickets support</dt>
                <dd>{stats.ticketCount}</dd>
              </div>
              {stats.balances ? (
                <>
                  <div className="admin-detail-row">
                    <dt>Solde disponible</dt>
                    <dd>{formatAdminMoney(stats.balances.available)}</dd>
                  </div>
                  <div className="admin-detail-row">
                    <dt>En séquestre</dt>
                    <dd>{formatAdminMoney(stats.balances.pendingEscrow)}</dd>
                  </div>
                </>
              ) : null}
            </dl>
            <p className="admin-method-note" style={{ marginTop: 12 }}>
              Soldes en lecture seule — aucune édition possible.
            </p>
          </div>
        ) : null}
      </div>

      <section className="admin-section">
        <h2 className="admin-section-title">Historique admin</h2>
        <div className="admin-card">
          <AdminEntityHistory targetType="user" targetId={user.id} />
        </div>
      </section>
    </div>
  );
}

