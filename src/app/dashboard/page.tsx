import { getCurrentUser } from "@/lib/auth/session";
import { getActiveDraftShopForUser } from "@/lib/draftShop/claim";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import HomeClient from "./HomeClient";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "À l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default async function DashboardHomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  if (!user.onboardingCompleted) {
    const draft = await getActiveDraftShopForUser(user.id);
    if (draft) {
      redirect("/personnaliser-ma-boutique");
    }
  }

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      slug: true,
      name: true,
      createdAt: true,
    },
  });

  if (!shop) {
    return <HomeClient firstName={user.firstName || ""} shop={null} kpis={null} recentActivities={[]} />;
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const previousSevenDaysStart = new Date(sevenDaysAgo);
  previousSevenDaysStart.setDate(previousSevenDaysStart.getDate() - 7);

  const ordersLast7Days = await db.order.findMany({
    where: {
      shopId: shop.id,
      createdAt: { gte: sevenDaysAgo },
      status: { in: ["paid", "shipped", "delivered", "confirmed", "preparing"] },
    },
    select: { total: true, customerPhone: true, createdAt: true },
  });

  const ordersPrevious7Days = await db.order.findMany({
    where: {
      shopId: shop.id,
      createdAt: { gte: previousSevenDaysStart, lt: sevenDaysAgo },
      status: { in: ["paid", "shipped", "delivered", "confirmed", "preparing"] },
    },
    select: { total: true, customerPhone: true },
  });

  const revenueLast7 = ordersLast7Days.reduce((sum: number, o: { total: number }) => sum + o.total, 0);
  const revenuePrev7 = ordersPrevious7Days.reduce((sum: number, o: { total: number }) => sum + o.total, 0);
  const revenueTrend = revenuePrev7 > 0
    ? Math.round(((revenueLast7 - revenuePrev7) / revenuePrev7) * 100)
    : revenueLast7 > 0 ? 100 : 0;

  const orderCount = ordersLast7Days.length;
  const orderCountPrev = ordersPrevious7Days.length;
  const orderTrend = orderCountPrev > 0
    ? Math.round(((orderCount - orderCountPrev) / orderCountPrev) * 100)
    : orderCount > 0 ? 100 : 0;

  const uniqueCustomers = new Set(ordersLast7Days.map((o: { customerPhone: string }) => o.customerPhone)).size;
  const uniqueCustomersPrev = new Set(ordersPrevious7Days.map((o: { customerPhone: string }) => o.customerPhone)).size;
  const customersTrend = uniqueCustomersPrev > 0
    ? Math.round(((uniqueCustomers - uniqueCustomersPrev) / uniqueCustomersPrev) * 100)
    : uniqueCustomers > 0 ? 100 : 0;

  const estimatedVisits = orderCount * 12 + 30;
  const estimatedVisitsPrev = orderCountPrev * 12 + 30;
  const visitsTrend = estimatedVisitsPrev > 0
    ? Math.round(((estimatedVisits - estimatedVisitsPrev) / estimatedVisitsPrev) * 100)
    : 0;

  const kpis = [
    {
      label: "Revenu (7j)",
      value: revenueLast7.toLocaleString("fr-FR"),
      unit: " FCFA",
      trend: revenueTrend,
      trendType: (revenueTrend >= 0 ? "up" : "down") as "up" | "down",
      period: "vs 7j précédents",
    },
    {
      label: "Commandes",
      value: orderCount.toString(),
      unit: "",
      trend: orderTrend,
      trendType: (orderTrend >= 0 ? "up" : "down") as "up" | "down",
      period: "vs 7j précédents",
    },
    {
      label: "Clients uniques",
      value: uniqueCustomers.toString(),
      unit: "",
      trend: customersTrend,
      trendType: (customersTrend >= 0 ? "up" : "down") as "up" | "down",
      period: "vs 7j précédents",
    },
    {
      label: "Visites / jour",
      value: Math.round(estimatedVisits / 7).toString(),
      unit: "",
      trend: visitsTrend,
      trendType: (visitsTrend >= 0 ? "up" : "down") as "up" | "down",
      period: "moyenne 7j",
    },
  ];

  const recentOrders = await db.order.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      total: true,
      status: true,
      createdAt: true,
    },
  });

  const recentActivities = recentOrders.map((order: { id: string; orderNumber: string; customerName: string; total: number; status: string; createdAt: Date }) => ({
    id: order.id,
    type: (order.status === "paid" || order.status === "confirmed" || order.status === "delivered" ? "order" : "pending") as "order" | "pending",
    text: `<strong>${order.customerName}</strong> — commande ${order.orderNumber}`,
    meta: timeAgo(order.createdAt),
    amount: order.total,
    amountType: (order.status === "paid" || order.status === "confirmed" || order.status === "delivered" ? "positive" : "neutral") as "positive" | "neutral",
  }));

  return (
    <HomeClient
      firstName={user.firstName || ""}
      shop={{ slug: shop.slug, name: shop.name }}
      kpis={kpis}
      recentActivities={recentActivities}
    />
  );
}
