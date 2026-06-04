import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/admin";
import { getActiveDraftShopForUser } from "@/lib/draftShop/claim";
import {
  getShopKpis,
  getTopProducts,
  getTopCustomers,
  getRecentActivity,
  getRevenueTimeSeries,
} from "@/lib/analytics";
import { getShopBalances } from "@/lib/payouts";
import DashboardHomeClient from "./DashboardHomeClient";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  // 1) Boutique d'abord — évite de renvoyer vers l'onboarding alors qu'une Shop
  //    existe déjà (ownerId valide via FK Prisma).
  const shopCount = await db.shop.count({ where: { ownerId: user.id } });

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    orderBy: [{ isPublished: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      currency: true,
      isPublished: true,
      status: true,
    },
  });

  if (shopCount > 0 && !shop) {
    console.error(
      "[dashboard] Incohérence boutique/propriétaire : count>0 mais findFirst null",
      { userId: user.id, email: user.email, shopCount }
    );
  }

  if (shop) {
    if (!user.onboardingCompleted) {
      console.warn(
        "[dashboard] Boutique trouvée mais onboardingCompleted=false — réparation du flag",
        { userId: user.id, shopId: shop.id, shopSlug: shop.slug }
      );
      await db.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true },
      });
    }
  } else {
    if (isAdminRole(user.role)) {
      redirect("/admin");
    }
    if (!user.onboardingCompleted) {
      const draft = await getActiveDraftShopForUser(user.id);
      if (draft) redirect("/personnaliser-ma-boutique");
    }
    redirect("/personnaliser-ma-boutique");
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email.split("@")[0];

  const [
    kpis,
    topProducts,
    topCustomers,
    recentActivity,
    revenueSeries,
    balances,
    pendingPaymentCount,
    toDeliverCount,
  ] = await Promise.all([
    getShopKpis(shop.id, "30d"),
    getTopProducts(shop.id, "30d", 5),
    getTopCustomers(shop.id, 5),
    getRecentActivity(shop.id, 6),
    getRevenueTimeSeries(shop.id, "30d"),
    getShopBalances(shop.id),
    db.order.count({
      where: { shopId: shop.id, paymentStatus: "pending" },
    }),
    db.order.count({
      where: {
        shopId: shop.id,
        paymentStatus: "paid_escrow",
        qrScannedAt: null,
      },
    }),
  ]);

  return (
    <DashboardHomeClient
      user={{ name: displayName }}
      shop={{
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        logoUrl: shop.logoUrl,
        currency: shop.currency || "XAF",
      }}
      kpis={kpis}
      topProducts={topProducts.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        revenue: p.revenue,
        imageUrl: p.imageUrl ?? null,
        emoji: p.emoji ?? null,
      }))}
      topCustomers={topCustomers.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        phone: c.phone,
        city: c.city ?? null,
        totalOrders: c.totalOrders,
        totalSpent: c.totalSpent,
      }))}
      recentActivity={recentActivity.map(
        (e: (typeof recentActivity)[number]) => ({
          ...e,
          timestamp: e.timestamp.toISOString(),
        })
      )}
      revenueSeries={revenueSeries}
      balances={balances}
      actionItems={{
        pendingPaymentCount,
        toDeliverCount,
      }}
    />
  );
}
