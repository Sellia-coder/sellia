import { db } from "@/lib/db";
import { PayoutStatus, type ReportStatus, type TicketStatus } from "@prisma/client";

export type AdminTodoCounts = {
  pendingWithdrawals: number;
  manualReviewWithdrawals: number;
  openReports: number;
  openTickets: number;
  newLandingSupport: number;
  newMerchantFeedbacks: number;
  total: number;
};

const OPEN_TICKET_STATUSES: TicketStatus[] = [
  "OPEN",
  "WAITING_SUPPORT",
  "WAITING_USER",
];

const OPEN_REPORT_STATUSES: ReportStatus[] = ["PENDING", "REVIEWING"];

/** Compteurs « à traiter » — lecture seule, hors metrics.ts. */
export async function getAdminTodoCounts(): Promise<AdminTodoCounts> {
  const [
    pendingWithdrawals,
    manualReviewWithdrawals,
    openReports,
    openTickets,
    newLandingSupport,
    newMerchantFeedbacks,
  ] = await Promise.all([
    db.payout.count({
      where: {
        status: PayoutStatus.REQUESTED,
        withdrawalGroupId: { not: null },
      },
    }),
    db.payout.count({
      where: { manualReviewRequired: true, status: PayoutStatus.PROCESSING },
    }),
    db.productReport.count({ where: { status: { in: OPEN_REPORT_STATUSES } } }),
    db.supportTicket.count({ where: { status: { in: OPEN_TICKET_STATUSES } } }),
    db.landingSupportConversation.count({
      where: {
        status: { not: "CLOSED" },
        OR: [{ status: "NEW" }, { unreadForAdmin: { gt: 0 } }],
      },
    }),
    db.merchantFeedback.count({ where: { status: "NEW" } }),
  ]);

  return {
    pendingWithdrawals,
    manualReviewWithdrawals,
    openReports,
    openTickets,
    newLandingSupport,
    newMerchantFeedbacks,
    total:
      pendingWithdrawals +
      manualReviewWithdrawals +
      openReports +
      openTickets +
      newLandingSupport +
      newMerchantFeedbacks,
  };
}
