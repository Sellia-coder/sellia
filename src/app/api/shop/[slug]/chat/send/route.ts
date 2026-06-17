import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v3";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import { analyzeChatMessage } from "@/lib/chat/anti-fraud";
import {
  CHAT_BLOCKED_CUSTOMER_MESSAGE,
  CHAT_FLAGGED_MERCHANT_PREVIEW,
  CHAT_MAX_MESSAGE_LENGTH,
} from "@/lib/chat/constants";
import {
  getPublishedShopIdBySlug,
  verifyVisitorConversation,
} from "@/lib/chat/shop-access";

const sendSchema = z.object({
  conversationId: z.string().min(1),
  visitorToken: z.string().min(16),
  content: z.string().trim().min(1).max(CHAT_MAX_MESSAGE_LENGTH),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(request.headers);
  const ipLimit = rateLimit(
    `chat_send_ip:${ip}`,
    RATE_LIMITS.CHAT_SEND_PER_IP.limit,
    RATE_LIMITS.CHAT_SEND_PER_IP.windowMs
  );
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: "Trop de messages" }, { status: 429 });
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

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Message invalide" }, { status: 400 });
  }

  const { conversationId, visitorToken, content } = parsed.data;

  const convLimit = rateLimit(
    `chat_send_conv:${conversationId}`,
    RATE_LIMITS.CHAT_SEND_PER_CONV.limit,
    RATE_LIMITS.CHAT_SEND_PER_CONV.windowMs
  );
  if (!convLimit.allowed) {
    return NextResponse.json({ error: "Trop de messages" }, { status: 429 });
  }

  const conversation = await verifyVisitorConversation(
    shop.id,
    conversationId,
    visitorToken
  );
  if (!conversation) {
    return NextResponse.json({ error: "Conversation introuvable" }, { status: 403 });
  }

  const fraud = analyzeChatMessage(content);

  if (fraud.blocked) {
    await db.$transaction(async (tx) => {
      await tx.chatMessage.create({
        data: {
          conversationId,
          sender: "CUSTOMER",
          content: CHAT_FLAGGED_MERCHANT_PREVIEW,
          flagged: true,
          blockedReason: fraud.reason,
        },
      });
      await tx.chatConversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: CHAT_FLAGGED_MERCHANT_PREVIEW,
          unreadForMerchant: { increment: 1 },
        },
      });
    });

    return NextResponse.json({
      ok: false,
      blocked: true,
      warning: CHAT_BLOCKED_CUSTOMER_MESSAGE,
      reason: fraud.reason,
    });
  }

  const message = await db.$transaction(async (tx) => {
    const created = await tx.chatMessage.create({
      data: {
        conversationId,
        sender: "CUSTOMER",
        content,
        flagged: false,
      },
      select: {
        id: true,
        content: true,
        sender: true,
        flagged: true,
        deliveredAt: true,
        readAt: true,
        createdAt: true,
      },
    });
    await tx.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: content.slice(0, 200),
        unreadForMerchant: { increment: 1 },
      },
    });
    return created;
  });

  return NextResponse.json({
    ok: true,
    message: {
      id: message.id,
      content: message.content,
      sender: "customer",
      flagged: message.flagged,
      deliveredAt: message.deliveredAt?.toISOString() ?? null,
      readAt: message.readAt?.toISOString() ?? null,
      createdAt: message.createdAt.toISOString(),
    },
  });
}
