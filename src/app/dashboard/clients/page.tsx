import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import CustomersListClient from "./CustomersListClient";

export default async function CustomersListPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, currency: true },
  });

  if (!shop) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Aucune boutique trouvée</h2>
      </div>
    );
  }

  const customers = await db.customer.findMany({
    where: { shopId: shop.id },
    orderBy: { lastOrderAt: "desc" },
    take: 200,
  });

  const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
  const stats = {
    total: customers.length,
    newThisMonth: customers.filter((c) => {
      if (!c.firstOrderAt) return false;
      return new Date(c.firstOrderAt).getTime() > monthAgo;
    }).length,
    repeatCustomers: customers.filter((c) => c.totalOrders > 1).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
  };

  return (
    <CustomersListClient
      currency={shop.currency || "FCFA"}
      customers={customers.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        phone: c.phone,
        email: c.email,
        city: c.city,
        totalOrders: c.totalOrders,
        totalSpent: c.totalSpent,
        averageOrder: c.averageOrder,
        firstOrderAt: c.firstOrderAt?.toISOString() || null,
        lastOrderAt: c.lastOrderAt?.toISOString() || null,
        tags: c.tags || [],
      }))}
      stats={stats}
    />
  );
}
