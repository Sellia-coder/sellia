import { db } from "@/lib/db";

export interface ShopAuthResult {
  authorized: boolean;
  shop?: {
    id: string;
    slug: string;
    name: string;
    plan: string;
    ownerId: string;
  };
  reason?: "no_session" | "not_owner" | "shop_not_found";
}

export async function verifyShopOwnership(
  userId: string | null | undefined,
  shopId: string
): Promise<ShopAuthResult> {
  if (!userId) return { authorized: false, reason: "no_session" };

  const shop = await db.shop.findUnique({
    where: { id: shopId },
    select: { id: true, slug: true, name: true, plan: true, ownerId: true },
  });

  if (!shop) return { authorized: false, reason: "shop_not_found" };
  if (shop.ownerId !== userId) return { authorized: false, reason: "not_owner" };

  return { authorized: true, shop };
}

export async function verifyShopOwnershipBySlug(
  userId: string | null | undefined,
  slug: string
): Promise<ShopAuthResult> {
  if (!userId) return { authorized: false, reason: "no_session" };

  const shop = await db.shop.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, plan: true, ownerId: true },
  });

  if (!shop) return { authorized: false, reason: "shop_not_found" };
  if (shop.ownerId !== userId) return { authorized: false, reason: "not_owner" };

  return { authorized: true, shop };
}
