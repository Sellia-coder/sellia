"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
} from "@/lib/cartevo/order-status";
import { createPayoutFromOrder } from "@/lib/payouts";
import { getOrderTypeKind, type OrderItem } from "@/lib/order-status";
import { PayoutType } from "@prisma/client";

export async function markOrderAsDeliveredAction(input: {
  orderNumber: string;
  qrCode: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const order = await db.order.findUnique({
      where: { orderNumber: input.orderNumber },
      include: {
        shop: { select: { id: true, slug: true, ownerId: true } },
      },
    });

    if (!order) return { ok: false, error: "Commande introuvable" };
    if (order.shop.ownerId !== user.id) {
      return { ok: false, error: "Accès refusé" };
    }

    if (!order.qrCode) {
      return { ok: false, error: "Aucun QR code associé à cette commande" };
    }
    if (
      order.qrCode.trim().toUpperCase() !== input.qrCode.trim().toUpperCase()
    ) {
      return { ok: false, error: "Code QR invalide" };
    }

    if (order.qrScannedAt) {
      return {
        ok: false,
        error: "Cette commande a déjà été marquée comme livrée",
      };
    }

    if (order.paymentStatus !== PAYMENT_STATUS.PAID_ESCROW) {
      return { ok: false, error: "La commande n'est pas en escrow" };
    }

    await db.order.update({
      where: { id: order.id },
      data: {
        qrScannedAt: new Date(),
        paymentStatus: "delivered",
        status: ORDER_STATUS.DELIVERED,
        deliveredAt: new Date(),
      },
    });

    const items = order.items as unknown as OrderItem[];
    const kind = getOrderTypeKind(items);
    if (kind === "physical" || kind === "mixed") {
      await createPayoutFromOrder({
        orderId: order.id,
        payoutType: PayoutType.ORDER_PHYSICAL,
        releaseImmediately: true,
      });
    }

    revalidatePath("/dashboard/commandes");
    revalidatePath(`/dashboard/commandes/${input.orderNumber}`);
    revalidatePath("/dashboard/paiements");
    if (order.shop.slug) {
      revalidatePath(`/shop/${order.shop.slug}`);
    }

    return { ok: true };
  } catch (err: unknown) {
    console.error("[markOrderAsDeliveredAction]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
