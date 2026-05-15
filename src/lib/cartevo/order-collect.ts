/**
 * Helper pour initier un paiement Cartevo lié à une Order.
 */

import type { Prisma } from "@prisma/client";
import { cartevoCollect } from "./client";
import { CartevoError } from "./types";
import { calculateSelliaCommission } from "./commission";
import { db } from "@/lib/db";
import { safeLogger } from "@/lib/security/redact";
import type { CartevoCountry, CartevoOperator, CartevoCurrency } from "./types";
import { PAYMENT_STATUS, ORDER_STATUS } from "./order-status";

export interface InitOrderCollectInput {
  orderId: string;
  shopId: string;
  amount: number;
  currency: CartevoCurrency;
  country: CartevoCountry;
  operator: CartevoOperator;
  phoneNumber: string;
  shopPlan: "free" | "pro";
}

export interface InitOrderCollectResult {
  ok: boolean;
  cartevoTransactionId?: string;
  cartevoExternalId?: string;
  status?: string;
  error?: string;
}

export async function initOrderCollect(
  input: InitOrderCollectInput
): Promise<InitOrderCollectResult> {
  const {
    orderId,
    shopId,
    amount,
    currency,
    country,
    operator,
    phoneNumber,
    shopPlan,
  } = input;

  const commission = calculateSelliaCommission(amount, shopPlan);
  safeLogger.info("Initiating Cartevo collect", {
    orderId,
    shopId,
    amount,
    currency,
    operator,
    country,
    commission: {
      rate: commission.commissionRate,
      amount: commission.commissionAmount,
    },
  });

  let cartevoResult;
  try {
    cartevoResult = await cartevoCollect({
      operator,
      country,
      phone_number: phoneNumber,
      amount,
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
        amount,
        currency,
        feeCartevo: 0,
        feeSellia: commission.commissionAmount,
        netAmount: commission.netAmount,
        operator,
        country,
        phoneNumber,
        shopId,
        orderId,
        rawRequest: {
          operator,
          country,
          phone_number: phoneNumber,
          amount,
          currency,
        } as Prisma.InputJsonValue,
        rawResponse: data as unknown as Prisma.InputJsonValue,
        initiatedAt: new Date(),
      },
    });

    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PAYMENT_STATUS.AWAITING_CONFIRMATION,
        status: ORDER_STATUS.AWAITING_CONFIRMATION,
      },
    });

    safeLogger.info("Cartevo collect initiated successfully", {
      orderId,
      cartevoTxId: data.transaction_id,
      status: data.status,
    });

    return {
      ok: true,
      cartevoTransactionId: cartevoTx.id,
      cartevoExternalId: data.external_id,
      status: data.status,
    };
  } catch (err) {
    safeLogger.error("Failed to persist CartevoTransaction", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "Database error while saving transaction" };
  }
}
