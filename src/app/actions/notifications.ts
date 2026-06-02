"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export interface SelliaNotification {
  id: string;
  type: "order" | "delivery" | "payout" | "stock";
  title: string;
  message: string;
  href: string;
  createdAt: string;
}

export async function getNotificationsAction(): Promise<{
  ok: boolean;
  notifications: SelliaNotification[];
}> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, notifications: [] };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return { ok: true, notifications: [] };

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const notifications: SelliaNotification[] = [];

    // 1. Commandes payées récentes
    const recentOrders = await db.order.findMany({
      where: {
        shopId: shop.id,
        paymentStatus: { in: ["paid_escrow", "paid_released", "delivered"] },
        paidAt: { gte: sevenDaysAgo },
      },
      orderBy: { paidAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        paidAt: true,
      },
    });
    for (const o of recentOrders) {
      notifications.push({
        id: `order-${o.id}`,
        type: "order",
        title: "Nouvelle vente",
        message: `Commande ${o.orderNumber} de ${o.customerName} — ${o.total.toLocaleString("fr-FR")} FCFA`,
        href: `/dashboard/commandes/${o.orderNumber}`,
        createdAt: (o.paidAt ?? new Date()).toISOString(),
      });
    }

    // 2. Commandes physiques à livrer (escrow non confirmé)
    const toDeliver = await db.order.count({
      where: {
        shopId: shop.id,
        paymentStatus: "paid_escrow",
        deliveredAt: null,
      },
    });
    if (toDeliver > 0) {
      notifications.push({
        id: "to-deliver",
        type: "delivery",
        title: "Livraisons en attente",
        message: `${toDeliver} commande(s) à livrer et confirmer`,
        href: "/dashboard/commandes",
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Fonds disponibles à retirer
    const availablePayouts = await db.payout.count({
      where: { shopId: shop.id, status: "AVAILABLE" },
    });
    if (availablePayouts > 0) {
      notifications.push({
        id: "payout-available",
        type: "payout",
        title: "Fonds disponibles",
        message: "Vous avez des fonds disponibles au retrait",
        href: "/dashboard/paiements",
        createdAt: new Date().toISOString(),
      });
    }

    notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { ok: true, notifications: notifications.slice(0, 15) };
  } catch {
    return { ok: false, notifications: [] };
  }
}
