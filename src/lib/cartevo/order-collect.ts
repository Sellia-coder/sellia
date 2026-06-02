/**
 * Helper pour initier un paiement Cartevo lié à une Order.
 */

import type { Prisma } from "@prisma/client";
import { cartevoCollect } from "./client";
import { CartevoError } from "./types";
import {
  computeCollectFees,
  type FeeMode,
  type SelliaPlan,
} from "./pricing";
import { db } from "@/lib/db";
import { safeLogger } from "@/lib/security/redact";
import type { CartevoCountry, CartevoOperator, CartevoCurrency } from "./types";
import { PAYMENT_STATUS, ORDER_STATUS } from "./order-status";
import { snapshotPayinBalance } from "./balance-delta";

export interface InitOrderCollectInput {
  orderId: string;
  shopId: string;
  baseAmount: number;
  /** G5.B — Frais opérateur additif (FCFA), ajouté au montant débité au client. */
  additionalCustomerFee?: number;
  currency: CartevoCurrency;
  country: CartevoCountry;
  operator: CartevoOperator;
  phoneNumber: string;
  shopPlan: SelliaPlan;
  feeMode: FeeMode;
}

export interface InitOrderCollectResult {
  ok: boolean;
  cartevoTransactionId?: string;
  cartevoExternalId?: string;
  status?: string;
  customerPays?: number;
  error?: string;
}

export async function initOrderCollect(
  input: InitOrderCollectInput
): Promise<InitOrderCollectResult> {
  const {
    orderId,
    shopId,
    baseAmount,
    additionalCustomerFee,
    currency,
    country,
    operator,
    phoneNumber,
    shopPlan,
    feeMode,
  } = input;

  const fees = computeCollectFees({
    baseAmount,
    country,
    operator,
    shopPlan,
    feeMode,
  });

  // G5.B — Frais opérateur additif : s'ajoute au montant débité au client,
  // SANS passer par computeCollectFees (qui reste inchangé) et SANS impacter
  // order.total (donc le payout marchand reste basé sur baseAmount).
  const additionalFee = Math.round(additionalCustomerFee ?? 0);
  const customerPaysFinal = Math.round(fees.customerPays) + additionalFee;

  safeLogger.info("Initiating Cartevo collect", {
    orderId,
    shopId,
    baseAmount,
    customerPays: fees.customerPays,
    additionalFee,
    customerPaysFinal,
    currency,
    operator,
    country,
    feeMode,
    cartevoRate: fees.cartevoRate,
    selliaRate: fees.selliaRate,
  });

  const payinBalanceBefore = await snapshotPayinBalance({
    country,
    currency,
  });

  let cartevoResult;
  try {
    cartevoResult = await cartevoCollect({
      operator,
      country,
      phone_number: phoneNumber,
      amount: customerPaysFinal,
      currency,
      notify_url: process.env.CARTEVO_NOTIFY_URL,
    });
  } catch (err) {
    const msg = err instanceof CartevoError ? err.message : String(err);
    safeLogger.error("Cartevo collect API error", { orderId, error: msg });
    return { ok: false, error: msg };
  }

  if (!cartevoResult.success || !cartevoResult.data) {
    safeLogger.error("Cartevo collect failed (no data)", {
      orderId,
      cartevoResult,
    });
    return {
      ok: false,
      error: cartevoResult.message || "Cartevo refused the transaction",
    };
  }

  const data = cartevoResult.data;

  try {
    const cartevoTx = await db.cartevoTransaction.create({
      data: {
        cartevoTxId: data.transaction_id,
        cartevoExternalId: data.external_id,
        type: "COLLECT",
        status: "INITIATED",
        amount: customerPaysFinal,
        currency,
        feeCartevo: fees.cartevoFee,
        feeSellia: fees.selliaFee,
        netAmount: fees.merchantReceives,
        cartevoRate: fees.cartevoRate,
        selliaRate: fees.selliaRate,
        shopPlanAtTime: shopPlan,
        feeMode,
        operator,
        country,
        phoneNumber,
        shopId,
        orderId,
        payinBalanceBefore,
        balanceMatchAttempts: 0,
        rawRequest: {
          operator,
          country,
          phone_number: phoneNumber,
          amount: customerPaysFinal,
          baseAmount,
          additionalFee,
          currency,
          feeMode,
        } as Prisma.InputJsonValue,
        rawResponse: data as unknown as Prisma.InputJsonValue,
        initiatedAt: new Date(),
      },
    });

    await db.order.update({
      where: { id: orderId },
      data: {
        total: Math.round(fees.customerPays),
        paymentStatus: PAYMENT_STATUS.AWAITING_CONFIRMATION,
        status: ORDER_STATUS.AWAITING_CONFIRMATION,
      },
    });

    safeLogger.info("Cartevo collect initiated successfully", {
      orderId,
      cartevoTxId: data.transaction_id,
      status: data.status,
      customerPays: customerPaysFinal,
    });

    return {
      ok: true,
      cartevoTransactionId: cartevoTx.id,
      cartevoExternalId: data.external_id,
      status: data.status,
      customerPays: customerPaysFinal,
    };
  } catch (err) {
    safeLogger.error("Failed to persist CartevoTransaction", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "Database error while saving transaction" };
  }
}
