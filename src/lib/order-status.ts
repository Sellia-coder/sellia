/**
 * G2.2.B — Statuts affichés marchand selon type produit + état BDD
 */

export type OrderItemType = "physical" | "digital" | "service";

export interface OrderItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  type?: OrderItemType | string;
  imageUrl?: string | null;
  emoji?: string | null;
}

export type DisplayStatus =
  | "awaiting_payment"
  | "payment_failed"
  | "paid_pending_delivery"
  | "in_delivery"
  | "delivered"
  | "downloadable"
  | "completed"
  | "cancelled"
  | "refunded";

export interface OrderForStatus {
  paymentStatus: string;
  status: string;
  qrScannedAt: Date | null;
  paidAt: Date | null;
  refundedAt: Date | null;
  items: OrderItem[];
}

export function getOrderTypeKind(
  items: OrderItem[]
): "physical" | "digital" | "service" | "mixed" {
  const types = new Set(
    items.map((i) => {
      const t = i.type || "physical";
      if (t === "digital" || t === "service") return t;
      return "physical";
    })
  );
  if (types.size > 1) return "mixed";
  return (Array.from(types)[0] || "physical") as
    | "physical"
    | "digital"
    | "service";
}

export function computeDisplayStatus(order: OrderForStatus): DisplayStatus {
  if (order.refundedAt) return "refunded";
  if (
    order.paymentStatus === "refunded" ||
    order.status === "refunded"
  ) {
    return "refunded";
  }

  if (order.status === "cancelled" || order.paymentStatus === "cancelled") {
    return "cancelled";
  }

  if (
    order.paymentStatus === "pending" ||
    order.paymentStatus === "awaiting_confirmation"
  ) {
    return "awaiting_payment";
  }

  if (order.paymentStatus === "failed" || order.status === "failed") {
    return "payment_failed";
  }

  const kind = getOrderTypeKind(order.items);

  const isReleased =
    order.paymentStatus === "delivered" ||
    order.paymentStatus === "paid_released" ||
    order.status === "delivered";

  if (isReleased || order.qrScannedAt) {
    if (kind === "service") return "completed";
    return "delivered";
  }

  if (
    order.paymentStatus === "paid_escrow" ||
    order.paymentStatus === "paid_offline"
  ) {
    if (kind === "digital") {
      const releaseAfter = 3 * 60 * 60 * 1000;
      if (
        order.paidAt &&
        Date.now() - order.paidAt.getTime() > releaseAfter
      ) {
        return "delivered";
      }
      return "downloadable";
    }
    if (kind === "service") return "paid_pending_delivery";
    if (
      order.status === "in_delivery" ||
      order.status === "shipped" ||
      order.status === "confirmed"
    ) {
      return order.status === "shipped" || order.status === "in_delivery"
        ? "in_delivery"
        : "paid_pending_delivery";
    }
    return "paid_pending_delivery";
  }

  return "awaiting_payment";
}

export const STATUS_CONFIG: Record<
  DisplayStatus,
  { label: string; color: string; bg: string }
> = {
  awaiting_payment: {
    label: "Paiement en attente",
    color: "#C2410C",
    bg: "#FFEDD5",
  },
  payment_failed: {
    label: "Paiement échoué",
    color: "#B91C1C",
    bg: "#FEE2E2",
  },
  paid_pending_delivery: {
    label: "Payé · à livrer",
    color: "#1D4ED8",
    bg: "#DBEAFE",
  },
  in_delivery: {
    label: "En livraison",
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
  delivered: { label: "Livré", color: "#15803D", bg: "#DCFCE7" },
  downloadable: {
    label: "Téléchargeable",
    color: "#1D4ED8",
    bg: "#DBEAFE",
  },
  completed: {
    label: "Service rendu",
    color: "#15803D",
    bg: "#DCFCE7",
  },
  cancelled: { label: "Annulée", color: "#6B6E76", bg: "#F5F2EC" },
  refunded: { label: "Remboursée", color: "#6B6E76", bg: "#F5F2EC" },
};

export function formatPrice(n: number): string {
  return n.toLocaleString("fr-FR");
}

/** Afficher avec <span className="sellia-num">{formatPrice(n)}</span> pour Manrope. */
export { SELLIA_NUM_CLASS } from "@/lib/format-num";
