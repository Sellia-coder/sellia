/**
 * G7 — Retraits marchand : FIFO, monnaie G9, envoi Cartevo, validation admin, réconciliation.
 *
 * Invariants :
 * - I1 : conservation FCFA — succès sort du solde, échec/rejet → AVAILABLE (même ligne).
 * - I2 : idempotence — guards status + updateMany count check.
 * - I3 : états terminaux uniques — pas de SUCCESS → AVAILABLE.
 * - I4 : G8/G9 inchangés (monnaie via applyWithdrawalChangeInTx, pas de touch à settlePaidOrderPayout).
 */

import { randomUUID } from "crypto";
import {
  PayoutStatus,
  Prisma,
  type Payout,
  type CartevoTxStatus,
} from "@prisma/client";
import { db } from "@/lib/db";
import { cartevoPayout } from "@/lib/cartevo/client";
import {
  getMerchantWithdrawalFeeRate,
  computePayoutFees,
  CARTEVO_FEES,
  type CartevoCountryCode,
} from "@/lib/cartevo/pricing";
import {
  verifyTransactionWithCartevo,
  compareWithExpected,
} from "@/lib/cartevo/verify";
import { CartevoError } from "@/lib/cartevo/types";
import type {
  CartevoOperator,
  CartevoCountry,
  CartevoCurrency,
  CartevoPayoutResponse,
} from "@/lib/cartevo/types";
import { sendWithdrawalEmail } from "@/lib/email/transactional";
import { safeLogger } from "@/lib/security/redact";

/** Seuil (FCFA) au-delà duquel un retrait passe par validation agent. */
export const WITHDRAWAL_AUTO_THRESHOLD = 50_000;

/** Délai avant drapeau « vérification manuelle » si pas de cartevoTxId ou 404. */
export const MANUAL_REVIEW_AFTER_MS = 24 * 60 * 60 * 1000;

export const RECONCILE_PAYOUT_BATCH_SIZE = 50;

const CARTEVO_REF_RE =
  /Retrait auto · Cartevo ([a-zA-Z0-9_-]+)/;

export interface WithdrawalShopContext {
  id: string;
  currency: string | null;
  country: string | null;
  payoutPhone: string | null;
  payoutOperator: string | null;
  payoutCountry: string | null;
  phone: string | null;
}

export interface WithdrawalFeeResult {
  grossAmount: number;
  withdrawalFee: number;
  withdrawalFeeRate: number;
  netAmount: number;
  cartevoCost: number;
}

export function computeWithdrawalFees(
  grossAmount: number,
  country: string,
  operator: string
): WithdrawalFeeResult {
  const withdrawalFeeRate = getMerchantWithdrawalFeeRate(country);
  const withdrawalFee = Math.round(grossAmount * (withdrawalFeeRate / 100));
  const netAmount = grossAmount - withdrawalFee;
  const cartevoCost = Math.round(
    computePayoutFees({ requestedAmount: netAmount, country, operator })
      .cartevoFee
  );
  return {
    grossAmount,
    withdrawalFee,
    withdrawalFeeRate,
    netAmount,
    cartevoCost,
  };
}

export function resolveWithdrawalDestination(shop: WithdrawalShopContext) {
  const country = shop.payoutCountry || shop.country || "CM";
  const operator = (shop.payoutOperator || "mtn").replace(
    /_mobile_money$/,
    ""
  );
  const phone = shop.payoutPhone || shop.phone || "";
  return { country, operator, phone };
}

export function payoutCurrencyForCountry(country: string): CartevoCurrency {
  return (CARTEVO_FEES[country as CartevoCountryCode]?.currency ??
    "XAF") as CartevoCurrency;
}

/** Parse la référence Cartevo stockée en description (legacy ≤50k). */
export function parseCartevoTxIdFromDescription(
  description: string | null | undefined
): string | null {
  if (!description) return null;
  const m = description.match(CARTEVO_REF_RE);
  return m?.[1] ?? null;
}

/**
 * G9.A — Monnaie : réduit le dernier payout consommé et crée le « reste » AVAILABLE.
 * Appelé dans la MÊME transaction que le verrouillage des fonds.
 */
