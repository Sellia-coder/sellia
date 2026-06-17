import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v3";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import { generateVisitorToken } from "@/lib/chat/visitor-token";

const phoneSchema = z
  .union([z.literal(""), z.string().trim().max(30)])
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .refine((v) => !v || /^[\d\s+().-]{6,30}$/.test(v), {
    message: "Numéro invalide",
  });

const startSchema = z.object({
  visitorName: z.string().trim().min(2).max(80).optional(),
  visitorEmail: z
    .union([z.literal(""), z.string().email()])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  visitorPhone: phoneSchema,
  conversationId: z.string().optional(),
  visitorToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(
    `landing_support_start:${ip}`,
    RATE_LIMITS.LANDING_SUPPORT_START_PER_IP.limit,
    RATE_LIMITS.LANDING_SUPPORT_START_PER_IP.windowMs
  );
  if (!limit.allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
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
    const existing = await db.landingSupportConversation.findFirst({
      where: {
        id: data.conversationId,
        visitorToken: data.visitorToken,
        status: { not: "CLOSED" },
      },
      select: {
        id: true,
        visitorToken: true,
        visitorName: true,
        visitorEmail: true,
        visitorPhone: true,
      },
    });
    if (existing) {
      if (data.visitorPhone) {
        await db.landingSupportConversation.update({
          where: { id: existing.id },
          data: { visitorPhone: data.visitorPhone },
        });
      }
      return NextResponse.json({
        ok: true,
        conversationId: existing.id,
        visitorToken: existing.visitorToken,
        visitorName: existing.visitorName,
        visitorPhone: data.visitorPhone ?? existing.visitorPhone,
        resumed: true,
      });
    }
  }

  const visitorToken = generateVisitorToken();
  const conversation = await db.landingSupportConversation.create({
    data: {
      visitorToken,
      visitorName: data.visitorName ?? null,
      visitorEmail: data.visitorEmail ?? null,
      visitorPhone: data.visitorPhone ?? null,
      status: "NEW",
    },
    select: { id: true, visitorToken: true, visitorName: true, visitorPhone: true },
  });

  return NextResponse.json({
    ok: true,
    conversationId: conversation.id,
    visitorToken: conversation.visitorToken,
    visitorName: conversation.visitorName,
    visitorPhone: conversation.visitorPhone,
    resumed: false,
  });
}
