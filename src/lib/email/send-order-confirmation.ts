import { db } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email/client";
import {
  sendNewSaleMerchantEmail,
  sendDigitalDownloadEmail,
} from "@/lib/email/transactional";
import { safeLogger } from "@/lib/security/redact";

/**
 * Envoi idempotent des emails de confirmation de paiement (via notifiedAt).
 * Chokepoint unique appelé par tous les chemins de confirmation (webhook,
 * balance-delta, reconcile). Déclenche, une seule fois par commande :
 *   - confirmation ACHETEUR (existant)
 *   - nouvelle vente MARCHAND (G9.B)
 *   - lien de téléchargement digital ACHETEUR (G9.B, si produits digitaux)
 * Tous les envois additionnels sont best-effort (ne bloquent jamais).
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

    // Emails additionnels (best-effort, mêmes garde-fous d'idempotence via notifiedAt).
    await sendNewSaleMerchantEmail(orderId).catch((e) =>
      safeLogger.error("[email new-sale]", { orderId, error: String(e) })
    );
    await sendDigitalDownloadEmail(orderId).catch((e) =>
      safeLogger.error("[email digital-download]", { orderId, error: String(e) })
    );

    // Marque "notifié" si l'email acheteur est parti OU s'il ne pourra jamais
    // partir (pas d'email client) → évite tout doublon des 3 emails.
    if (result.sent || result.reason === "no_customer_email") {
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
