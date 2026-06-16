import { db } from "@/lib/db";
import { Prisma, PayoutStatus, PayoutType } from "@prisma/client";
import { type OrderItem } from "@/lib/order-status";
import { PAYMENT_STATUS, ORDER_STATUS } from "@/lib/cartevo/order-status";
import { sendDeliveryCodeEmail } from "@/lib/email/delivery-code";
import { getSelliaRate, type SelliaPlan } from "@/lib/cartevo/pricing";
import { refreshMoneyConfigCache } from "@/lib/admin/money-config";

interface CreatePayoutInput {
  orderId: string;
  payoutType: PayoutType;
  releaseImmediately?: boolean;
}

type PayoutKind = "physical" | "digital" | "service";

function selliaCommissionRate(plan: string): number {
  const key = (plan === "pro" || plan === "business" ? plan : "free") as SelliaPlan;
  return getSelliaRate(key);
}

function normalizePayoutKind(t?: string | null): PayoutKind {
  return t === "digital" || t === "service" ? t : "physical";
}

function payoutTypeToKind(payoutType: PayoutType): PayoutKind {
  if (payoutType === PayoutType.ORDER_DIGITAL) return "digital";
  if (payoutType === PayoutType.ORDER_SERVICE) return "service";
  return "physical";
}

interface PayoutPortion {
  gross: number;
  commission: number;
  shipping: number;
  amount: number;
}

/**
 * Splitte le payout d'une commande PAR TYPE en préservant strictement l'invariant
 * money : la SOMME des portions == le payout unique d'avant.
 *
 * Formule unique (auditée) :
 *   G = order.total − shippingPrice            (gross hors livraison, remise déduite)
 *   C = round(G × rate/100)                    (commission Sellia)
 *   M = G − C + shippingPrice                  (montant marchand total)
 *
 * Répartition :
 *   - G est alloué proportionnellement au sous-total brut de chaque type
 *     (gère correctement une éventuelle remise coupon : on répartit G, pas le brut).
 *   - Le shipping va entièrement au type PHYSIQUE (sinon au dernier type présent).
 *   - Le type "absorbeur" (physique si présent, sinon dernier) prend le RESTE exact
 *     (gross + commission) pour garantir somme(portions) == M au FCFA près.
 */
function computePayoutSplit(opts: {
  items: OrderItem[];
  total: number;
  shippingPrice: number;
  commissionRate: number;
}): Record<PayoutKind, PayoutPortion> {
  const { items, total, shippingPrice, commissionRate } = opts;

  const rawByKind: Record<PayoutKind, number> = {
    physical: 0,
    digital: 0,
    service: 0,
  };
  for (const it of items) {
    const k = normalizePayoutKind(it.type as string | undefined);
    rawByKind[k] += Number(it.price) * Number(it.quantity ?? 1);
  }
  const S = rawByKind.physical + rawByKind.digital + rawByKind.service;

  const G = total - shippingPrice;
  const C = Math.round((G * commissionRate) / 100);

  const order: PayoutKind[] = ["digital", "service", "physical"];
  const present = order.filter((k) => rawByKind[k] > 0);

  const result: Record<PayoutKind, PayoutPortion> = {
    physical: { gross: 0, commission: 0, shipping: 0, amount: 0 },
    digital: { gross: 0, commission: 0, shipping: 0, amount: 0 },
    service: { gross: 0, commission: 0, shipping: 0, amount: 0 },
  };

  if (present.length === 0) return result;

  // Absorbeur : physique si présent, sinon le dernier type présent.
  const absorber: PayoutKind = present.includes("physical")
    ? "physical"
    : present[present.length - 1];

  let allocatedGross = 0;
  let allocatedCommission = 0;

  for (const k of present) {
    if (k === absorber) continue;
    const gross = S > 0 ? Math.round((G * rawByKind[k]) / S) : 0;
    const commission = Math.round((gross * commissionRate) / 100);
    result[k] = { gross, commission, shipping: 0, amount: gross - commission };
    allocatedGross += gross;
    allocatedCommission += commission;
  }

  // L'absorbeur prend le reste exact (+ tout le shipping).
  const gross = G - allocatedGross;
  const commission = C - allocatedCommission;
  result[absorber] = {
    gross,
    commission,
    shipping: shippingPrice,
    amount: gross - commission + shippingPrice,
  };

  return result;
}

