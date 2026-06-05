import { ReportStatus, TicketStatus } from "@prisma/client";

/** Libellés lisibles des statuts de paiement commande. */
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  awaiting_confirmation: "En attente de confirmation",
  paid_escrow: "Payé",
  paid_offline: "Payé hors ligne",
  paid_released: "Versé",
  failed: "Échoué",
  refunded: "Remboursé",
  cancelled: "Annulé",
};

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

/** Libellés lisibles des statuts Payout. */
export const PAYOUT_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  PROCESSING: "En cours",
  SUCCESS: "Réussi",
  FAILED: "Échoué",
  CANCELLED: "Annulé",
  PENDING_ESCROW: "En séquestre",
  AVAILABLE: "Disponible",
  REQUESTED: "En attente de validation",
  PAID: "Versé",
  REFUNDED: "Remboursé",
};

export function payoutStatusLabel(status: string): string {
  return PAYOUT_STATUS_LABELS[status] ?? status;
}

export const PAYOUT_TYPE_LABELS: Record<string, string> = {
  MERCHANT_REQUESTED: "Retrait marchand",
  ORDER_DIGITAL: "Commande digitale",
  ORDER_PHYSICAL: "Commande physique",
  ORDER_SERVICE: "Commande service",
};

export function payoutTypeLabel(type: string): string {
  return PAYOUT_TYPE_LABELS[type] ?? type;
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "Nouveau",
  REVIEWING: "En cours",
  RESOLVED: "Traité",
  DISMISSED: "Rejeté",
};

export const REPORT_REASON_LABELS: Record<string, string> = {
  COUNTERFEIT: "Contrefaçon",
  INAPPROPRIATE: "Inapproprié",
  MISLEADING: "Trompeur",
  SCAM: "Arnaque",
  PROHIBITED: "Interdit",
  OTHER: "Autre",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Ouvert",
  WAITING_USER: "En attente marchand",
  WAITING_SUPPORT: "En attente support",
  RESOLVED: "Résolu",
  CLOSED: "Fermé",
};

export const TICKET_CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: "Technique",
  ORDER: "Commande",
  PAYMENT: "Paiement",
  SHOP: "Boutique",
  SUGGESTION: "Suggestion",
  OTHER: "Autre",
};
