"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v3";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { analyzeChatMessage } from "@/lib/chat/anti-fraud";
import { CHAT_MAX_MESSAGE_LENGTH } from "@/lib/chat/constants";

async function getOwnedShop(userId: string) {
  return db.shop.findFirst({
    where: { ownerId: userId },
    select: { id: true, slug: true },
  });
}

async function assertConversationOwnership(
  shopId: string,
  conversationId: string
) {
  return db.chatConversation.findFirst({
    where: { id: conversationId, shopId },
    select: { id: true, status: true },
  });
}

const replySchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().trim().min(1).max(CHAT_MAX_MESSAGE_LENGTH),
});

export async function sendMerchantChatMessageAction(
  conversationId: string,
  content: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "Non autorisé" };

    const shop = await getOwnedShop(user.id);
    if (!shop) return { ok: false as const, error: "Boutique introuvable" };

    const parsed = replySchema.safeParse({ conversationId, content });
    if (!parsed.success) {
      return { ok: false as const, error: "Message invalide" };
    }

    const conversation = await assertConversationOwnership(
      shop.id,
      parsed.data.conversationId
    );
    if (!conversation) {
      return { ok: false as const, error: "Conversation introuvable" };
    }
    if (conversation.status !== "OPEN") {
      return { ok: false as const, error: "Conversation fermée" };
    }

    const fraud = analyzeChatMessage(parsed.data.content);
    if (fraud.blocked) {
      return {
        ok: false as const,
        error:
          "Ce message contient un numéro ou une demande de paiement hors site.",
      };
    }

    const message = await db.$transaction(async (tx) => {
      const created = await tx.chatMessage.create({
        data: {
          conversationId: parsed.data.conversationId,
          sender: "MERCHANT",
          content: parsed.data.content,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
        },
      });
      await tx.chatConversation.update({
        where: { id: parsed.data.conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: parsed.data.content.slice(0, 200),
        },
      });
      return created;
    });

    revalidatePath("/dashboard/clients");
    return {
      ok: true as const,
      message: {
        id: message.id,
        content: message.content,
        sender: "merchant" as const,
        createdAt: message.createdAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false as const, error: message };
  }
}

export async function markChatConversationReadAction(conversationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "Non autorisé" };

    const shop = await getOwnedShop(user.id);
    if (!shop) return { ok: false as const, error: "Boutique introuvable" };

    const conversation = await assertConversationOwnership(
      shop.id,
      conversationId
    );
    if (!conversation) {
      return { ok: false as const, error: "Conversation introuvable" };
    }

    await db.chatConversation.update({
      where: { id: conversationId },
      data: { unreadForMerchant: 0 },
    });

    revalidatePath("/dashboard/clients");
    return { ok: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false as const, error: message };
  }
}

export async function getChatUnreadCountAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, count: 0 };

    const shop = await getOwnedShop(user.id);
    if (!shop) return { ok: true as const, count: 0 };

    const agg = await db.chatConversation.aggregate({
      where: { shopId: shop.id, status: "OPEN" },
      _sum: { unreadForMerchant: true },
    });

    return { ok: true as const, count: agg._sum.unreadForMerchant ?? 0 };
  } catch {
    return { ok: true as const, count: 0 };
  }
}
