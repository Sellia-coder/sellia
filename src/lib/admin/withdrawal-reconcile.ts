/**
 * Réconciliation d'un seul groupe de retrait — sans modifier withdrawal.ts.
 * Réutilise les helpers exportés + mêmes garde-fous money (#1).
 */

import { PayoutStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  verifyTransactionWithCartevo,
  compareWithExpected,
} from "@/lib/cartevo/verify";
import {
  payoutCurrencyForCountry,
  parseCartevoTxIdFromDescription,
  MANUAL_REVIEW_AFTER_MS,
} from "@/lib/payouts/withdrawal";

export async function reconcileSingleWithdrawalGroup(
  withdrawalGroupId: string
): Promise<
  | { ok: true; outcome: "success" | "failed_recredited" | "still_pending" | "already_done" | "manual_review" }
  | { ok: false; error: string }
> {
  const rows = await db.payout.findMany({
    where: { withdrawalGroupId },
  });

  if (rows.length === 0) {
    return { ok: false, error: "Groupe introuvable." };
  }

  const processing = rows.filter((r) => r.status === PayoutStatus.PROCESSING);
  if (processing.length === 0) {
    return { ok: true, outcome: "already_done" };
  }

  const lead = processing[0];
  const payoutIds = processing.map((r) => r.id);
  const netAmount =
    lead.withdrawalNetAmount != null
      ? Number(lead.withdrawalNetAmount)
      : processing.reduce((s, r) => s + Number(r.netAmount), 0);

  let cartevoTxId = lead.cartevoTxId;
  if (!cartevoTxId) {
    cartevoTxId = parseCartevoTxIdFromDescription(lead.description);
    if (cartevoTxId) {
      await db.payout.updateMany({
        where: { id: { in: payoutIds } },
        data: { cartevoTxId },
      });
    }
  }

  if (!cartevoTxId) {
    const age = Date.now() - lead.requestedAt.getTime();
    if (age >= MANUAL_REVIEW_AFTER_MS) {
      await db.payout.updateMany({
        where: { id: { in: payoutIds } },
        data: {
          manualReviewRequired: true,
          errorMessage:
            "Vérification manuelle requise : aucune référence Cartevo traçable.",
        },
      });
      return { ok: true, outcome: "manual_review" };
    }
    return { ok: true, outcome: "still_pending" };
  }

  const verified = await verifyTransactionWithCartevo(cartevoTxId);

  if (!verified.found) {
    const age = Date.now() - lead.requestedAt.getTime();
    if (age >= MANUAL_REVIEW_AFTER_MS) {
      await db.payout.updateMany({
        where: { id: { in: payoutIds } },
        data: {
          manualReviewRequired: true,
          errorMessage:
            "Vérification manuelle requise : transaction introuvable chez Cartevo (404).",
        },
      });
      return { ok: true, outcome: "manual_review" };
    }
    return { ok: true, outcome: "still_pending" };
  }

  const comparison = compareWithExpected(verified, {
    expectedAmount: netAmount,
    expectedCurrency: payoutCurrencyForCountry(lead.country),
  });

  if (!comparison.match) {
    await db.payout.updateMany({
      where: { id: { in: payoutIds } },
      data: {
        manualReviewRequired: true,
        errorMessage: `Écart de montant Cartevo : ${comparison.reason}`,
      },
    });
    return { ok: true, outcome: "manual_review" };
  }

  if (verified.status === "SUCCESS") {
    await db.$transaction(async (tx) => {
      await tx.cartevoTransaction.updateMany({
        where: { cartevoTxId },
        data: {
          status: "SUCCESS",
          completedAt: new Date(),
          rawResponse: verified as unknown as Prisma.InputJsonValue,
        },
      });
      await tx.payout.updateMany({
        where: {
          id: { in: payoutIds },
          status: PayoutStatus.PROCESSING,
        },
        data: {
          status: PayoutStatus.SUCCESS,
          paidOutAt: new Date(),
          completedAt: new Date(),
          cartevoTxId,
          manualReviewRequired: false,
          errorMessage: null,
        },
      });
    });
    return { ok: true, outcome: "success" };
  }

  if (verified.status === "FAILED" || verified.status === "CANCELLED") {
    await db.$transaction(async (tx) => {
      await tx.cartevoTransaction.updateMany({
        where: { cartevoTxId },
        data: {
          status: verified.status,
          completedAt: new Date(),
          errorMessage: verified.errorMessage,
          rawResponse: verified as unknown as Prisma.InputJsonValue,
        },
      });
      await tx.payout.updateMany({
        where: {
          id: { in: payoutIds },
          status: PayoutStatus.PROCESSING,
        },
        data: {
          status: PayoutStatus.AVAILABLE,
          errorMessage: `Échoué (fonds restitués) : ${verified.errorMessage ?? verified.status}`,
          manualReviewRequired: false,
          cartevoTxId,
        },
      });
    });
    return { ok: true, outcome: "failed_recredited" };
  }

  return { ok: true, outcome: "still_pending" };
}
