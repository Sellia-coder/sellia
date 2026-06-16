import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatAdminDate } from "@/lib/admin/constants";
import AdminReviewRowActions from "@/components/admin/AdminReviewRowActions";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminAvisShopPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shop = await db.shop.findUnique({
    where: { id: shopId },
    select: { id: true, name: true, slug: true },
  });
  if (!shop) notFound();

  const reviews = await db.review.findMany({
    where: { shopId },
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } } },
  });

  return (
    <div>
      <div className="admin-back-bar">
        <Link href="/admin/avis" className="admin-btn admin-btn--sm">
          ← Avis
        </Link>
      </div>
      <h1 className="admin-page-title">Avis — {shop.name}</h1>
      <p className="admin-page-sub">{reviews.length} avis au total</p>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Client</th>
                <th>Note</th>
                <th>Commentaire</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    Aucun avis
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  const hidden = r.status === "hidden";
                  return (
                    <tr key={r.id}>
                      <td>{r.product?.name ?? "—"}</td>
                      <td>{r.authorName}</td>
                      <td>{r.rating}★</td>
                      <td style={{ maxWidth: 240 }}>
                        {r.title ? <strong>{r.title} — </strong> : null}
                        {r.content.slice(0, 120)}
                        {r.content.length > 120 ? "…" : ""}
                      </td>
                      <td>
                        <AdminStatusBadge
                          label={
                            hidden
                              ? "Masqué"
                              : r.status === "approved"
                                ? "Visible"
                                : r.status
                          }
                          variant={hidden ? "off" : "ok"}
                        />
                      </td>
                      <td className="admin-date">
                        {formatAdminDate(r.createdAt)}
                      </td>
                      <td>
                        <AdminReviewRowActions
                          reviewId={r.id}
                          shopId={shopId}
                          isHidden={hidden}
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
    </div>
  );
}
