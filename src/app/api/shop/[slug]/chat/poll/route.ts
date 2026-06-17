import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import {
  getPublishedShopIdBySlug,
  verifyVisitorConversation,
} from "@/lib/chat/shop-access";
import {
  getChatOutboundReceipts,
  markChatInboundDelivered,
  markChatInboundRead,
} from "@/lib/chat/receipts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(
    `chat_poll:${ip}`,
    RATE_LIMITS.CHAT_POLL_PER_IP.limit,
    RATE_LIMITS.CHAT_POLL_PER_IP.windowMs
  );
  if (!limit.allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const { slug } = await params;
  const shop = await getPublishedShopIdBySlug(slug);
  if (!shop) {
    return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
  }

  const conversationId = request.nextUrl.searchParams.get("conversationId");
  const visitorToken = request.nextUrl.searchParams.get("visitorToken");
  const since = request.nextUrl.searchParams.get("since");
  const markRead = request.nextUrl.searchParams.get("markRead") === "1";

  if (!conversationId || !visitorToken) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const conversation = await verifyVisitorConversation(
    shop.id,
    conversationId,
    visitorToken
  );
  if (!conversation) {
    return NextResponse.json({ error: "Conversation introuvable" }, { status: 403 });
  }

  await markChatInboundDelivered(conversationId, "CUSTOMER");
  if (markRead) {
    await markChatInboundRead(conversationId, "CUSTOMER");
  }

  const sinceDate = since ? new Date(since) : null;
  const where =
    sinceDate && !Number.isNaN(sinceDate.getTime())
      ? { conversationId, createdAt: { gt: sinceDate } }
      : { conversationId };

  const [messages, receipts] = await Promise.all([
    db.chatMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 100,
      select: {
        id: true,
        sender: true,
        content: true,
        flagged: true,
        deliveredAt: true,
        readAt: true,
        createdAt: true,
      },
    }),
    getChatOutboundReceipts(conversationId, "CUSTOMER"),
  ]);

  return NextResponse.json({
    ok: true,
    messages: messages.map((m) => ({
      id: m.id,
      sender:
        m.sender === "CUSTOMER"
          ? "customer"
          : m.sender === "MERCHANT"
            ? "merchant"
            : "system",
      content:
        m.flagged && m.sender === "CUSTOMER"
          ? "Message non délivré (règles de sécurité)"
          : m.content,
      flagged: m.flagged,
      deliveredAt: m.deliveredAt?.toISOString() ?? null,
      readAt: m.readAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    })),
    receipts: receipts.map((r) => ({
      id: r.id,
      deliveredAt: r.deliveredAt?.toISOString() ?? null,
      readAt: r.readAt?.toISOString() ?? null,
    })),
  });
}