function resolvePayoutDestination(shop: {
  payoutPhone: string | null;
  payoutOperator: string | null;
  payoutCountry: string | null;
  phone: string | null;
  country: string | null;
}) {
  return {
    phoneNumber: shop.payoutPhone || shop.phone || "0000000000",
    operator: shop.payoutOperator || "mtn",
    country: shop.payoutCountry || shop.country || "CM",
  };
}

/**
 * Crée un Payout pour UN type donné d'une commande, avec le montant de la PORTION
 * correspondante (split par type). Idempotent par (orderId, payoutType).
 *
 * La somme des portions de tous les types présents == le payout unique d'avant
 * (cf. computePayoutSplit, invariant money strict).
 */
export async function createPayoutFromOrder(input: CreatePayoutInput) {
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    include: {
      shop: {
        select: {
          id: true,
          plan: true,
          currency: true,
          payoutPhone: true,
          payoutOperator: true,
          payoutCountry: true,
          phone: true,
          country: true,
        },
      },
    },
  });

  if (!order) return null;

  // Idempotence stricte sur (orderId, payoutType).
  const existing = await db.payout.findUnique({
    where: {
      orderId_payoutType: {
        orderId: input.orderId,
        payoutType: input.payoutType,
      },
    },
  });
  if (existing) return existing;

  await refreshMoneyConfigCache();

  const plan = order.shop.plan || "free";
  const commissionRate = selliaCommissionRate(plan);

  const split = computePayoutSplit({
    items: order.items as unknown as OrderItem[],
    total: order.total,
    shippingPrice: order.shippingPrice,
    commissionRate,
  });

  const targetKind = payoutTypeToKind(input.payoutType);
  const portion = split[targetKind];

  const merchantAmount = portion.amount;
  const grossAmount = portion.gross;
  const commissionAmount = portion.commission;

  const initialStatus = input.releaseImmediately
    ? PayoutStatus.AVAILABLE
    : PayoutStatus.PENDING_ESCROW;

  const releasedAt = input.releaseImmediately ? new Date() : null;
  const dest = resolvePayoutDestination(order.shop);

  const payout = await db.payout.create({
    data: {
      shopId: order.shop.id,
      orderId: order.id,
      payoutType: input.payoutType,
      amount: new Prisma.Decimal(merchantAmount),
      grossAmount: new Prisma.Decimal(grossAmount),
      commissionRate: new Prisma.Decimal(commissionRate),
      commissionAmount: new Prisma.Decimal(commissionAmount),
      feeCartevo: new Prisma.Decimal(0),
      netAmount: new Prisma.Decimal(merchantAmount),
      currency: order.shop.currency || "XAF",
      operator: dest.operator,
      country: dest.country,
      phoneNumber: dest.phoneNumber,
      status: initialStatus,
      releasedAt,
      description: `Vente commande ${order.orderNumber} (${targetKind})`,
    },
  });

  return payout;
}

/**
 * G4.B — Règle le payout d'une commande dès la confirmation du paiement (PAID_ESCROW).
 *
 * - Digital / Service : libération INSTANTANÉE (payout AVAILABLE) + commande paid_released.
 * - Physique / Mixte  : payout en escrow (PENDING_ESCROW) + envoi du code de livraison au client.
 *
 * 100% IDEMPOTENT : peut être appelé depuis plusieurs chemins de confirmation
 * (webhook Cartevo, polling status, balance-delta, reconcile admin) sans double
 * création de payout, double email, ni double libération. L'ancre d'idempotence
 * est le Payout unique par orderId.
 */
