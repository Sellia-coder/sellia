import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import CustomerDetailClient from "./CustomerDetailClient";
import type { OrderItem } from "@/lib/order-status";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      shop: { select: { ownerId: true, currency: true, slug: true } },
    },
  });

  if (!customer || customer.shop.ownerId !== user.id) notFound();

  const orders = await db.order.findMany({
    where: {
      shopId: customer.shopId,
      customerPhone: customer.phone,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <CustomerDetailClient
      currency={customer.shop.currency || "FCFA"}
      customer={{
        id: customer.id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        city: customer.city,
        address: customer.address,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        averageOrder: customer.averageOrder,
        firstOrderAt: customer.firstOrderAt?.toISOString() || null,
        lastOrderAt: customer.lastOrderAt?.toISOString() || null,
        notes: customer.notes,
        tags: customer.tags || [],
      }}
      orders={orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.total,
        paymentStatus: o.paymentStatus,
        status: o.status,
        qrScannedAt: o.qrScannedAt?.toISOString() || null,
        paidAt: o.paidAt?.toISOString() || null,
        refundedAt: o.refundedAt?.toISOString() || null,
        items: o.items as unknown as OrderItem[],
        createdAt: o.createdAt.toISOString(),
      }))}
    />
  );
}
