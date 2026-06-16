import { db } from "@/lib/db";

export async function getPublishedShopIdBySlug(slug: string) {
  const shop = await db.shop.findFirst({
    where: {
      slug: slug.toLowerCase(),
      status: "published",
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
      primaryColor: true,
      accentColor: true,
    },
  });
  return shop;
}

export async function verifyVisitorConversation(
  shopId: string,
  conversationId: string,
  visitorToken: string
) {
  return db.chatConversation.findFirst({
    where: {
      id: conversationId,
      shopId,
      visitorToken,
      status: "OPEN",
    },
    select: { id: true, customerName: true },
  });
}
