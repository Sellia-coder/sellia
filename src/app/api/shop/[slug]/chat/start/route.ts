import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v3";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import { generateVisitorToken } from "@/lib/chat/visitor-token";
import { getPublishedShopIdBySlug } from "@/lib/chat/shop-access";

const startSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  customerEmail: z
    .union([z.literal(""), z.string().email()])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  conversationId: z.string().optional(),
  visitorToken: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(
    `chat_start:${ip}`,
    RATE_LIMITS.CHAT_START_PER_IP.limit,
    RATE_LIMITS.CHAT_START_PER_IP.windowMs
  );
  if (!limit.allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const { slug } = await params;
  const shop = await getPublishedShopIdBySlug(slug);
  if (!shop) {
    return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const data = parsed.data;

  if (data.conversationId && data.visitorToken) {
    const existing = await db.chatConversation.findFirst({
      where: {
        id: data.conversationId,
        shopId: shop.id,
        visitorToken: data.visitorToken,
        status: "OPEN",
      },
      select: {
        id: true,
        visitorToken: true,
        customerName: true,
        customerEmail: true,
      },
    });
    if (existing) {
      return NextResponse.json({
        ok: true,
        conversationId: existing.id,
        visitorToken: existing.visitorToken,
        customerName: existing.customerName,
        shopName: shop.name,
        shopLogoUrl: shop.logoUrl,
        primaryColor: shop.primaryColor ?? shop.accentColor ?? "#E84B1F",
        resumed: true,
      });
    }
  }

  let customerId: string | null = null;
  if (data.customerEmail) {
    const customer = await db.customer.findFirst({
      where: {
        shopId: shop.id,
        email: { equals: data.customerEmail, mode: "insensitive" },
      },
      select: { id: true },
    });
    customerId = customer?.id ?? null;
  }

  const visitorToken = generateVisitorToken();
  const conversation = await db.chatConversation.create({
    data: {
      shopId: shop.id,
      customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail ?? null,
      visitorToken,
      status: "OPEN",
    },
    select: {
      id: true,
      visitorToken: true,
      customerName: true,
    },
  });

  return NextResponse.json({
    ok: true,
    conversationId: conversation.id,
    visitorToken: conversation.visitorToken,
    customerName: conversation.customerName,
    shopName: shop.name,
    shopLogoUrl: shop.logoUrl,
    primaryColor: shop.primaryColor ?? shop.accentColor ?? "#E84B1F",
    resumed: false,
  });
}
