export const DISPUTE_STATUSES = [
  "OPEN",
  "IN_REVIEW",
  "RESOLVED_CUSTOMER",
  "RESOLVED_MERCHANT",
  "CLOSED",
] as const;

export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  OPEN: "Ouvert",
  IN_REVIEW: "En cours d'examen",
  RESOLVED_CUSTOMER: "Tranché — client",
  RESOLVED_MERCHANT: "Tranché — marchand",
  CLOSED: "Clôturé",
};

export const DISPUTE_REASONS = [
  { value: "NOT_RECEIVED", label: "Commande non reçue" },
  { value: "NOT_AS_DESCRIBED", label: "Produit non conforme" },
  { value: "DAMAGED", label: "Produit endommagé / défectueux" },
  { value: "WRONG_ITEM", label: "Mauvais article reçu" },
  { value: "OTHER", label: "Autre motif" },
] as const;

export type DisputeReason = (typeof DISPUTE_REASONS)[number]["value"];

export function disputeReasonLabel(reason: string): string {
  return DISPUTE_REASONS.find((r) => r.value === reason)?.label ?? reason;
}

export const OPEN_DISPUTE_STATUSES: DisputeStatus[] = ["OPEN", "IN_REVIEW"];