export async function settlePaidOrderPayout(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      items: true,
      paymentStatus: true,
      deliveredAt: true,
    },
  });

  if (!order) return;
  // Ne régler que les commandes confirmées en escrow (garde anti-rejeu).
  if (order.paymentStatus !== PAYMENT_STATUS.PAID_ESCROW) return;

  const items = order.items as unknown as OrderItem[];

  // Types DISTINCTS présents dans le panier.
  const kinds = new Set(items.map((it) => normalizePayoutKind(it.type as string | undefined)));
  const hasPhysical = kinds.has("physical");

  const typeMap: { kind: PayoutKind; payoutType: PayoutType; instant: boolean }[] = [
    { kind: "digital", payoutType: PayoutType.ORDER_DIGITAL, instant: true },
    { kind: "service", payoutType: PayoutType.ORDER_SERVICE, instant: true },
    { kind: "physical", payoutType: PayoutType.ORDER_PHYSICAL, instant: false },
  ];

  // Pour chaque type présent : créer le payout correspondant (idempotent par (orderId, type)).
  // - digital / service : libérés INSTANTANÉMENT (AVAILABLE).
  // - physique : escrow (PENDING_ESCROW), libéré à la confirmation de livraison.
  let physicalCreated = false;

  for (const t of typeMap) {
    if (!kinds.has(t.kind)) continue;
    const existing = await db.payout
      .findUnique({
        where: {
          orderId_payoutType: { orderId, payoutType: t.payoutType },
        },
        select: { id: true },
      })
      .catch(() => null);
    if (!existing) {
      await createPayoutFromOrder({
        orderId,
        payoutType: t.payoutType,
        releaseImmediately: t.instant,
      });
      if (t.kind === "physical") physicalCreated = true;
    }
  }

  if (!hasPhysical) {
    // 100% digital/service → tout est libéré, la commande passe à "libéré".
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PAYMENT_STATUS.PAID_RELEASED,
        status: ORDER_STATUS.DELIVERED,
        deliveredAt: order.deliveredAt ?? new Date(),
      },
    });
  } else if (physicalCreated) {
    // Présence de physique → la commande RESTE paid_escrow (le digital/service est
    // déjà AVAILABLE via son propre payout). On envoie le code de livraison pour la
    // partie physique, une seule fois (garde : payout physique fraîchement créé).
    await sendDeliveryCodeEmail(orderId);
  }
}

export async function releasePayout(payoutId: string) {
  const payout = await db.payout.findUnique({ where: { id: payoutId } });
  if (!payout) return null;
  if (payout.status !== PayoutStatus.PENDING_ESCROW) return payout;

  return db.payout.update({
    where: { id: payoutId },
    data: {
      status: PayoutStatus.AVAILABLE,
      releasedAt: new Date(),
    },
  });
}

export interface ShopBalances {
  available: number;
  pendingEscrow: number;
  inProgress: number;
  paidTotal: number;
  refunded: number;
}

export async function getShopBalances(shopId: string): Promise<ShopBalances> {
  const payouts = await db.payout.findMany({
    where: { shopId },
    select: { status: true, amount: true },
  });

  const sum = (filter: (p: (typeof payouts)[number]) => boolean) =>
    payouts
      .filter(filter)
      .reduce((acc, p) => acc + Number(p.amount), 0);

  return {
    available: sum((p) => p.status === PayoutStatus.AVAILABLE),
    pendingEscrow: sum((p) => p.status === PayoutStatus.PENDING_ESCROW),
    inProgress: sum(
      (p) =>
        p.status === PayoutStatus.REQUESTED ||
        p.status === PayoutStatus.PROCESSING ||
        p.status === PayoutStatus.PENDING
    ),
    paidTotal: sum(
      (p) =>
        p.status === PayoutStatus.PAID || p.status === PayoutStatus.SUCCESS
    ),
    refunded: sum(
      (p) =>
        p.status === PayoutStatus.REFUNDED ||
        p.status === PayoutStatus.CANCELLED
    ),
  };
}
