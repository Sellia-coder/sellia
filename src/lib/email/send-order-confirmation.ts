import { db } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email/client";
import { safeLogger } from "@/lib/security/redact";

/**
 * Envoi idempotent de l'email de confirmation (via notifiedAt).
 */
export async function trySendOrderConfirmationEmail(
  orderId: string
): Promise<void> {
  try {
    const fullOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        shop: {
          select: {
            name: true,
            slug: true,
            primaryColor: true,
            phone: true,
            whatsappNumber: true,
          },
        },
      },
    });

    if (!fullOrder || fullOrder.notifiedAt) return;

    const result = await sendOrderConfirmationEmail(fullOrder);
    if (result.sent) {
      await db.order.update({
        where: { id: fullOrder.id },
        data: { notifiedAt: new Date() },
      });
    }
  } catch (err) {
    safeLogger.error("Failed to send confirmation email", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
