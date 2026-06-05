import { db } from "@/lib/db";
import { PayoutStatus, type ReportStatus, type TicketStatus } from "@prisma/client";

export type AdminTodoCounts = {
  pendingWithdrawals: number;
  manualReviewWithdrawals: number;
  openReports: number;
  openTickets: number;
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
  ]);

  return {
    pendingWithdrawals,
    manualReviewWithdrawals,
    openReports,
    openTickets,
    total:
      pendingWithdrawals +
      manualReviewWithdrawals +
      openReports +
      openTickets,
  };
}