export async function applyWithdrawalChangeInTx(
  tx: Prisma.TransactionClient,
  opts: {
    shopId: string;
    toRequest: string[];
    selected: Payout[];
    amount: number;
    operator: string;
    country: string;
    payoutPhone: string;
    currency: string;
  }
) {
  const selectedTotal = opts.selected.reduce((s, p) => s + Number(p.amount), 0);
  const changeAmount = selectedTotal - opts.amount;
  if (changeAmount <= 0) return;

  const lastPayoutId = opts.toRequest[opts.toRequest.length - 1];
  const lastPayout = opts.selected.find((p) => p.id === lastPayoutId);
  if (!lastPayout) return;

  await tx.payout.update({
    where: { id: lastPayout.id },
    data: {
      amount: Number(lastPayout.amount) - changeAmount,
      netAmount: Math.max(0, Number(lastPayout.netAmount) - changeAmount),
    },
  });

  await tx.payout.create({
    data: {
      shopId: opts.shopId,
      orderId: null,
      payoutType: "MERCHANT_REQUESTED",
      amount: changeAmount,
      netAmount: changeAmount,
      operator: opts.operator,
      country: opts.country,
      phoneNumber: opts.payoutPhone,
      currency: opts.currency,
      status: PayoutStatus.AVAILABLE,
      description: "Reste de retrait (monnaie)",
    },
  });
}

export interface FifoSelection {
  toRequest: string[];
  selected: Payout[];
  totalAvailable: number;
}

export async function selectFifoPayouts(
  shopId: string,
  amount: number
): Promise<FifoSelection | { error: "insufficient"; totalAvailable: number }> {
  const available = await db.payout.findMany({
    where: { shopId, status: PayoutStatus.AVAILABLE },
    orderBy: { createdAt: "asc" },
  });

  const totalAvailable = available.reduce((sum, p) => sum + Number(p.amount), 0);
  if (totalAvailable < amount) {
    return { error: "insufficient", totalAvailable };
  }

  let remaining = amount;
  const toRequest: string[] = [];
  for (const p of available) {
    if (remaining <= 0) break;
    toRequest.push(p.id);
    remaining -= Number(p.amount);
  }

  const selected = available.filter((p) => toRequest.includes(p.id));
  return { toRequest, selected, totalAvailable };
}

async function stampWithdrawalMetadata(
  tx: Prisma.TransactionClient,
  payoutIds: string[],
  meta: {
    withdrawalGroupId: string;
    withdrawalGrossAmount: number;
    withdrawalNetAmount: number;
  }
) {
  await tx.payout.updateMany({
    where: { id: { in: payoutIds } },
    data: {
      withdrawalGroupId: meta.withdrawalGroupId,
      withdrawalGrossAmount: meta.withdrawalGrossAmount,
      withdrawalNetAmount: meta.withdrawalNetAmount,
    },
  });
}

/** Rollback PROCESSING → AVAILABLE (recrédit, même ligne — pas de duplication). */
export async function rollbackWithdrawalToAvailable(payoutIds: string[]) {
  await db.payout.updateMany({
    where: {
      id: { in: payoutIds },
      status: PayoutStatus.PROCESSING,
    },
    data: {
      status: PayoutStatus.AVAILABLE,
      errorMessage: null,
      manualReviewRequired: false,
    },
  });
}

/** Finalise SUCCESS pour toutes les lignes du groupe. */
export async function finalizeWithdrawalSuccess(
  payoutIds: string[],
  cartevoTxId: string | undefined,
  mode: "auto" | "admin"
) {
  const desc = cartevoTxId
    ? `Retrait ${mode === "auto" ? "auto" : "validé"} · Cartevo ${cartevoTxId}`
    : `Retrait ${mode === "auto" ? "auto" : "validé"}`;

  await db.payout.updateMany({
    where: {
      id: { in: payoutIds },
      status: PayoutStatus.PROCESSING,
    },
    data: {
      status: PayoutStatus.SUCCESS,
      paidOutAt: new Date(),
      processedAt: new Date(),
      completedAt: new Date(),
      description: desc,
      cartevoTxId: cartevoTxId ?? undefined,
      errorMessage: null,
      manualReviewRequired: false,
    },
  });
}

function mapCartevoStatusToTxStatus(
  status: CartevoTxStatus | undefined
): "INITIATED" | "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" {
  if (
    status === "SUCCESS" ||
    status === "FAILED" ||
    status === "CANCELLED" ||
    status === "PENDING" ||
    status === "INITIATED"
  ) {
    return status;
  }
  return "PENDING";
}

/**
 * Crée ou met à jour CartevoTransaction (type PAYOUT) et stocke cartevoTxId sur
 * toutes les lignes du groupe.
 */
