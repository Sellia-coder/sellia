import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import OrderConfirmationClient from "./OrderConfirmationClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; orderNumber: string }>;
}

function parseItems(items: unknown): Array<{
  name: string;
  quantity: number;
  price: number;
}> {
  if (!Array.isArray(items)) return [];
  return items.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      name: String(r.name ?? "Article"),
      quantity: Number(r.quantity ?? 1),
      price: Number(r.price ?? 0),
    };
  });
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { slug, orderNumber } = await params;
  const decoded = decodeURIComponent(orderNumber);

  const order = await db.order.findFirst({
    where: {
      orderNumber: decoded,
      shop: { slug },
    },
    include: {
      shop: {
        select: {
          slug: true,
          name: true,
          primaryColor: true,
          phone: true,
          whatsappNumber: true,
        },
      },
    },
  });

  if (!order) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getsellia.com";
  const qrBase = `${baseUrl}/api/shop/${slug}/orders/${encodeURIComponent(decoded)}/qr`;

  const feesAdded = Math.max(0, order.total - order.subtotal);

  return (
    <OrderConfirmationClient
      order={{
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        subtotal: order.subtotal,
        total: order.total,
        feesAdded,
        shippingPrice: order.shippingPrice,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paidAt: order.paidAt?.toISOString() ?? null,
        refundDeadline: order.refundDeadline?.toISOString() ?? null,
        items: parseItems(order.items),
        shop: order.shop,
        qrApiUrl: `${qrBase}?format=dataurl`,
        qrDownloadPngUrl: `${qrBase}?format=png`,
        qrDownloadSvgUrl: `${qrBase}?format=svg`,
      }}
    />
  );
}
