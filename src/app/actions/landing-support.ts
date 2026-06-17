"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v3";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { analyzeChatMessage } from "@/lib/chat/anti-fraud";
import { CHAT_MAX_MESSAGE_LENGTH } from "@/lib/chat/constants";
import {
  getLandingOutboundReceipts,
  markLandingInboundDelivered,
  markLandingInboundRead,
} from "@/lib/landing-support/access";

const replySchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().trim().min(1).max(CHAT_MAX_MESSAGE_LENGTH),
});

export async function sendLandingSupportReplyAction(
  conversationId: string,
  content: string
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Non autorisé" };

    const parsed = replySchema.safeParse({ conversationId, content });
    if (!parsed.success) {
      return { ok: false as const, error: "Message invalide" };
    }

    const conversation = await db.landingSupportConversation.findUnique({
      where: { id: parsed.data.conversationId },
      select: { id: true, status: true },
    });
    if (!conversation) {
      return { ok: false as const, error: "Conversation introuvable" };
    }
    if (conversation.status === "CLOSED") {
      return { ok: false as const, error: "Conversation fermée" };
    }

    const fraud = analyzeChatMessage(parsed.data.content);
    if (fraud.blocked) {
      return {
        ok: false as const,
        error: "Ce message contient un numéro ou une demande de paiement hors site.",
      };
    }

    const message = await db.$transaction(async (tx) => {
      const created = await tx.landingSupportMessage.create({
        data: {
          conversationId: parsed.data.conversationId,
          sender: "ADMIN",
          content: parsed.data.content,
          adminId: admin.id,
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
        where: { id: parsed.data.conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: parsed.data.content.slice(0, 200),
          status: "REPLIED",
          unreadForAdmin: 0,
        },
      });
      return created;
    });

    revalidatePath("/admin/support-landing");
    return {
      ok: true as const,
      message: {
        id: message.id,
        sender: "admin" as const,
        content: message.content,
        deliveredAt: message.deliveredAt?.toISOString() ?? null,
        readAt: message.readAt?.toISOString() ?? null,
        createdAt: message.createdAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false as const, error: msg };
  }
}

export async function markLandingSupportReadAction(conversationId: string) {
  try {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Non autorisé" };
    await db.landingSupportConversation.update({
      where: { id: conversationId },
      data: { unreadForAdmin: 0 },
    });
    await markLandingInboundRead(conversationId, "ADMIN");
    revalidatePath("/admin/support-landing");
    return { ok: true as const };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false as const, error: msg };
  }
}

export async function closeLandingSupportAction(conversationId: string) {
  try {
    const admin = await requireAdmin();
    if (!admin) return { ok: false as const, error: "Non autorisé" };
    await db.landingSupportConversation.update({
      where: { id: conversationId },
      data: { status: "CLOSED", unreadForAdmin: 0 },
    });
    revalidatePath("/admin/support-landing");
    return { ok: true as const };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false as const, error: msg };
  }
}

export async function pollLandingSupportAdminAction(
  conversationId: string,
  since?: string | null
) {
  try {
    await requireAdmin();

    const conversation = await db.landingSupportConversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    });
    if (!conversation) {
      return { ok: false as const, error: "Conversation introuvable" };
    }

    await markLandingInboundDelivered(conversationId, "ADMIN");
    await markLandingInboundRead(conversationId, "ADMIN");

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
          deliveredAt: true,
          readAt: true,
          createdAt: true,
        },
      }),
      getLandingOutboundReceipts(conversationId, "ADMIN"),
    ]);

    return {
      ok: true as const,
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender === "ADMIN" ? ("admin" as const) : ("visitor" as const),
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
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false as const, error: msg };
  }
}
