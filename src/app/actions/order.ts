"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v3";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import {
  generateOrderNumber,
  parseShippingZones,
  shopHasPhysicalProducts,
} from "@/lib/shop-data";
import {
  cartevoOperatorSchema,
  cartevoCountrySchema,
  validatePhoneForCountry,
} from "@/lib/cartevo/validation";
import {
  normalizePhoneNumber,
  getCountryInfo,
} from "@/lib/cartevo/operators-catalog";
import { initOrderCollect } from "@/lib/cartevo/order-collect";
import type { FeeMode, SelliaPlan } from "@/lib/cartevo/pricing";
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  PAYMENT_METHOD,
} from "@/lib/cartevo/order-status";
import { safeLogger } from "@/lib/security/redact";
import type { Prisma } from "@prisma/client";

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99),
});

const moMoSchema = z.object({
  country: cartevoCountrySchema,
  operator: cartevoOperatorSchema,
  phoneNumber: z.string().min(8).max(20),
});

const createOrderSchema = z.object({
  shopSlug: z.string().min(1),
  customerName: z.string().min(2, "Nom complet requis").max(100),
  customerPhone: z
    .string()
    .regex(/^\+?[0-9\s]{8,20}$/, "Téléphone invalide")
    .max(20),
  customerEmail: z
    .union([z.literal(""), z.string().email("Email invalide")])
    .optional(),
  customerCity: z.string().max(60).optional().or(z.literal("")),
  customerAddress: z.string().max(300).optional().or(z.literal("")),
  customerNotes: z.string().max(500).optional().or(z.literal("")),

  items: z.array(orderItemSchema).min(1, "Aucun produit dans la commande"),

  shippingZoneId: z.string().optional(),

  paymentMethod: z.enum([
    PAYMENT_METHOD.CASH_ON_DELIVERY,
    PAYMENT_METHOD.ONLINE_MOBILE_MONEY,
    PAYMENT_METHOD.ONLINE_ESCROW,
  ]),

  moMo: moMoSchema.optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export async function createOrderAction(input: CreateOrderInput) {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides",
      issues: parsed.error.flatten(),
    } as const;
  }
  const data = parsed.data;

  let effectivePaymentMethod = data.paymentMethod;
  if (effectivePaymentMethod === PAYMENT_METHOD.ONLINE_ESCROW) {
    effectivePaymentMethod = PAYMENT_METHOD.ONLINE_MOBILE_MONEY;
  }

  if (
    effectivePaymentMethod === PAYMENT_METHOD.ONLINE_MOBILE_MONEY &&
    !data.moMo
  ) {
    return {
      ok: false,
      error: "Informations Mobile Money manquantes (pays, opérateur, numéro)",
    } as const;
  }

  const shop = await db.shop.findUnique({
    where: { slug: data.shopSlug.toLowerCase() },
    include: {
      products: {
        where: {
          id: { in: data.items.map((i) => i.productId) },
          status: "active",
        },
      },
    },
  });

  if (!shop || shop.status !== "published" || !shop.isPublished) {
    return { ok: false, error: "Boutique introuvable" } as const;
  }

  if (
    effectivePaymentMethod === PAYMENT_METHOD.CASH_ON_DELIVERY &&
    !shop.paymentCashOnDelivery
  ) {
    return { ok: false, error: "Paiement à la livraison non disponible" } as const;
  }
  if (
    effectivePaymentMethod === PAYMENT_METHOD.CASH_ON_DELIVERY &&
    shop.plan !== "pro"
  ) {
    return {
      ok: false,
      error: "Paiement à la livraison réservé aux boutiques Pro",
    } as const;
  }
  if (
    effectivePaymentMethod === PAYMENT_METHOD.ONLINE_MOBILE_MONEY &&
    !shop.paymentOnlineEscrow
  ) {
    return { ok: false, error: "Paiement en ligne non disponible" } as const;
  }

  if (shop.products.length === 0) {
    return { ok: false, error: "Aucun produit valide" } as const;
  }

  if (effectivePaymentMethod === PAYMENT_METHOD.ONLINE_MOBILE_MONEY && data.moMo) {
    const countryInfo = getCountryInfo(data.moMo.country);
    if (!countryInfo) {
      return { ok: false, error: "Pays non supporté" } as const;
    }
    const operatorExists = countryInfo.operators.some(
      (op) => op.code === data.moMo!.operator
    );
    if (!operatorExists) {
      return {
        ok: false,
        error: `Opérateur ${data.moMo.operator} non disponible au ${countryInfo.name}`,
      } as const;
    }
  }

  const itemsSnapshot = data.items
    .map((i) => {
      const product = shop.products.find((p) => p.id === i.productId);
      if (!product) return null;
      return {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity: i.quantity,
        imageUrl: product.imageUrl,
        emoji: product.emoji,
        type: product.type,
      };
    })
    .filter(Boolean) as Array<{
    productId: string;
    slug: string | null;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
    emoji: string | null;
    type: string;
  }>;

  if (itemsSnapshot.length === 0) {
    return { ok: false, error: "Aucun produit valide" } as const;
  }

  let shippingPrice = 0;
  let shippingZoneName: string | null = null;
  let shippingEta: string | null = null;

  const zones = parseShippingZones(shop.shippingZones);
  const orderLineProducts = shop.products.filter((p) =>
    itemsSnapshot.some((i) => i.productId === p.id)
  );
  const hasPhysicalInOrder = shopHasPhysicalProducts(orderLineProducts);

  if (hasPhysicalInOrder && zones.length > 0) {
    const zone = data.shippingZoneId
      ? zones.find((z) => z.id === data.shippingZoneId)
      : null;
    const chosen = zone ?? zones[0];
    if (chosen) {
      shippingPrice = chosen.price ?? 0;
      shippingZoneName = chosen.name ?? null;
      shippingEta = chosen.eta ?? null;
    }
  }

  const subtotal = itemsSnapshot.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const baseTotal = subtotal + shippingPrice;

  const firstProduct = shop.products.find(
    (p) => p.id === itemsSnapshot[0]?.productId
  );
  const orderFeeMode = (firstProduct?.feeMode ??
    "merchant_absorbs") as FeeMode;

  const qrCode = randomBytes(8).toString("hex").toUpperCase();

  const initialPaymentStatus = PAYMENT_STATUS.PENDING;
  const initialOrderStatus = ORDER_STATUS.PENDING;

  try {
    const order = await db.order.create({
      data: {
        shopId: shop.id,
        orderNumber: generateOrderNumber(),
        customerName: data.customerName,
        customerPhone: data.customerPhone.replace(/\s/g, ""),
        customerEmail: data.customerEmail?.trim() || null,
        customerCity: data.customerCity?.trim() || null,
        customerAddress: data.customerAddress?.trim() || null,
        customerNotes: data.customerNotes?.trim() || null,
        items: itemsSnapshot.map(({ type: _t, ...row }) => row) as Prisma.InputJsonValue,
        subtotal,
        shippingPrice,
        shippingZone: shippingZoneName,
        shippingEta,
        total: baseTotal,
        feeMode: orderFeeMode,
        paymentMethod: effectivePaymentMethod,
        paymentSubMethod:
          effectivePaymentMethod === PAYMENT_METHOD.ONLINE_MOBILE_MONEY
            ? data.moMo?.operator
            : null,
        paymentProvider:
          effectivePaymentMethod === PAYMENT_METHOD.ONLINE_MOBILE_MONEY
            ? "cartevo"
            : null,
        paymentStatus: initialPaymentStatus,
        status: initialOrderStatus,
        qrCode,
      },
    });

    safeLogger.info("Order created", {
      orderNumber: order.orderNumber,
      shopId: shop.id,
      paymentMethod: effectivePaymentMethod,
      total: baseTotal,
      feeMode: orderFeeMode,
    });

    if (
      effectivePaymentMethod === PAYMENT_METHOD.ONLINE_MOBILE_MONEY &&
      data.moMo
    ) {
      const normalizedPhone = normalizePhoneNumber(
        data.moMo.phoneNumber,
        data.moMo.country
      );

      if (!validatePhoneForCountry(normalizedPhone, data.moMo.country)) {
        await db.order.delete({ where: { id: order.id } });
        return {
          ok: false,
          error: "Format du numéro de téléphone invalide pour ce pays",
        } as const;
      }

      const countryInfo = getCountryInfo(data.moMo.country)!;

      const shopPlan = (["free", "pro", "business"].includes(shop.plan)
        ? shop.plan
        : "free") as SelliaPlan;

      const collectResult = await initOrderCollect({
        orderId: order.id,
        shopId: shop.id,
        baseAmount: baseTotal,
        currency: countryInfo.currency,
        country: data.moMo.country,
        operator: data.moMo.operator,
        phoneNumber: normalizedPhone,
        shopPlan,
        feeMode: orderFeeMode,
      });

      if (!collectResult.ok) {
        await db.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PAYMENT_STATUS.FAILED,
            status: ORDER_STATUS.FAILED,
          },
        });
        return {
          ok: false,
          error: collectResult.error || "Échec d'initialisation du paiement",
          orderNumber: order.orderNumber,
        } as const;
      }

      revalidatePath(`/shop/${shop.slug}`);

      const refreshed = await db.order.findUnique({
        where: { id: order.id },
        select: { total: true },
      });

      return {
        ok: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: refreshed?.total ?? order.total,
          paymentMethod: order.paymentMethod,
          paymentStatus: PAYMENT_STATUS.AWAITING_CONFIRMATION,
          qrCode: order.qrCode,
          whatsappNumber: shop.whatsappNumber,
          shopName: shop.name,
          requiresConfirmation: true,
          cartevoTransactionId: collectResult.cartevoTransactionId,
          operatorCode: data.moMo.operator,
          country: data.moMo.country,
          customerPays: collectResult.customerPays,
        },
      } as const;
    }

    revalidatePath(`/shop/${shop.slug}`);

    return {
      ok: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        qrCode: order.qrCode,
        whatsappNumber: shop.whatsappNumber,
        shopName: shop.name,
        requiresConfirmation: false,
      },
    } as const;
  } catch (e) {
    safeLogger.error("createOrderAction failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    return {
      ok: false,
      error: "Une erreur est survenue. Réessaye dans un instant.",
    } as const;
  }
}
