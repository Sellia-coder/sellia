import { db } from "@/lib/db";
import { PAID_PAYMENT_STATUSES } from "@/lib/dashboard/customer-insights";
import { normalizeCustomerEmail } from "@/lib/shop-customer/session";

export async function getShopBySlugForCustomer(slug: string) {
  const shop = await db.shop.findFirst({
    where: { slug: slug.trim().toLowerCase(), status: "published", isPublished: true },
    select: { id: true, slug: true, name: true, currency: true },
  });
  return shop;
}

export async function customerHasOrdersInShop(
  shopId: string,
  email: string
): Promise<boolean> {
  const normalized = normalizeCustomerEmail(email);
  const count = await db.order.count({
    where: {
      shopId,
      customerEmail: { equals: normalized, mode: "insensitive" },
      paymentStatus: { in: [...PAID_PAYMENT_STATUSES] },
    },
  });
  return count > 0;
}

export async function getCustomerOrdersForShop(
  shopId: string,
  email: string,
  limit = 20
) {
  const normalized = normalizeCustomerEmail(email);
  return db.order.findMany({
    where: {
      shopId,
      customerEmail: { equals: normalized, mode: "insensitive" },
      paymentStatus: { in: [...PAID_PAYMENT_STATUSES] },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      total: true,
      paymentStatus: true,
      status: true,
      createdAt: true,
      disputes: {
        select: {
          id: true,
          status: true,
          reason: true,
          createdAt: true,
          merchantResponse: true,
          adminResolution: true,
          resolvedAt: true,
        },
      },
    },
  });
}

export async function verifyCustomerOwnsOrder(
  shopId: string,
  email: string,
  orderId: string
): Promise<boolean> {
  const normalized = normalizeCustomerEmail(email);
  const order = await db.order.findFirst({
    where: {
      id: orderId,
      shopId,
      customerEmail: { equals: normalized, mode: "insensitive" },
      paymentStatus: { in: [...PAID_PAYMENT_STATUSES] },
    },
    select: { id: true },
  });
  return Boolean(order);
}