export async function persistCartevoPayoutTx(opts: {
  cartevoTxId: string;
  cartevoExternalId?: string;
  status: CartevoTxStatus | undefined;
  netAmount: number;
  currency: string;
  feeCartevo: number;
  operator: string;
  country: string;
  phoneNumber: string;
  shopId: string;
  leadPayoutId: string;
  withdrawalGroupId: string;
  rawResponse: unknown;
  payoutIds: string[];
  errorMessage?: string;
}) {
  const txStatus = mapCartevoStatusToTxStatus(opts.status);

  await db.$transaction(async (tx) => {
    const existing = await tx.cartevoTransaction.findUnique({
      where: { cartevoTxId: opts.cartevoTxId },
    });

    if (existing) {
      await tx.cartevoTransaction.update({
        where: { id: existing.id },
        data: {
          status: txStatus,
          completedAt:
            txStatus === "SUCCESS" ||
            txStatus === "FAILED" ||
            txStatus === "CANCELLED"
              ? new Date()
              : null,
          errorMessage: opts.errorMessage,
          rawResponse: opts.rawResponse as Prisma.InputJsonValue,
        },
      });
    } else {
      await tx.cartevoTransaction.create({
        data: {
          cartevoTxId: opts.cartevoTxId,
          cartevoExternalId:
            opts.cartevoExternalId ?? `WD-${opts.withdrawalGroupId}`,
          type: "PAYOUT",
          status: txStatus,
          amount: opts.netAmount,
          currency: opts.currency,
          feeCartevo: opts.feeCartevo,
          netAmount: opts.netAmount,
          operator: opts.operator,
          country: opts.country,
          phoneNumber: opts.phoneNumber,
          shopId: opts.shopId,
          payoutId: opts.leadPayoutId,
          rawResponse: opts.rawResponse as Prisma.InputJsonValue,
          errorMessage: opts.errorMessage,
          initiatedAt: new Date(),
          completedAt:
            txStatus === "SUCCESS" ||
            txStatus === "FAILED" ||
            txStatus === "CANCELLED"
              ? new Date()
              : null,
        },
      });
    }

    await tx.payout.updateMany({
      where: { id: { in: opts.payoutIds } },
      data: { cartevoTxId: opts.cartevoTxId },
    });
  });
}

export type CartevoSendOutcome =
  | { outcome: "success" }
  | { outcome: "pending"; cartevoTxId: string }
  | { outcome: "failed_rollback" }
  | { outcome: "network_error_rollback" };

/**
 * UN SEUL appel Cartevo par withdrawalGroupId.
 * Garde-fou #2 : stocke cartevoTxId dès la réponse (même PENDING).
 */
export async function sendCartevoWithdrawal(opts: {
  shopId: string;
  withdrawalGroupId: string;
  payoutIds: string[];
  leadPayoutId: string;
  netAmount: number;
  grossAmount: number;
  country: string;
  operator: string;
  phone: string;
  currency: string;
  feeCartevo: number;
  mode: "auto" | "admin";
}): Promise<CartevoSendOutcome> {
  const payoutCurrency = payoutCurrencyForCountry(opts.country);

  let res: CartevoPayoutResponse | null = null;
  try {
    res = await cartevoPayout({
      operator: opts.operator as CartevoOperator,
      country: opts.country as CartevoCountry,
      phone_number: opts.phone,
      amount: opts.netAmount,
      currency: payoutCurrency,
    });
  } catch (err) {
    safeLogger.error("[withdrawal] cartevoPayout error", {
      withdrawalGroupId: opts.withdrawalGroupId,
      error: err instanceof Error ? err.message : String(err),
    });
    // Pas de transaction_id traçable → rollback (rien n'a pu être confirmé côté Cartevo).
    await rollbackWithdrawalToAvailable(opts.payoutIds);
    return { outcome: "network_error_rollback" };
  }

  if (!res?.success || !res.data?.transaction_id) {
    await rollbackWithdrawalToAvailable(opts.payoutIds);
    return { outcome: "network_error_rollback" };
  }

  const { transaction_id: cartevoTxId, status, external_id: externalId } =
    res.data;

  await persistCartevoPayoutTx({
    cartevoTxId,
    cartevoExternalId: externalId,
    status,
    netAmount: opts.netAmount,
    currency: payoutCurrency,
    feeCartevo: opts.feeCartevo,
    operator: opts.operator,
    country: opts.country,
    phoneNumber: opts.phone,
    shopId: opts.shopId,
    leadPayoutId: opts.leadPayoutId,
    withdrawalGroupId: opts.withdrawalGroupId,
    rawResponse: res.data,
    payoutIds: opts.payoutIds,
    errorMessage: res.data.error_message,
  });

  // G7 durci : SUCCESS uniquement.
  if (status === "SUCCESS") {
    await finalizeWithdrawalSuccess(opts.payoutIds, cartevoTxId, opts.mode);
    return { outcome: "success" };
  }

  if (status === "PENDING" || status === "INITIATED") {
    return { outcome: "pending", cartevoTxId };
  }

  if (status === "FAILED" || status === "CANCELLED") {
    await db.cartevoTransaction.update({
      where: { cartevoTxId },
      data: {
        status,
        completedAt: new Date(),
        errorMessage: res.data.error_message,
      },
    });
    await rollbackWithdrawalToAvailable(opts.payoutIds);
    return { outcome: "failed_rollback" };
  }

  // Statut inconnu → rester PROCESSING (garde-fou #1).
  return { outcome: "pending", cartevoTxId };
}

