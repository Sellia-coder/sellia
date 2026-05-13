/**
 * VERIFY-ON-PULL : ne JAMAIS faire confiance au contenu d'un webhook Cartevo.
 *
 * Stratégie :
 * 1. Webhook arrive → on extrait juste le transaction_id (validé Zod)
 * 2. On refait un GET /payment/transactions/{id} authentifié avec NOTRE token
 * 3. Cartevo répond avec la VRAIE donnée (status, amount, etc.)
 * 4. On compare au montant attendu de notre Order
 * 5. On met à jour la BDD avec les données AUTHENTIQUES
 */

import { cartevoGetTransactionStatus } from "./client";
import { CartevoError } from "./types";
import type { CartevoTxStatus, CartevoCurrency } from "./types";
import { safeLogger } from "@/lib/security/redact";

export interface VerifiedTransaction {
  found: boolean;
  cartevoTxId?: string;
  status?: CartevoTxStatus;
  amount?: number;
  currency?: CartevoCurrency;
  operator?: string;
  country?: string;
  phoneNumber?: string;
  initiatedAt?: string;
  errorMessage?: string;
}

export async function verifyTransactionWithCartevo(
  transactionId: string
): Promise<VerifiedTransaction> {
  try {
    const response = await cartevoGetTransactionStatus(transactionId);

    if (!response.success || !response.data) {
      safeLogger.warn("Cartevo verify: no data returned", { transactionId });
      return { found: false };
    }

    const data = response.data;

    return {
      found: true,
      cartevoTxId: data.transaction_id,
      status: data.status,
      amount: data.amount,
      currency: data.currency as CartevoCurrency,
      operator: data.operator,
      country: data.country,
      phoneNumber: data.phone_number,
      initiatedAt: data.initiated_at,
      errorMessage: data.error_message,
    };
  } catch (err) {
    if (err instanceof CartevoError && err.statusCode === 404) {
      safeLogger.warn("Cartevo verify: transaction not found", { transactionId });
      return { found: false };
    }

    safeLogger.error("Cartevo verify failed", {
      transactionId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export interface CompareResult {
  match: boolean;
  reason?: string;
  expected?: { amount: number; currency: string };
  actual?: { amount: number; currency: string };
}

export function compareWithExpected(
  cartevoData: VerifiedTransaction,
  expected: {
    expectedAmount: number;
    expectedCurrency: string;
    tolerancePercent?: number;
  }
): CompareResult {
  if (!cartevoData.found || cartevoData.amount === undefined) {
    return { match: false, reason: "Cartevo transaction not found" };
  }

  if (cartevoData.currency !== expected.expectedCurrency) {
    return {
      match: false,
      reason: "Currency mismatch",
      expected: {
        amount: expected.expectedAmount,
        currency: expected.expectedCurrency,
      },
      actual: {
        amount: cartevoData.amount,
        currency: cartevoData.currency || "?",
      },
    };
  }

  const tolerance = expected.tolerancePercent ?? 0;
  const allowedDiff = Math.abs(expected.expectedAmount * tolerance) / 100;

  if (Math.abs(cartevoData.amount - expected.expectedAmount) > allowedDiff) {
    return {
      match: false,
      reason: "Amount mismatch",
      expected: {
        amount: expected.expectedAmount,
        currency: expected.expectedCurrency,
      },
      actual: {
        amount: cartevoData.amount,
        currency: cartevoData.currency || "?",
      },
    };
  }

  return {
    match: true,
    expected: {
      amount: expected.expectedAmount,
      currency: expected.expectedCurrency,
    },
    actual: {
      amount: cartevoData.amount,
      currency: cartevoData.currency || "?",
    },
  };
}

export async function verifyAndCompare(params: {
  transactionId: string;
  expectedAmount: number;
  expectedCurrency: string;
  tolerancePercent?: number;
}): Promise<{
  verified: VerifiedTransaction;
  comparison: CompareResult;
}> {
  const verified = await verifyTransactionWithCartevo(params.transactionId);

  const comparison = compareWithExpected(verified, {
    expectedAmount: params.expectedAmount,
    expectedCurrency: params.expectedCurrency,
    tolerancePercent: params.tolerancePercent,
  });

  return { verified, comparison };
}
