/**
 * Calcule la commission Sellia sur une transaction.
 * Délègue aux taux G2.1.D : Free 3% / Pro 1.5% / Business 1%.
 */

import { getSelliaRate, type SelliaPlan } from "./pricing";

export type { SelliaPlan } from "./pricing";

export interface CommissionBreakdown {
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
}

export function calculateSelliaCommission(
  grossAmount: number,
  plan: SelliaPlan
): CommissionBreakdown {
  const ratePercent = getSelliaRate(plan);
  const rate = ratePercent / 100;
  const commission = Math.round(grossAmount * rate * 100) / 100;
  const net = grossAmount - commission;

  return {
    grossAmount,
    commissionRate: rate,
    commissionAmount: commission,
    netAmount: net,
  };
}

/**
 * Solde boutique (à terme : agrégats Prisma sur CartevoTransaction / Payout).
 *
 * Formule visée :
 * disponible = SUM(CartevoTransaction COLLECT SUCCESS netAmount)
 *            - SUM(Payout SUCCESS amount)
 *            - SUM(Payout PROCESSING amount)
 *            - SUM(Payout PENDING amount)
 */
export interface ShopBalance {
  totalCollected: number;
  totalCommissions: number;
  totalNet: number;
  totalPaidOut: number;
  totalPending: number;
  available: number;
  currency: string;
}
