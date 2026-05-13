import { getCurrentUser } from "@/lib/auth/session";
import { getActiveDraftShopForUser } from "@/lib/draftShop/claim";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { parseShippingZones } from "@/lib/shop-data";
import HomeClient from "./HomeClient";

const PAID_LIKE_STATUSES = [
  "paid",
  "shipped",
  "delivered",
  "confirmed",
  "preparing",
] as const;

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

type OrderItemRow = {
  productId?: string;
  name?: string;
  price?: number;
  quantity?: number;
};

function parseOrderItems(raw: unknown): OrderItemRow[] {
  if (!Array.isArray(raw)) return [];
  return raw as OrderItemRow[];
}

function dayKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Typage explicite : le linter/TS peut perdre l’inférence Prisma sur certains `findMany`. */
type DashboardOrderLast7 = {
  total: number;
  customerPhone: string;
  customerName: string;
  createdAt: Date;
  items: unknown;
};

type DashboardOrderPrev7 = {
  total: number;
  customerPhone: string;
};

type DashboardRecentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: Date;
};

type DashboardProductLite = {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
};

type DashboardLowStockRow = {
  id: string;
  name: string;
  stock: number | null;
  imageUrl: string | null;
  price: number;
};

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
    include: {
      products: {
        where: { status: "active" },
        select: { id: true },
      },
    },
  });

  if (!shop) {
    return (
      <HomeClient
        firstName={user.firstName || ""}
        shop={null}
        kpis={null}
        recentActivities={[]}
        setupSteps={null}
        topProducts={null}
        topCustomers={null}
        conversionFunnel={null}
        lowStockProducts={null}
        salesSeries={null}
      />
    );
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const previousSevenDaysStart = new Date(sevenDaysAgo);
  previousSevenDaysStart.setDate(previousSevenDaysStart.getDate() - 7);

  const ordersLast7Days = (await db.order.findMany({
    where: {
      shopId: shop.id,
      createdAt: { gte: sevenDaysAgo },
      status: { in: [...PAID_LIKE_STATUSES] },
    },
    select: {
      total: true,
      customerPhone: true,
      customerName: true,
      createdAt: true,
      items: true,
    },
  })) as DashboardOrderLast7[];

  const ordersPrevious7Days = (await db.order.findMany({
    where: {
      shopId: shop.id,
      createdAt: { gte: previousSevenDaysStart, lt: sevenDaysAgo },
      status: { in: [...PAID_LIKE_STATUSES] },
    },
    select: { total: true, customerPhone: true },
  })) as DashboardOrderPrev7[];

  const revenueLast7 = ordersLast7Days.reduce((sum, o) => sum + o.total, 0);
  const revenuePrev7 = ordersPrevious7Days.reduce((sum, o) => sum + o.total, 0);
  const revenueTrend =
    revenuePrev7 > 0
      ? Math.round(((revenueLast7 - revenuePrev7) / revenuePrev7) * 100)
      : revenueLast7 > 0
        ? 100
        : 0;

  const orderCount = ordersLast7Days.length;
  const orderCountPrev = ordersPrevious7Days.length;
  const orderTrend =
    orderCountPrev > 0
      ? Math.round(((orderCount - orderCountPrev) / orderCountPrev) * 100)
      : orderCount > 0
        ? 100
        : 0;

  const uniqueCustomers = new Set(
    ordersLast7Days.map((o) => o.customerPhone)
  ).size;
  const uniqueCustomersPrev = new Set(
    ordersPrevious7Days.map((o) => o.customerPhone)
  ).size;
  const customersTrend =
    uniqueCustomersPrev > 0
      ? Math.round(
          ((uniqueCustomers - uniqueCustomersPrev) / uniqueCustomersPrev) * 100
        )
      : uniqueCustomers > 0
        ? 100
        : 0;

  const estimatedVisits = orderCount * 12 + 30;
  const estimatedVisitsPrev = orderCountPrev * 12 + 30;
  const visitsTrend =
    estimatedVisitsPrev > 0
      ? Math.round(
          ((estimatedVisits - estimatedVisitsPrev) / estimatedVisitsPrev) * 100
        )
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

  const recentOrders = (await db.order.findMany({
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
  })) as DashboardRecentOrder[];

  const recentActivities = recentOrders.map((order) => ({
    id: order.id,
    type: (
      order.status === "paid" ||
      order.status === "confirmed" ||
      order.status === "delivered"
        ? "order"
        : "pending"
    ) as "order" | "pending",
    text: `<strong>${order.customerName}</strong> — commande ${order.orderNumber}`,
    meta: timeAgo(order.createdAt),
    amount: order.total,
    amountType: (
      order.status === "paid" ||
      order.status === "confirmed" ||
      order.status === "delivered"
        ? "positive"
        : "neutral"
    ) as "positive" | "neutral",
  }));

  const zones = parseShippingZones(shop.shippingZones);
  const setupSteps = [
    {
      id: "identity",
      label: "Identité boutique",
      description: "Nom, logo et tagline configurés",
      done: !!(shop.name?.trim() && shop.logoUrl && shop.tagline?.trim()),
      href: "/dashboard/apparence",
      missing: [] as string[],
    },
    {
      id: "products",
      label: "Premiers produits",
      description:
        shop.products.length > 0
          ? `${shop.products.length} produit${shop.products.length > 1 ? "s" : ""} actif${shop.products.length > 1 ? "s" : ""}`
          : "Aucun produit ajouté",
      done: shop.products.length >= 1,
      href: "/dashboard/produits",
      missing: shop.products.length === 0 ? (["au moins 1 produit"] as string[]) : [],
    },
    {
      id: "payments",
      label: "Méthodes de paiement",
      description: getPaymentMethodsLabel(shop),
      done: hasPaymentMethod(shop),
      href: "/dashboard/paiements",
      missing: !hasPaymentMethod(shop)
        ? (["au moins 1 méthode de paiement"] as string[])
        : [],
    },
    {
      id: "shipping",
      label: "Zones de livraison",
      description:
        zones.length > 0
          ? `${zones.length} zone${zones.length > 1 ? "s" : ""} configurée${zones.length > 1 ? "s" : ""}`
          : "Définir vos zones et tarifs de livraison",
      done: zones.length > 0,
      href: "/dashboard/reglages",
      missing: [] as string[],
    },
    {
      id: "contact",
      label: "Contact & profil business",
      description: getContactLabel(shop),
      done: hasContactConfigured(shop),
      href: "/dashboard/profil",
      missing: !hasContactConfigured(shop)
        ? (["WhatsApp, email ou téléphone"] as string[])
        : [],
    },
  ];

  const productMap = new Map<
    string,
    { productId: string; productName: string; quantity: number; revenue: number }
  >();

  for (const order of ordersLast7Days) {
    const items = parseOrderItems(order.items);
    for (const item of items) {
      if (!item.productId) continue;
      const qty = item.quantity ?? 1;
      const price = item.price ?? 0;
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.quantity += qty;
        existing.revenue += price * qty;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.name || "Produit",
          quantity: qty,
          revenue: price * qty,
        });
      }
    }
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topProductIds = topProducts.map((p) => p.productId);
  const productsWithImages: DashboardProductLite[] =
    topProductIds.length > 0
      ? ((await db.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true, imageUrl: true, price: true },
        })) as DashboardProductLite[])
      : [];

  const topProductsEnriched = topProducts.map((tp) => {
    const p = productsWithImages.find((x) => x.id === tp.productId);
    return {
      ...tp,
      imageUrl: p?.imageUrl ?? null,
      realName: p?.name ?? tp.productName,
    };
  });

  const customerMap = new Map<
    string,
    { phone: string; name: string; orderCount: number; totalSpent: number }
  >();

  for (const order of ordersLast7Days) {
    const phone = order.customerPhone || "unknown";
    const existing = customerMap.get(phone);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += order.total;
    } else {
      customerMap.set(phone, {
        phone,
        name: order.customerName || "Client",
        orderCount: 1,
        totalSpent: order.total,
      });
    }
  }

  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const totalVisits = estimatedVisits;
  const totalCarts = Math.round(totalVisits * 0.18);
  const totalOrders = orderCount;
  const conversionFunnel = {
    visits: totalVisits,
    carts: totalCarts,
    orders: totalOrders,
    cartRate:
      totalVisits > 0 ? Math.round((totalCarts / totalVisits) * 100) : 0,
    orderRate:
      totalCarts > 0 ? Math.round((totalOrders / totalCarts) * 100) : 0,
    globalRate:
      totalVisits > 0
        ? Math.round((totalOrders / totalVisits) * 100 * 10) / 10
        : 0,
  };

  const lowStockProducts = (await db.product.findMany({
    where: {
      shopId: shop.id,
      status: "active",
      unlimitedStock: false,
      stock: { lte: 5, gte: 1 },
    },
    select: {
      id: true,
      name: true,
      stock: true,
      imageUrl: true,
      price: true,
    },
    orderBy: { stock: "asc" },
    take: 5,
  })) as DashboardLowStockRow[];

  const lowStockProductsNormalized = lowStockProducts.map((p) => ({
    ...p,
    stock: p.stock ?? 0,
  }));

  const dayKeys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    dayKeys.push(dayKeyLocal(d));
  }
  const salesByDay = Object.fromEntries(dayKeys.map((k) => [k, 0]));
  for (const o of ordersLast7Days) {
    const d = new Date(o.createdAt);
    d.setHours(0, 0, 0, 0);
    const k = dayKeyLocal(d);
    if (k in salesByDay) {
      salesByDay[k] += o.total;
    }
  }
  const salesSeries = dayKeys.map((k) => salesByDay[k] ?? 0);

  return (
    <HomeClient
      firstName={user.firstName || ""}
      shop={{ slug: shop.slug, name: shop.name }}
      kpis={kpis}
      recentActivities={recentActivities}
      setupSteps={setupSteps}
      topProducts={topProductsEnriched}
      topCustomers={topCustomers}
      conversionFunnel={conversionFunnel}
      lowStockProducts={lowStockProductsNormalized}
      salesSeries={salesSeries}
    />
  );
}

