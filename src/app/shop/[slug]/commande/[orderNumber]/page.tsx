import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import OrderConfirmationClient from "./OrderConfirmationClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; orderNumber: string }>;
}

function parseItems(items: unknown): Array<{
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}> {
  if (!Array.isArray(items)) return [];
  return items.map((row, index) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.productId ?? r.id ?? index),
      productId: String(r.productId ?? r.id ?? index),
      productName: String(r.name ?? "Article"),
      quantity: Number(r.quantity ?? 1),
      unitPrice: Number(r.price ?? 0),
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
        },
      },
      cartevoTransaction: {
        select: {
          operator: true,
          country: true,
          currency: true,
        },
      },
    },
  });

  if (!order) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getsellia.com";
  const qrBase = `${baseUrl}/api/shop/${slug}/orders/${encodeURIComponent(decoded)}/qr`;

  const feesAdded = Math.max(0, order.total - order.subtotal);
  const currency =
    order.cartevoTransaction?.currency === "XAF" ||
    !order.cartevoTransaction?.currency
      ? "FCFA"
      : order.cartevoTransaction.currency;

  const isMoMoOnline =
    order.paymentMethod === "online_mobile_money" ||
    order.paymentMethod === "online_escrow";
  const showPaymentPolling =
    isMoMoOnline &&
    (order.paymentStatus === "awaiting_confirmation" ||
      order.paymentStatus === "pending");

  return (
    <OrderConfirmationClient
      order={{
        shopSlug: order.shop.slug,
        shopName: order.shop.name,
        shopPrimaryColor: order.shop.primaryColor,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        customerEmail: order.customerEmail,
        total: order.total,
        subTotal: order.subtotal,
        shipping: order.shippingPrice,
        feesAdded,
        currency,
        paidAt: order.paidAt?.toISOString() ?? null,
        refundDeadline: order.refundDeadline?.toISOString() ?? null,
        items: parseItems(order.items),
        qrPngUrl: `${qrBase}?format=png`,
        deliveryCode: order.deliveryCode,
        deliveredAt: order.deliveredAt?.toISOString() ?? null,
      }}
      paymentPolling={
        showPaymentPolling
          ? {
              operatorCode:
                order.cartevoTransaction?.operator ??
                order.paymentSubMethod ??
                "mtn",
              countryCode: order.cartevoTransaction?.country ?? "CM",
              total: order.total,
              currency,
            }
          : null
      }
    />
  );
}
