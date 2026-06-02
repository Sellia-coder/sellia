import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import OrderDetailClient from "./OrderDetailClient";
import type { OrderItem } from "@/lib/order-status";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      shop: {
        select: { id: true, slug: true, ownerId: true, currency: true },
      },
    },
  });

  if (!order || order.shop.ownerId !== user.id) notFound();

  return (
    <OrderDetailClient
      orderNumber={order.orderNumber}
      currency={order.shop.currency || "FCFA"}
      order={{
        id: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        customerCity: order.customerCity,
        customerAddress: order.customerAddress,
        customerNotes: order.customerNotes,
        subtotal: order.subtotal,
        shippingPrice: order.shippingPrice,
        shippingZone: order.shippingZone,
        shippingEta: order.shippingEta,
        total: order.total,
        operatorFee: order.operatorFee ?? 0,
        paymentMethod: order.paymentMethod,
        paymentSubMethod: order.paymentSubMethod,
        paymentProvider: order.paymentProvider,
        paymentStatus: order.paymentStatus,
        status: order.status,
        qrCode: order.qrCode,
        qrScannedAt: order.qrScannedAt?.toISOString() || null,
        paidAt: order.paidAt?.toISOString() || null,
        refundedAt: order.refundedAt?.toISOString() || null,
        refundDeadline: order.refundDeadline?.toISOString() || null,
        whatsappContacted: order.whatsappContacted,
        items: order.items as unknown as OrderItem[],
        createdAt: order.createdAt.toISOString(),
      }}
    />
  );
}