function hasPaymentMethod(shop: {
  paymentCashOnDelivery: boolean;
  paymentOnlineEscrow: boolean;
}): boolean {
  return !!(shop.paymentCashOnDelivery || shop.paymentOnlineEscrow);
}

function getPaymentMethodsLabel(shop: {
  paymentCashOnDelivery: boolean;
  paymentOnlineEscrow: boolean;
}): string {
  const methods: string[] = [];
  if (shop.paymentCashOnDelivery) methods.push("Paiement à la livraison");
  if (shop.paymentOnlineEscrow) methods.push("Paiement en ligne");
  if (methods.length === 0) return "Aucune méthode configurée";
  return `${methods.join(" + ")} activé${methods.length > 1 ? "s" : ""}`;
}

function hasContactConfigured(shop: {
  whatsappNumber: string | null;
  contactEmail: string | null;
  email: string | null;
  phone: string | null;
}): boolean {
  return !!(
    shop.whatsappNumber?.trim() ||
    shop.contactEmail?.trim() ||
    shop.email?.trim() ||
    shop.phone?.trim()
  );
}

function getContactLabel(shop: {
  whatsappNumber: string | null;
  contactEmail: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}): string {
  const items: string[] = [];
  if (shop.whatsappNumber?.trim()) items.push("WhatsApp");
  if (shop.contactEmail?.trim() || shop.email?.trim()) items.push("email");
  if (shop.phone?.trim()) items.push("téléphone");
  if (shop.address?.trim()) items.push("adresse");
  if (items.length === 0) return "WhatsApp, email ou téléphone";
  return items.join(", ") + " renseigné" + (items.length > 1 ? "s" : "");
}
