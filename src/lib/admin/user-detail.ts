import { db } from "@/lib/db";
import { gmvByShopIds } from "@/lib/admin/metrics";
import { ADMIN_PAID_PAYMENT_STATUSES } from "@/lib/admin/constants";

export async function getAdminUserDetail(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isBlocked: true,
      blockedAt: true,
      createdAt: true,
      lastLoginAt: true,
      shops: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          name: true,
          plan: true,
          isPublished: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) return null;

  const shop = user.shops[0] ?? null;
  let orderCount = 0;
  let gmv = 0;
  let lastPaymentAt: Date | null = null;

  if (shop) {
    const [count, gmvMap, lastOrder] = await Promise.all([
      db.order.count({
        where: {
          shopId: shop.id,
          paymentStatus: { in: [...ADMIN_PAID_PAYMENT_STATUSES] },
        },
      }),
      gmvByShopIds([shop.id]),
      db.order.findFirst({
        where: {
          shopId: shop.id,
          paymentStatus: { in: [...ADMIN_PAID_PAYMENT_STATUSES] },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);
    orderCount = count;
    gmv = gmvMap[shop.id] ?? 0;
    lastPaymentAt = lastOrder?.createdAt ?? null;
  }

  return {
    user,
    shop,
    stats: {
      orderCount,
      gmv,
      lastPaymentAt,
    },
  };
}
