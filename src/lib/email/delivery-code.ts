import { db } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/email/resend";
import { safeLogger } from "@/lib/security/redact";

/**
 * Envoie au client le code de confirmation de livraison (6 chiffres).
 * Réservé aux commandes physiques en escrow. Best-effort.
 */
export async function sendDeliveryCodeEmail(orderId: string): Promise<void> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        customerEmail: true,
        customerName: true,
        deliveryCode: true,
        total: true,
        shop: { select: { name: true } },
      },
    });

    if (!order || !order.customerEmail || !order.deliveryCode) return;

    await resend.emails.send({
      from: EMAIL_FROM,
      to: order.customerEmail,
      subject: `Votre code de confirmation de livraison — ${order.shop.name}`,
      html: `
      <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="background: #FAFAF7; border-radius: 14px; padding: 28px; text-align: center;">
          <h2 style="margin: 0 0 8px; color: #0E1116; font-size: 20px;">Votre commande est en route</h2>
          <p style="color: #4B5563; font-size: 14px; margin: 0 0 20px;">
            Commande ${order.orderNumber} chez ${order.shop.name}
          </p>
          <div style="background: white; border: 2px dashed #E84B1F; border-radius: 12px; padding: 20px; margin: 0 0 16px;">
            <div style="font-size: 11px; color: #8B8E94; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Code de confirmation</div>
            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #E84B1F;">${order.deliveryCode}</div>
          </div>
          <p style="color: #6B7280; font-size: 12.5px; line-height: 1.5; margin: 0;">
            À la réception de votre colis, communiquez ce code au livreur (ou
            saisissez-le sur la page de validation) pour confirmer la réception.
            <strong>Ne le partagez pas avant d'avoir reçu votre commande.</strong>
          </p>
        </div>
      </div>
    `,
    });
  } catch (err) {
    safeLogger.error("Failed to send delivery code email", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
