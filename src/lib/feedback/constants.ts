export const FEEDBACK_TYPES = [
  { value: "SUGGESTION", label: "Suggestion" },
  { value: "REMARQUE", label: "Remarque" },
  { value: "BUG", label: "Bug" },
  { value: "AUTRE", label: "Autre" },
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number]["value"];

export const FEEDBACK_STATUSES = ["NEW", "READ", "HANDLED"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  SUGGESTION: "Suggestion",
  REMARQUE: "Remarque",
  BUG: "Bug",
  AUTRE: "Autre",
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  NEW: "Nouveau",
  READ: "Lu",
  HANDLED: "Traité",
};

export function feedbackTypeLabel(type: string): string {
  return FEEDBACK_TYPE_LABELS[type as FeedbackType] ?? type;
}