export interface CreateWithdrawalResult {
  ok: true;
  mode: "pending_validation" | "auto";
  withdrawalGroupId: string;
  requestedAmount: number;
  withdrawalFee: number;
  withdrawalFeeRate: number;
  netAmount: number;
  isFree?: boolean;
  message: string;
}

/**
 * Point d'entrée marchand : sélection FIFO, monnaie G9, branchement >50k / ≤50k.
 */
export async function createMerchantWithdrawal(
  shop: WithdrawalShopContext,
  amount: number
): Promise<
  | CreateWithdrawalResult
  | { ok: false; error: string; status: number }
> {
  const payoutPhone = shop.payoutPhone || shop.phone;
  if (!payoutPhone) {
    return {
      ok: false,
      error:
        "Méthode de retrait non configurée. Renseignez votre numéro Mobile Money dans les paramètres.",
      status: 400,
    };
  }

  if (amount < 1000) {
    return {
      ok: false,
      error: "Montant minimum : 1 000 FCFA",
      status: 400,
    };
  }

  const fifo = await selectFifoPayouts(shop.id, amount);
  if ("error" in fifo) {
    return {
      ok: false,
      error: `Solde disponible insuffisant (${Math.floor(fifo.totalAvailable).toLocaleString("fr-FR")} FCFA)`,
      status: 400,
    };
  }

  const { toRequest, selected } = fifo;
  const { country, operator, phone } = resolveWithdrawalDestination(shop);
  const fees = computeWithdrawalFees(amount, country, operator);
  const withdrawalGroupId = randomUUID();
  const currency = shop.currency ?? "XAF";

  const changeOpts = {
    shopId: shop.id,
    toRequest,
    selected,
    amount,
    operator,
    country,
    payoutPhone,
    currency,
  };

  // ── CAS A : > 50k → REQUESTED (validation agent) ──
  if (amount > WITHDRAWAL_AUTO_THRESHOLD) {
    try {
      await db.$transaction(async (tx) => {
        const res = await tx.payout.updateMany({
          where: { id: { in: toRequest }, status: PayoutStatus.AVAILABLE },
          data: { status: PayoutStatus.REQUESTED, requestedAt: new Date() },
        });
        if (res.count !== toRequest.length) throw new Error("CONFLICT");
        await applyWithdrawalChangeInTx(tx, changeOpts);
        await stampWithdrawalMetadata(tx, toRequest, {
          withdrawalGroupId,
          withdrawalGrossAmount: fees.grossAmount,
          withdrawalNetAmount: fees.netAmount,
        });
      });
    } catch (err) {
      if (err instanceof Error && err.message === "CONFLICT") {
        return {
          ok: false,
          error: "Retrait déjà en cours, réessayez.",
          status: 409,
        };
      }
      throw err;
    }

    sendWithdrawalEmail({
      shopId: shop.id,
      mode: "pending",
      netAmount: fees.netAmount,
      withdrawalFee: fees.withdrawalFee,
      currency: shop.currency,
      phone: payoutPhone,
    }).catch((e) =>
      safeLogger.error("[email withdrawal pending]", {
        error: e instanceof Error ? e.message : String(e),
      })
    );

    return {
      ok: true,
      mode: "pending_validation",
      withdrawalGroupId,
      requestedAmount: amount,
      withdrawalFee: fees.withdrawalFee,
      withdrawalFeeRate: fees.withdrawalFeeRate,
      netAmount: fees.netAmount,
      message:
        "Retrait de plus de 50 000 FCFA : en cours de validation par un agent. Vous serez payé sous peu.",
    };
  }

  // ── CAS B : ≤ 50k → PROCESSING puis Cartevo ──
  try {
    await db.$transaction(async (tx) => {
      const res = await tx.payout.updateMany({
        where: { id: { in: toRequest }, status: PayoutStatus.AVAILABLE },
        data: { status: PayoutStatus.PROCESSING, requestedAt: new Date() },
      });
      if (res.count !== toRequest.length) throw new Error("CONFLICT");
      await applyWithdrawalChangeInTx(tx, changeOpts);
      await stampWithdrawalMetadata(tx, toRequest, {
        withdrawalGroupId,
        withdrawalGrossAmount: fees.grossAmount,
        withdrawalNetAmount: fees.netAmount,
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "CONFLICT") {
      return {
        ok: false,
        error: "Retrait déjà en cours, réessayez.",
        status: 409,
      };
    }
    throw err;
  }

  const sendResult = await sendCartevoWithdrawal({
    shopId: shop.id,
    withdrawalGroupId,
    payoutIds: toRequest,
    leadPayoutId: toRequest[0],
    netAmount: fees.netAmount,
    grossAmount: fees.grossAmount,
    country,
    operator,
    phone: payoutPhone,
    currency,
    feeCartevo: fees.cartevoCost,
    mode: "auto",
  });

  if (sendResult.outcome === "success") {
    sendWithdrawalEmail({
      shopId: shop.id,
      mode: "auto",
      netAmount: fees.netAmount,
      withdrawalFee: fees.withdrawalFee,
      currency: shop.currency,
      phone: payoutPhone,
    }).catch((e) =>
      safeLogger.error("[email withdrawal auto]", {
        error: e instanceof Error ? e.message : String(e),
      })
    );

    return {
      ok: true,
      mode: "auto",
      withdrawalGroupId,
      requestedAmount: amount,
      withdrawalFee: fees.withdrawalFee,
      withdrawalFeeRate: fees.withdrawalFeeRate,
      netAmount: fees.netAmount,
      isFree: fees.withdrawalFeeRate === 0,
      message:
        fees.withdrawalFeeRate === 0
          ? "Versement effectué. Chez Sellia, votre argent vous appartient — les retraits sont gratuits."
          : "Versement effectué. Vous recevez votre argent sous quelques minutes.",
    };
  }

  if (sendResult.outcome === "pending") {
    return {
      ok: true,
      mode: "auto",
      withdrawalGroupId,
      requestedAmount: amount,
      withdrawalFee: fees.withdrawalFee,
      withdrawalFeeRate: fees.withdrawalFeeRate,
      netAmount: fees.netAmount,
      message:
        "Versement en cours de traitement. Vous recevrez votre argent sous peu.",
    };
  }

  return {
    ok: false,
    error:
      "Le versement a échoué. Vos fonds restent disponibles, réessayez.",
    status: 502,
  };
}

/** Verrouille REQUESTED → PROCESSING (idempotent). Garde-fou #2 : count check. */
export async function lockWithdrawalGroupForProcessing(
  withdrawalGroupId: string
): Promise<
  | {
      ok: true;
      payoutIds: string[];
      shopId: string;
      netAmount: number;
      grossAmount: number;
      country: string;
      operator: string;
      phone: string;
      currency: string;
      feeCartevo: number;
    }
  | { ok: false; error: string }
> {
  const rows = await db.payout.findMany({
    where: { withdrawalGroupId },
  });

  if (rows.length === 0) {
    return { ok: false, error: "Demande de retrait introuvable." };
  }

  const allRequested = rows.every((r) => r.status === PayoutStatus.REQUESTED);
  if (!allRequested) {
    const anySuccess = rows.some((r) => r.status === PayoutStatus.SUCCESS);
    const anyProcessing = rows.some(
      (r) => r.status === PayoutStatus.PROCESSING
    );
    if (anySuccess) {
      return { ok: false, error: "Ce retrait a déjà été validé." };
    }
    if (anyProcessing) {
      return { ok: false, error: "Ce retrait est déjà en cours de traitement." };
    }
    return { ok: false, error: "Cette demande n'est plus en attente." };
  }

  const payoutIds = rows.map((r) => r.id);
  const shopId = rows[0].shopId;
  const grossAmount =
    rows[0].withdrawalGrossAmount != null
      ? Number(rows[0].withdrawalGrossAmount)
      : rows.reduce((s, r) => s + Number(r.amount), 0);
  const netAmount =
    rows[0].withdrawalNetAmount != null
      ? Number(rows[0].withdrawalNetAmount)
      : grossAmount -
        Math.round(
          grossAmount * (getMerchantWithdrawalFeeRate(rows[0].country) / 100)
        );

  const shop = await db.shop.findUnique({
    where: { id: shopId },
    select: {
      currency: true,
      payoutPhone: true,
      payoutOperator: true,
      payoutCountry: true,
      phone: true,
      country: true,
    },
  });
  if (!shop) return { ok: false, error: "Boutique introuvable." };

  const { country, operator, phone } = resolveWithdrawalDestination({
    id: shopId,
    ...shop,
  });
  if (!phone) return { ok: false, error: "Numéro Mobile Money non configuré." };

  const feeCartevo = Math.round(
    computePayoutFees({ requestedAmount: netAmount, country, operator })
      .cartevoFee
  );

  const res = await db.payout.updateMany({
    where: {
      withdrawalGroupId,
      status: PayoutStatus.REQUESTED,
    },
    data: { status: PayoutStatus.PROCESSING, processedAt: new Date() },
  });

  if (res.count !== payoutIds.length) {
    return { ok: false, error: "Conflit : la demande a déjà été traitée." };
  }

  return {
    ok: true,
    payoutIds,
    shopId,
    netAmount,
    grossAmount,
    country,
    operator,
    phone,
    currency: shop.currency ?? "XAF",
    feeCartevo,
  };
}

export async function approveWithdrawalGroup(
  withdrawalGroupId: string,
  adminId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const locked = await lockWithdrawalGroupForProcessing(withdrawalGroupId);
  if (!locked.ok) return locked;

  const sendResult = await sendCartevoWithdrawal({
    shopId: locked.shopId,
    withdrawalGroupId,
    payoutIds: locked.payoutIds,
    leadPayoutId: locked.payoutIds[0],
    netAmount: locked.netAmount,
    grossAmount: locked.grossAmount,
    country: locked.country,
    operator: locked.operator,
    phone: locked.phone,
    currency: locked.currency,
    feeCartevo: locked.feeCartevo,
    mode: "admin",
  });

  if (
    sendResult.outcome === "success" ||
    sendResult.outcome === "pending"
  ) {
    await db.payout.updateMany({
      where: { withdrawalGroupId },
      data: { reviewedBy: adminId, reviewedAt: new Date() },
    });

    sendWithdrawalEmail({
      shopId: locked.shopId,
      mode: sendResult.outcome === "success" ? "auto" : "pending",
      netAmount: locked.netAmount,
      withdrawalFee: locked.grossAmount - locked.netAmount,
      currency: locked.currency,
      phone: locked.phone,
    }).catch(() => {});

    return { ok: true };
  }

  return {
    ok: false,
    error:
      "Le versement a échoué. Les fonds ont été restitués au marchand.",
  };
}

export async function rejectWithdrawalGroup(
  withdrawalGroupId: string,
  adminId: string,
  reason?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const rows = await db.payout.findMany({
    where: { withdrawalGroupId },
  });
  if (rows.length === 0) {
    return { ok: false, error: "Demande de retrait introuvable." };
  }

  const allRequested = rows.every((r) => r.status === PayoutStatus.REQUESTED);
  if (!allRequested) {
    return { ok: false, error: "Seules les demandes en attente peuvent être rejetées." };
  }

  const res = await db.payout.updateMany({
    where: {
      withdrawalGroupId,
      status: PayoutStatus.REQUESTED,
    },
    data: {
      status: PayoutStatus.AVAILABLE,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: reason?.trim() || null,
      withdrawalGroupId: null,
      withdrawalGrossAmount: null,
      withdrawalNetAmount: null,
    },
  });

  if (res.count !== rows.length) {
    return { ok: false, error: "Conflit : la demande a déjà été traitée." };
  }

  return { ok: true };
}

/**
 * Backfill legacy REQUESTED sans withdrawalGroupId (heuristique shopId + requestedAt).
 * Appelé au chargement admin / première réconciliation.
 */
export async function backfillLegacyWithdrawalGroups(): Promise<{
  groupsCreated: number;
  hadLegacy: boolean;
}> {
  const legacy = await db.payout.findMany({
    where: {
      withdrawalGroupId: null,
      status: PayoutStatus.REQUESTED,
    },
    orderBy: [{ shopId: "asc" }, { requestedAt: "asc" }],
  });

  if (legacy.length === 0) {
    return { groupsCreated: 0, hadLegacy: false };
  }

  const buckets = new Map<string, typeof legacy>();
  for (const p of legacy) {
    const key = `${p.shopId}:${p.requestedAt.toISOString().slice(0, 19)}`;
    const arr = buckets.get(key) ?? [];
    arr.push(p);
    buckets.set(key, arr);
  }

  let groupsCreated = 0;
  for (const [, rows] of buckets) {
    const groupId = randomUUID();
    const gross = rows.reduce((s, r) => s + Number(r.amount), 0);
    const country = rows[0].country;
    const operator = rows[0].operator;
    const fees = computeWithdrawalFees(gross, country, operator);

    await db.payout.updateMany({
      where: { id: { in: rows.map((r) => r.id) } },
      data: {
        withdrawalGroupId: groupId,
        withdrawalGrossAmount: fees.grossAmount,
        withdrawalNetAmount: fees.netAmount,
      },
    });
    groupsCreated++;
  }

  safeLogger.warn("[withdrawal] legacy REQUESTED backfilled", {
    groupsCreated,
    payoutRows: legacy.length,
  });

  return { groupsCreated, hadLegacy: true };
}

/** Backfill cartevoTxId depuis description (legacy PROCESSING). */
export async function backfillCartevoTxIdFromDescription(
  payoutId: string,
  description: string | null
): Promise<string | null> {
  const parsed = parseCartevoTxIdFromDescription(description);
  if (!parsed) return null;
  await db.payout.update({
    where: { id: payoutId },
    data: { cartevoTxId: parsed },
  });
  return parsed;
}

export interface ReconcilePayoutsStats {
  scanned: number;
  successCount: number;
  failedRecredited: number;
  stillPending: number;
  manualReviewFlagged: number;
  skippedTerminal: number;
  errors: string[];
}

/**
 * Réconciliation verify-on-pull des retraits PROCESSING.
 * Garde-fou #1 : recrédit UNIQUEMENT sur FAILED/CANCELLED explicite.
 */
export async function reconcileProcessingWithdrawals(
  batchSize = RECONCILE_PAYOUT_BATCH_SIZE
): Promise<ReconcilePayoutsStats> {
  const stats: ReconcilePayoutsStats = {
    scanned: 0,
    successCount: 0,
    failedRecredited: 0,
    stillPending: 0,
    manualReviewFlagged: 0,
    skippedTerminal: 0,
    errors: [],
  };

  await backfillLegacyWithdrawalGroups();

  const groupedRaw = await db.payout.groupBy({
    by: ["withdrawalGroupId"],
    where: {
      status: PayoutStatus.PROCESSING,
      withdrawalGroupId: { not: null },
    },
    _min: { requestedAt: true },
  });

  const grouped = groupedRaw
    .sort(
      (a, b) =>
        (a._min.requestedAt?.getTime() ?? 0) -
        (b._min.requestedAt?.getTime() ?? 0)
    )
    .slice(0, batchSize);

  const legacySingles = await db.payout.findMany({
    where: {
      status: PayoutStatus.PROCESSING,
      withdrawalGroupId: null,
    },
    orderBy: { requestedAt: "asc" },
    take: Math.max(0, batchSize - grouped.length),
  });

  const groupsToProcess: {
    withdrawalGroupId: string | null;
    payoutIds: string[];
    netAmount: number;
    leadPayout: Payout;
  }[] = [];

  for (const g of grouped) {
    if (!g.withdrawalGroupId) continue;
    const groupRows = await db.payout.findMany({
      where: {
        withdrawalGroupId: g.withdrawalGroupId,
        status: PayoutStatus.PROCESSING,
      },
    });
    if (groupRows.length === 0) continue;
    const lead = groupRows[0];
    groupsToProcess.push({
      withdrawalGroupId: g.withdrawalGroupId,
      payoutIds: groupRows.map((r) => r.id),
      netAmount:
        lead.withdrawalNetAmount != null
          ? Number(lead.withdrawalNetAmount)
          : groupRows.reduce((s, r) => s + Number(r.netAmount), 0),
      leadPayout: lead,
    });
  }

  for (const p of legacySingles) {
    groupsToProcess.push({
      withdrawalGroupId: null,
      payoutIds: [p.id],
      netAmount:
        p.withdrawalNetAmount != null
          ? Number(p.withdrawalNetAmount)
          : Number(p.netAmount),
      leadPayout: p,
    });
  }

  stats.scanned = groupsToProcess.length;

  for (const group of groupsToProcess) {
    try {
      let cartevoTxId = group.leadPayout.cartevoTxId;

      if (!cartevoTxId) {
        cartevoTxId = await backfillCartevoTxIdFromDescription(
          group.leadPayout.id,
          group.leadPayout.description
        );
      }

      if (!cartevoTxId) {
        const age = Date.now() - group.leadPayout.requestedAt.getTime();
        if (age >= MANUAL_REVIEW_AFTER_MS) {
          await db.payout.updateMany({
            where: {
              id: { in: group.payoutIds },
              status: PayoutStatus.PROCESSING,
            },
            data: {
              manualReviewRequired: true,
              errorMessage:
                "Vérification manuelle requise : aucune référence Cartevo traçable.",
            },
          });
          stats.manualReviewFlagged++;
        } else {
          stats.stillPending++;
        }
        continue;
      }

      const verified = await verifyTransactionWithCartevo(cartevoTxId);

      if (!verified.found) {
        const age = Date.now() - group.leadPayout.requestedAt.getTime();
        if (age >= MANUAL_REVIEW_AFTER_MS) {
          await db.payout.updateMany({
            where: {
              id: { in: group.payoutIds },
              status: PayoutStatus.PROCESSING,
            },
            data: {
              manualReviewRequired: true,
              errorMessage:
                "Vérification manuelle requise : transaction introuvable chez Cartevo (404).",
            },
          });
          stats.manualReviewFlagged++;
        } else {
          stats.stillPending++;
        }
        continue;
      }

      const payoutCurrency = payoutCurrencyForCountry(group.leadPayout.country);
      const comparison = compareWithExpected(verified, {
        expectedAmount: group.netAmount,
        expectedCurrency: payoutCurrency,
      });

      if (!comparison.match) {
        stats.errors.push(
          `${cartevoTxId}: amount_mismatch (${comparison.reason})`
        );
        await db.payout.updateMany({
          where: { id: { in: group.payoutIds } },
          data: {
            manualReviewRequired: true,
            errorMessage: `Écart de montant Cartevo : ${comparison.reason}`,
          },
        });
        stats.manualReviewFlagged++;
        continue;
      }

      if (verified.status === "SUCCESS") {
        const stillProcessing = await db.payout.count({
          where: {
            id: { in: group.payoutIds },
            status: PayoutStatus.PROCESSING,
          },
        });
        if (stillProcessing === 0) {
          stats.skippedTerminal++;
          continue;
        }

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
              id: { in: group.payoutIds },
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
        stats.successCount++;
        continue;
      }

      if (verified.status === "FAILED" || verified.status === "CANCELLED") {
        const stillProcessing = await db.payout.count({
          where: {
            id: { in: group.payoutIds },
            status: PayoutStatus.PROCESSING,
          },
        });
        if (stillProcessing === 0) {
          stats.skippedTerminal++;
          continue;
        }

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
              id: { in: group.payoutIds },
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
        stats.failedRecredited++;
        continue;
      }

      stats.stillPending++;
    } catch (err) {
      if (err instanceof CartevoError) {
        stats.errors.push(
          `${group.leadPayout.id}: ${err.message}`
        );
      } else {
        stats.errors.push(
          `${group.leadPayout.id}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }

  return stats;
}

export interface WithdrawalGroupSummary {
  withdrawalGroupId: string;
  shopId: string;
  shopName: string;
  shopSlug: string;
  status: PayoutStatus;
  grossAmount: number;
  netAmount: number;
  payoutCount: number;
  requestedAt: Date;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  cartevoTxId: string | null;
  manualReviewRequired: boolean;
  errorMessage: string | null;
  legacyBackfill: boolean;
}

export async function listWithdrawalGroups(opts?: {
  statusFilter?: PayoutStatus[];
}): Promise<WithdrawalGroupSummary[]> {
  await backfillLegacyWithdrawalGroups();

  const statusFilter = opts?.statusFilter ?? [
    PayoutStatus.REQUESTED,
    PayoutStatus.PROCESSING,
  ];

  const rows = await db.payout.findMany({
    where: {
      withdrawalGroupId: { not: null },
      status: { in: statusFilter },
    },
    include: {
      shop: { select: { name: true, slug: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  const byGroup = new Map<string, typeof rows>();
  for (const r of rows) {
    const gid = r.withdrawalGroupId!;
    const arr = byGroup.get(gid) ?? [];
    arr.push(r);
    byGroup.set(gid, arr);
  }

  const summaries: WithdrawalGroupSummary[] = [];
  for (const [gid, groupRows] of byGroup) {
    const lead = groupRows[0];
    const gross =
      Number(lead.withdrawalGrossAmount) ||
      groupRows.reduce((s, r) => s + Number(r.amount), 0);
    const net =
      Number(lead.withdrawalNetAmount) ||
      groupRows.reduce((s, r) => s + Number(r.netAmount), 0);

    const statuses = new Set(groupRows.map((r) => r.status));
    let status: PayoutStatus = lead.status;
    if (statuses.has(PayoutStatus.PROCESSING)) status = PayoutStatus.PROCESSING;
    if (statuses.has(PayoutStatus.REQUESTED)) status = PayoutStatus.REQUESTED;

    summaries.push({
      withdrawalGroupId: gid,
      shopId: lead.shopId,
      shopName: lead.shop.name,
      shopSlug: lead.shop.slug,
      status,
      grossAmount: gross,
      netAmount: net,
      payoutCount: groupRows.length,
      requestedAt: lead.requestedAt,
      reviewedBy: lead.reviewedBy,
      reviewedAt: lead.reviewedAt,
      rejectionReason: lead.rejectionReason,
      cartevoTxId: lead.cartevoTxId,
      manualReviewRequired: groupRows.some((r) => r.manualReviewRequired),
      errorMessage: lead.errorMessage,
      legacyBackfill: !lead.withdrawalGrossAmount,
    });
  }

  return summaries.sort(
    (a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()
  );
}
