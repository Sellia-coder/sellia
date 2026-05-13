/**
 * Calcule la commission Sellia sur une transaction.
 * - Plan Free : 6% de commission
 * - Plan Pro : 4% de commission
 *
 * Les frais Cartevo ne sont PAS inclus ici (gérés séparément).
 */

export type SelliaPlan = "free" | "pro";

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
  const rate = plan === "pro" ? 0.04 : 0.06;
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
