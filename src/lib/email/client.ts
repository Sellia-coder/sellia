import { buildDeliveryQrUrl } from "@/lib/qr/qr-signature";
import {
  renderOrderConfirmationEmail,
  type OrderEmailData,
} from "@/lib/email/templates/order-confirmation";
import { safeLogger } from "@/lib/security/redact";

type OrderWithShop = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  subtotal: number;
  total: number;
  paymentMethod: string;
  paidAt: Date | null;
  refundDeadline: Date | null;
  items: unknown;
  shop: {
    name: string;
    slug: string;
    primaryColor: string | null;
    phone: string | null;
    whatsappNumber: string | null;
  };
};

function parseOrderItems(
  items: unknown
): Array<{ name: string; quantity: number; price: number }> {
  if (!Array.isArray(items)) return [];
  return items
    .map((row) => {
      const r = row as Record<string, unknown>;
      return {
        name: String(r.name ?? "Article"),
        quantity: Number(r.quantity ?? 1),
        price: Number(r.price ?? 0),
      };
    })
    .filter((i) => i.name);
}

export async function sendOrderConfirmationEmail(
  order: OrderWithShop
): Promise<{ sent: boolean; reason?: string }> {
  // G2.1.D V2 — Réutilise le wrapper existant (auth/OTP) pour cohérence vars d'env
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    safeLogger.warn("Resend not configured, skipping confirmation email");
    return { sent: false, reason: "email_not_configured" };
  }

  const to = order.customerEmail?.trim();
  if (!to) {
    return { sent: false, reason: "no_customer_email" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://getsellia.com";
  const qrUrl = buildDeliveryQrUrl({
    baseUrl,
    shopSlug: order.shop.slug,
    orderNumber: order.orderNumber,
  });
  const orderViewUrl = `${baseUrl}/shop/${order.shop.slug}/commande/${encodeURIComponent(order.orderNumber)}`;

  // G2.1.D V2 — URL absolue PNG (Gmail/Outlook téléchargent à l'affichage)
  const qrImageUrl = `${baseUrl}/api/shop/${order.shop.slug}/orders/${encodeURIComponent(order.orderNumber)}/qr?format=png`;

  const subTotal = order.subtotal;
  const feesAdded = Math.max(0, order.total - subTotal);

  const emailData: OrderEmailData = {
    customerName: order.customerName,
    customerEmail: to,
    orderNumber: order.orderNumber,
    shopName: order.shop.name,
    shopSlug: order.shop.slug,
    total: order.total,
    subTotal,
    feesAdded,
    currency: "XAF",
    paymentMethod: order.paymentMethod,
    paidAt: order.paidAt ?? new Date(),
    refundDeadline:
      order.refundDeadline ??
      new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    items: parseOrderItems(order.items),
    qrUrl,
    qrImageUrl,
    orderViewUrl,
    merchantPhone: order.shop.phone ?? order.shop.whatsappNumber,
    primaryColor: order.shop.primaryColor ?? undefined,
  };

  const { subject, html, text } = renderOrderConfirmationEmail(emailData);

  try {
    const { resend, EMAIL_FROM } = await import("./resend");
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    return { sent: true };
  } catch (err) {
    safeLogger.error("Resend send failed", {
      orderNumber: order.orderNumber,
      error: err instanceof Error ? err.message : String(err),
    });
    return { sent: false, reason: "resend_error" };
  }
}
