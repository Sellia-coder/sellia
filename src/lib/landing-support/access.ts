import { db } from "@/lib/db";
import type { LandingSupportSender } from "@prisma/client";

export type LandingViewer = "VISITOR" | "ADMIN";

function inboundSenders(viewer: LandingViewer): LandingSupportSender[] {
  return viewer === "VISITOR" ? ["ADMIN"] : ["VISITOR"];
}

function outboundSender(viewer: LandingViewer): LandingSupportSender {
  return viewer === "VISITOR" ? "VISITOR" : "ADMIN";
}

export async function markLandingInboundDelivered(
  conversationId: string,
  viewer: LandingViewer
): Promise<void> {
  const now = new Date();
  await db.landingSupportMessage.updateMany({
    where: {
      conversationId,
      sender: { in: inboundSenders(viewer) },
      deliveredAt: null,
      flagged: false,
    },
    data: { deliveredAt: now },
  });
}

export async function markLandingInboundRead(
  conversationId: string,
  viewer: LandingViewer
): Promise<void> {
  const now = new Date();
  await db.landingSupportMessage.updateMany({
    where: {
      conversationId,
      sender: { in: inboundSenders(viewer) },
      readAt: null,
      flagged: false,
    },
    data: { readAt: now, deliveredAt: now },
  });
}

export async function getLandingOutboundReceipts(
  conversationId: string,
  viewer: LandingViewer
) {
  return db.landingSupportMessage.findMany({
    where: {
      conversationId,
      sender: outboundSender(viewer),
      OR: [{ deliveredAt: { not: null } }, { readAt: { not: null } }],
    },
    select: { id: true, deliveredAt: true, readAt: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
}

export async function verifyLandingVisitor(
  conversationId: string,
  visitorToken: string
) {
  return db.landingSupportConversation.findFirst({
    where: { id: conversationId, visitorToken, status: { not: "CLOSED" } },
    select: { id: true, visitorName: true },
  });
}
