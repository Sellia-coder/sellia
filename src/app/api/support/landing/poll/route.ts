import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import {
  getLandingOutboundReceipts,
  markLandingInboundDelivered,
  markLandingInboundRead,
  verifyLandingVisitor,
} from "@/lib/landing-support/access";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(
    `landing_support_poll:${ip}`,
    RATE_LIMITS.LANDING_SUPPORT_POLL_PER_IP.limit,
    RATE_LIMITS.LANDING_SUPPORT_POLL_PER_IP.windowMs
  );
  if (!limit.allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const conversationId = request.nextUrl.searchParams.get("conversationId");
  const visitorToken = request.nextUrl.searchParams.get("visitorToken");
  const since = request.nextUrl.searchParams.get("since");
  const markRead = request.nextUrl.searchParams.get("markRead") === "1";

  if (!conversationId || !visitorToken) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const conversation = await verifyLandingVisitor(conversationId, visitorToken);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation introuvable" }, { status: 403 });
  }

  await markLandingInboundDelivered(conversationId, "VISITOR");
  if (markRead) {
    await markLandingInboundRead(conversationId, "VISITOR");
  }

  const sinceDate = since ? new Date(since) : null;
  const where =
    sinceDate && !Number.isNaN(sinceDate.getTime())
      ? { conversationId, createdAt: { gt: sinceDate } }
      : { conversationId };

  const [messages, receipts] = await Promise.all([
    db.landingSupportMessage.findMany({
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
    getLandingOutboundReceipts(conversationId, "VISITOR"),
  ]);

  return NextResponse.json({
    ok: true,
    messages: messages.map((m) => ({
      id: m.id,
      sender: m.sender === "ADMIN" ? "admin" : "visitor",
      content: m.content,
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
