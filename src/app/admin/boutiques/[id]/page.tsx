import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  formatAdminDate,
  formatAdminMoney,
  planLabel,
} from "@/lib/admin/constants";
import { shopPublishedBadge } from "@/lib/admin/status-badges";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminShopRowActions from "@/components/admin/AdminShopRowActions";
import { getAdminShopStats } from "@/lib/admin/shop-stats";

export const dynamic = "force-dynamic";

export default async function AdminBoutiqueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = await db.shop.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      name: true,
      plan: true,
      isPublished: true,
      status: true,
      createdAt: true,
      owner: { select: { email: true, firstName: true, lastName: true } },
    },
  });
  if (!shop) notFound();

  const stats = await getAdminShopStats(shop.id);
  const appUrl = process.env.APP_URL || "https://getsellia.com";
  const publicUrl = `${appUrl.replace(/\/$/, "")}/shop/${shop.slug}`;
  const pub = shopPublishedBadge(shop.isPublished);
  const ownerName =
    [shop.owner.firstName, shop.owner.lastName].filter(Boolean).join(" ") ||
    shop.owner.email;

  return (
    <div>
      <div className="admin-back-bar">
        <Link href="/admin/boutiques" className="admin-btn admin-btn--sm">
          ← Boutiques
        </Link>
      </div>

      <h1 className="admin-page-title">{shop.name}</h1>
      <p className="admin-page-sub">
        {shop.slug} · {ownerName} · {planLabel(shop.plan)}
      </p>

      <div className="admin-detail-actions-bar">
        <AdminShopRowActions
          shopId={shop.id}
          isPublished={shop.isPublished}
          publicUrl={publicUrl}
          ownerEmail={shop.owner.email}
          plan={shop.plan}
        />
      </div>

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Informations</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>Slug</dt>
              <dd className="admin-mono">{shop.slug}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Propriétaire</dt>
              <dd>{shop.owner.email}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Plan</dt>
              <dd>{planLabel(shop.plan)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Statut</dt>
              <dd>
                <AdminStatusBadge label={pub.label} variant={pub.variant} />
              </dd>
            </div>
            <div className="admin-detail-row">
              <dt>Créée le</dt>
              <dd>{formatAdminDate(shop.createdAt)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Boutique publique</dt>
              <dd>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  Ouvrir
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Statistiques</h2>
          <dl>
            <div className="admin-detail-row">
              <dt>GMV</dt>
              <dd>{formatAdminMoney(stats.gmv)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Commandes payées</dt>
              <dd>{stats.orderCount}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Produits</dt>
              <dd>{stats.productCount}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Retraits</dt>
              <dd>{stats.withdrawalCount}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Solde disponible</dt>
              <dd>{formatAdminMoney(stats.balances.available)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>En séquestre</dt>
              <dd>{formatAdminMoney(stats.balances.pendingEscrow)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>En cours</dt>
              <dd>{formatAdminMoney(stats.balances.inProgress)}</dd>
            </div>
            <div className="admin-detail-row">
              <dt>Déjà versé</dt>
              <dd>{formatAdminMoney(stats.balances.paidTotal)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
