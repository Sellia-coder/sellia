import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import OrdersListClient from "./OrdersListClient";
import type { OrderItem } from "@/lib/order-status";

export default async function OrdersListPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, slug: true, currency: true },
  });

  if (!shop) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Aucune boutique trouvée</h2>
      </div>
    );
  }

  const orders = await db.order.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const stats = {
    total: orders.length,
    awaitingPayment: orders.filter(
      (o) =>
        o.paymentStatus === "pending" ||
        o.paymentStatus === "awaiting_confirmation"
    ).length,
    inDelivery: orders.filter(
      (o) =>
        (o.paymentStatus === "paid_escrow" || o.paymentStatus === "paid_offline") &&
        !o.qrScannedAt &&
        o.status !== "cancelled"
    ).length,
    delivered: orders.filter(
      (o) =>
        !!o.qrScannedAt ||
        o.paymentStatus === "delivered" ||
        o.paymentStatus === "paid_released" ||
        o.status === "delivered"
    ).length,
    refunded: orders.filter(
      (o) => !!o.refundedAt || o.paymentStatus === "refunded"
    ).length,
    totalRevenue: orders
      .filter(
        (o) =>
          !!o.qrScannedAt ||
          o.paymentStatus === "delivered" ||
          o.paymentStatus === "paid_released" ||
          o.status === "delivered"
      )
      .reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <OrdersListClient
      shopSlug={shop.slug}
      currency={shop.currency || "FCFA"}
      orders={orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerEmail: o.customerEmail,
        customerCity: o.customerCity,
        total: o.total,
        subtotal: o.subtotal,
        shippingPrice: o.shippingPrice,
        paymentStatus: o.paymentStatus,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentSubMethod: o.paymentSubMethod,
        qrCode: o.qrCode,
        qrScannedAt: o.qrScannedAt?.toISOString() || null,
        paidAt: o.paidAt?.toISOString() || null,
        refundedAt: o.refundedAt?.toISOString() || null,
        refundDeadline: o.refundDeadline?.toISOString() || null,
        items: o.items as unknown as OrderItem[],
        createdAt: o.createdAt.toISOString(),
      }))}
      stats={stats}
    />
  );
}
