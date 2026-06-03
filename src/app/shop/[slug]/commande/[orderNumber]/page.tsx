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

  // Téléchargements digitaux : uniquement si le paiement est confirmé.
  const paymentConfirmed = [
    "paid_escrow",
    "paid_released",
    "delivered",
  ].includes(order.paymentStatus);

  const allItems = Array.isArray(order.items)
    ? (order.items as Array<{ productId?: string; type?: string }>)
    : [];
  const isPurelyDigital =
    allItems.length > 0 &&
    allItems.every((i) => (i.type || "physical") === "digital");

  // url peut être null si le marchand n'a pas (encore) renseigné digitalFileUrl :
  // on affiche quand même le produit côté client avec un état "bientôt".
  let digitalDownloads: { name: string; url: string | null }[] = [];
  if (paymentConfirmed) {
    const digitalItemProductIds = allItems
      .filter((i) => (i.type || "physical") === "digital")
      .map((i) => i.productId)
      .filter((id): id is string => Boolean(id));

    if (digitalItemProductIds.length > 0) {
      const products = await db.product.findMany({
        where: { id: { in: digitalItemProductIds } },
        select: { id: true, name: true, digitalFileUrl: true },
      });
      digitalDownloads = products.map((p) => ({
        name: p.name,
        url: p.digitalFileUrl || null,
      }));
    }
  }

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
        operatorFee: order.operatorFee ?? 0,
        currency,
        paidAt: order.paidAt?.toISOString() ?? null,
        refundDeadline: order.refundDeadline?.toISOString() ?? null,
        items: parseItems(order.items),
        qrPngUrl: `${qrBase}?format=png`,
        deliveryCode: order.deliveryCode,
        deliveredAt: order.deliveredAt?.toISOString() ?? null,
        digitalDownloads,
        isPurelyDigital,
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
