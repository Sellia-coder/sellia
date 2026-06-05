import { PAYMENT_STATUS } from "@/lib/cartevo/order-status";
import { SELLIA_PLANS, type SelliaPlan } from "@/lib/cartevo/pricing";

/** Commandes dont le paiement est confirmé (GMV plateforme). */
export const ADMIN_PAID_PAYMENT_STATUSES = [
  PAYMENT_STATUS.PAID_ESCROW,
  PAYMENT_STATUS.PAID_OFFLINE,
  PAYMENT_STATUS.PAID_RELEASED,
] as const;

export function planLabel(plan: string | null | undefined): string {
  const key = (plan ?? "free") as SelliaPlan;
  return SELLIA_PLANS[key]?.name ?? plan ?? "—";
}

export function formatAdminMoney(amount: number, currency = "XAF"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAdminDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
