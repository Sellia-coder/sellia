import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v3";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import { analyzeChatMessage } from "@/lib/chat/anti-fraud";
import { CHAT_MAX_MESSAGE_LENGTH } from "@/lib/chat/constants";
import { verifyLandingVisitor } from "@/lib/landing-support/access";

const phoneSchema = z
  .union([z.literal(""), z.string().trim().max(30)])
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .refine((v) => !v || /^[\d\s+().-]{6,30}$/.test(v), {
    message: "Numéro invalide",
  });

const sendSchema = z.object({
  conversationId: z.string().min(1),
  visitorToken: z.string().min(16),
  content: z.string().trim().min(1).max(CHAT_MAX_MESSAGE_LENGTH),
  visitorName: z.string().trim().min(2).max(80).optional(),
  visitorEmail: z
    .union([z.literal(""), z.string().email()])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  visitorPhone: phoneSchema,
});

const BLOCKED_VISITOR_MESSAGE =
  "Pour votre sécurité, le partage de numéros ou de demandes de paiement hors plateforme est interdit.";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const ipLimit = rateLimit(
    `landing_support_send_ip:${ip}`,
    RATE_LIMITS.LANDING_SUPPORT_SEND_PER_IP.limit,
    RATE_LIMITS.LANDING_SUPPORT_SEND_PER_IP.windowMs
  );
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: "Trop de messages" }, { status: 429 });
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

  const { conversationId, visitorToken, content, visitorName, visitorEmail, visitorPhone } =
    parsed.data;

  const convLimit = rateLimit(
    `landing_support_send_conv:${conversationId}`,
    RATE_LIMITS.LANDING_SUPPORT_SEND_PER_CONV.limit,
    RATE_LIMITS.LANDING_SUPPORT_SEND_PER_CONV.windowMs
  );
  if (!convLimit.allowed) {
    return NextResponse.json({ error: "Trop de messages" }, { status: 429 });
  }

  const conversation = await verifyLandingVisitor(conversationId, visitorToken);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation introuvable" }, { status: 403 });
  }

  const fraud = analyzeChatMessage(content);
  if (fraud.blocked) {
    return NextResponse.json({
      ok: false,
      blocked: true,
      warning: BLOCKED_VISITOR_MESSAGE,
      reason: fraud.reason,
    });
  }

  const message = await db.$transaction(async (tx) => {
    if (visitorName || visitorEmail || visitorPhone) {
      await tx.landingSupportConversation.update({
        where: { id: conversationId },
        data: {
          ...(visitorName ? { visitorName } : {}),
          ...(visitorEmail ? { visitorEmail } : {}),
          ...(visitorPhone ? { visitorPhone } : {}),
        },
      });
    }

    const created = await tx.landingSupportMessage.create({
      data: {
        conversationId,
        sender: "VISITOR",
        content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        deliveredAt: true,
        readAt: true,
      },
    });

    await tx.landingSupportConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: content.slice(0, 200),
        unreadForAdmin: { increment: 1 },
        status: "NEW",
      },
    });

    return created;
  });

  return NextResponse.json({
    ok: true,
    message: {
      id: message.id,
      sender: "visitor",
      content: message.content,
      deliveredAt: message.deliveredAt?.toISOString() ?? null,
      readAt: message.readAt?.toISOString() ?? null,
      createdAt: message.createdAt.toISOString(),
    },
  });
}
