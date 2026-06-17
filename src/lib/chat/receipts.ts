import { db } from "@/lib/db";
import type { ChatMessageSender } from "@prisma/client";

export type ChatViewer = "CUSTOMER" | "MERCHANT";

function inboundSenders(viewer: ChatViewer): ChatMessageSender[] {
  return viewer === "CUSTOMER" ? ["MERCHANT", "SYSTEM"] : ["CUSTOMER"];
}

function outboundSender(viewer: ChatViewer): ChatMessageSender {
  return viewer === "CUSTOMER" ? "CUSTOMER" : "MERCHANT";
}

/** Marque comme délivrés les messages entrants non encore livrés. */
export async function markChatInboundDelivered(
  conversationId: string,
  viewer: ChatViewer
): Promise<void> {
  const now = new Date();
  await db.chatMessage.updateMany({
    where: {
      conversationId,
      sender: { in: inboundSenders(viewer) },
      deliveredAt: null,
    },
    data: { deliveredAt: now },
  });
}

/** Marque comme lus les messages entrants (et délivrés si besoin). */
export async function markChatInboundRead(
  conversationId: string,
  viewer: ChatViewer
): Promise<void> {
  const now = new Date();
  await db.chatMessage.updateMany({
    where: {
      conversationId,
      sender: { in: inboundSenders(viewer) },
      readAt: null,
    },
    data: { readAt: now, deliveredAt: now },
  });
}

/** Accusés pour les messages sortants du viewer (mises à jour côté expéditeur). */
export async function getChatOutboundReceipts(
  conversationId: string,
  viewer: ChatViewer
) {
  return db.chatMessage.findMany({
    where: {
      conversationId,
      sender: outboundSender(viewer),
      OR: [{ deliveredAt: { not: null } }, { readAt: { not: null } }],
    },
    select: {
      id: true,
      deliveredAt: true,
      readAt: true,
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
}

export function serializeReceipts(
  rows: Array<{ deliveredAt: Date | null; readAt: Date | null }>
) {
  return rows.map((r) => ({
    deliveredAt: r.deliveredAt?.toISOString() ?? null,
    readAt: r.readAt?.toISOString() ?? null,
  }));
}
