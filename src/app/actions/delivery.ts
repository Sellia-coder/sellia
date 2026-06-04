"use server";

import { revalidatePath } from "next/cache";
import { PayoutType } from "@prisma/client";
import { db } from "@/lib/db";
import { releasePayout } from "@/lib/payouts";
import { sendDeliveryReleasedMerchantEmail } from "@/lib/email/transactional";
import { verifyOrderDeliverySignature } from "@/lib/qr/qr-signature";

export async function confirmDeliveryAction(input: {
  orderNumber: string;
  shopSlug: string;
  signature: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    // 1. Vérifier la signature QR (anti-forge)
    if (
      !verifyOrderDeliverySignature({
        orderNumber: input.orderNumber,
        shopSlug: input.shopSlug,
        signature: input.signature,
      })
    ) {
      return { ok: false, error: "Lien de validation invalide ou expiré" };
    }

    // 2. Charger la commande
    const order = await db.order.findFirst({
      where: { orderNumber: input.orderNumber, shop: { slug: input.shopSlug } },
      select: {
        id: true,
        paymentStatus: true,
        status: true,
        deliveryCode: true,
        deliveredAt: true,
        deliveryConfirmedAt: true,
      },
    });
    if (!order) return { ok: false, error: "Commande introuvable" };

    // 3. Déjà livré ?
    if (
      order.deliveredAt ||
      order.deliveryConfirmedAt ||
      order.status === "delivered"
    ) {
      return { ok: false, error: "Cette commande a déjà été confirmée" };
    }

    // 4. Doit être payée en escrow
    if (order.paymentStatus !== "paid_escrow") {
      return {
        ok: false,
        error: "Le paiement n'est pas confirmé pour cette commande",
      };
    }

    // 5. Vérifier le code 6 chiffres
    const submitted = input.code.replace(/\s/g, "");
    if (!order.deliveryCode || submitted !== order.deliveryCode) {
      return { ok: false, error: "Code de confirmation incorrect" };
    }

    // 6. Marquer livré (transaction). On ne libère QUE le payout PHYSIQUE :
    // la part digital/service a déjà été libérée instantanément au paiement.
    const physicalPayout = await db.payout.findUnique({
      where: {
        orderId_payoutType: {
          orderId: order.id,
          payoutType: PayoutType.ORDER_PHYSICAL,
        },
      },
      select: { id: true },
    });

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "delivered",
          paymentStatus: "delivered",
          deliveredAt: new Date(),
          deliveryConfirmedAt: new Date(),
          qrScannedAt: new Date(),
        },
      });
    });

    // 7. Libérer UNIQUEMENT le payout physique escrow → AVAILABLE (idempotent :
    // releasePayout ne touche que les payouts en PENDING_ESCROW).
    if (physicalPayout) {
      await releasePayout(physicalPayout.id);
      // Email best-effort au marchand : fonds libérés (ne bloque jamais).
      sendDeliveryReleasedMerchantEmail(order.id).catch((e) =>
        console.error("[email delivery-released]", e)
      );
    }

    revalidatePath(`/shop/${input.shopSlug}/livraison/${input.orderNumber}`);
    revalidatePath("/dashboard/paiements");
    revalidatePath("/dashboard/commandes");

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur serveur",
    };
  }
}
