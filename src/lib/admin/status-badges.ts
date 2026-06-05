import {
  paymentStatusLabel,
  payoutStatusLabel,
  REPORT_STATUS_LABELS,
} from "@/lib/admin/labels";
import { PAYMENT_STATUS } from "@/lib/cartevo/order-status";
import type { ReportStatus } from "@prisma/client";

export type AdminBadgeVariant = "ok" | "warn" | "danger" | "info" | "off";

export function paymentStatusBadge(status: string): {
  label: string;
  variant: AdminBadgeVariant;
} {
  const label = paymentStatusLabel(status);
  if (
    status === PAYMENT_STATUS.PAID_ESCROW ||
    status === PAYMENT_STATUS.PAID_OFFLINE ||
    status === PAYMENT_STATUS.PAID_RELEASED
  ) {
    return { label, variant: "ok" };
  }
  if (status === PAYMENT_STATUS.PENDING || status === PAYMENT_STATUS.AWAITING_CONFIRMATION) {
    return { label, variant: "warn" };
  }
  if (status === PAYMENT_STATUS.FAILED || status === PAYMENT_STATUS.CANCELLED) {
    return { label, variant: "danger" };
  }
  if (status === PAYMENT_STATUS.REFUNDED) {
    return { label, variant: "off" };
  }
  return { label, variant: "off" };
}

export function payoutStatusBadge(status: string): {
  label: string;
  variant: AdminBadgeVariant;
} {
  const s = status.toUpperCase();
  const label = payoutStatusLabel(s);
  if (s === "SUCCESS" || s === "COMPLETED" || s === "PAID") {
    return { label, variant: "ok" };
  }
  if (s === "REQUESTED" || s === "PENDING" || s === "PENDING_ESCROW" || s === "AVAILABLE") {
    return { label, variant: "warn" };
  }
  if (s === "FAILED" || s === "CANCELLED" || s === "REFUNDED") {
    return { label, variant: "danger" };
  }
  if (s === "PROCESSING") {
    return { label, variant: "info" };
  }
  return { label, variant: "off" };
}

export function reportStatusBadge(status: ReportStatus): {
  label: string;
  variant: AdminBadgeVariant;
} {
  const label = REPORT_STATUS_LABELS[status];
  if (status === "RESOLVED") return { label, variant: "ok" };
  if (status === "REVIEWING") return { label, variant: "info" };
  if (status === "DISMISSED") return { label, variant: "off" };
  return { label, variant: "warn" };
}

export function shopPublishedBadge(isPublished: boolean): {
  label: string;
  variant: AdminBadgeVariant;
} {
  return isPublished
    ? { label: "Publiée", variant: "ok" }
    : { label: "Suspendue", variant: "danger" };
}

export function userStatusBadge(isBlocked: boolean): {
  label: string;
  variant: AdminBadgeVariant;
} {
  return isBlocked
    ? { label: "Bloqué", variant: "danger" }
    : { label: "Actif", variant: "ok" };
}

export function roleBadge(role: string | null | undefined): {
  label: string;
  variant: AdminBadgeVariant;
} {
  return role === "admin"
    ? { label: "admin", variant: "warn" }
    : { label: role ?? "user", variant: "off" };
}
