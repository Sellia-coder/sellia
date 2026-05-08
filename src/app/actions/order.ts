"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  generateOrderNumber,
  parseShippingZones,
  shopHasPhysicalProducts,
} from "@/lib/shop-data";

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99),
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
  paymentMethod: z.enum(["cash_on_delivery", "online_escrow"]),
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

  if (data.paymentMethod === "cash_on_delivery" && !shop.paymentCashOnDelivery) {
    return { ok: false, error: "Paiement à la livraison non disponible" } as const;
  }
  if (data.paymentMethod === "online_escrow" && !shop.paymentOnlineEscrow) {
    return { ok: false, error: "Paiement en ligne non disponible" } as const;
  }

  if (shop.products.length === 0) {
    return { ok: false, error: "Aucun produit valide" } as const;
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
  const total = subtotal + shippingPrice;

  const paymentStatus =
    data.paymentMethod === "online_escrow" ? "pending_payment" : "pending";

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
        items: itemsSnapshot.map(({ type: _t, ...row }) => row) as any,
        subtotal,
        shippingPrice,
        shippingZone: shippingZoneName,
        shippingEta: shippingEta,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus,
        status: "pending",
      },
    });

    revalidatePath(`/shop/${shop.slug}`);

    return {
      ok: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        whatsappNumber: shop.whatsappNumber,
        shopName: shop.name,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      },
    } as const;
  } catch (e) {
    console.error("[createOrderAction]", e);
    return {
      ok: false,
      error: "Une erreur est survenue. Réessaye dans un instant.",
    } as const;
  }
}
