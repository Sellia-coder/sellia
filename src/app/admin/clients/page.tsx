import Link from "next/link";
import { db } from "@/lib/db";
import { formatAdminDate, formatAdminMoney } from "@/lib/admin/constants";
import AdminClientRowActions from "@/components/admin/AdminClientRowActions";
import AdminExportButton from "@/components/admin/AdminExportButton";
import ClientsFilters from "./ClientsFilters";
import AdminKpiGrid from "@/components/admin/AdminKpiGrid";
import { getClientsPageKpis } from "@/lib/admin/page-stats";
import AdminShopLink from "@/components/admin/AdminShopLink";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string; q?: string; sort?: string }>;
}) {
  const { shop: shopId = "", q = "", sort = "spent" } = await searchParams;
  const query = q.trim().toLowerCase();
  const kpis = await getClientsPageKpis();

  const shops = await db.shop.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  const where: Record<string, unknown> = {};
  if (shopId) where.shopId = shopId;
  if (query) {
    where.OR = [
      { fullName: { contains: query, mode: "insensitive" } },
      { phone: { contains: query } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }

  let customers = await db.customer.findMany({
    where,
    include: { shop: { select: { name: true, slug: true } } },
    take: 200,
  });

  if (sort === "spent") {
    customers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);
  } else if (sort === "orders") {
    customers = [...customers].sort((a, b) => b.totalOrders - a.totalOrders);
  } else if (sort === "recent") {
    customers = [...customers].sort(
      (a, b) =>
        (b.lastOrderAt?.getTime() ?? 0) - (a.lastOrderAt?.getTime() ?? 0)
    );
  }

  return (
    <div>
      <h1 className="admin-page-title">Clients</h1>
      <p className="admin-page-sub">
        Données sensibles — lecture et contact uniquement (requireAdmin).
      </p>

      <AdminKpiGrid items={kpis} />

      <div className="admin-retraits-toolbar">
        <ClientsFilters
          shops={shops}
          initialShop={shopId}
          initialQ={q}
          sort={sort}
        />
        <AdminExportButton
          resource="clients"
          label="Exporter CSV"
        />
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Boutique</th>
                <th className="admin-th-right">Commandes</th>
                <th className="admin-th-right">Total dépensé</th>
                <th>Dernière commande</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    Aucun client
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.fullName}</td>
                    <td className="admin-mono">{c.phone}</td>
                    <td>{c.email ?? "—"}</td>
                    <td>
                      <AdminShopLink
                        shopId={c.shopId}
                        name={c.shop.name}
                        slug={c.shop.slug}
                      />
                    </td>
                    <td className="admin-td-right">{c.totalOrders}</td>
                    <td className="admin-td-right">
                      {formatAdminMoney(c.totalSpent)}
                    </td>
                    <td className="admin-date">
                      {c.lastOrderAt ? formatAdminDate(c.lastOrderAt) : "—"}
                    </td>
                    <td>
                      <AdminClientRowActions
                        customerId={c.id}
                        email={c.email}
                        phone={c.phone}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
