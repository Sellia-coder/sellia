"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SUPPORT_EMAIL = "support@getsellia.com";
const EMAIL_FROM = process.env.EMAIL_FROM || "Sellia <noreply@getsellia.com>";

type CategoryValue = "TECHNICAL" | "ORDER" | "PAYMENT" | "SHOP" | "SUGGESTION" | "OTHER";
type PriorityValue = "LOW" | "NORMAL" | "HIGH" | "URGENT";

const CATEGORY_LABELS: Record<CategoryValue, string> = {
  TECHNICAL: "Technique",
  ORDER: "Commande",
  PAYMENT: "Paiement",
  SHOP: "Boutique",
  SUGGESTION: "Suggestion",
  OTHER: "Autre",
};

const PRIORITY_LABELS: Record<PriorityValue, string> = {
  LOW: "Basse",
  NORMAL: "Normale",
  HIGH: "Élevée",
  URGENT: "Urgente",
};

interface CreateTicketInput {
  subject: string;
  category: CategoryValue;
  priority: PriorityValue;
  message: string;
}

export async function createTicketAction(input: CreateTicketInput) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    const subject = input.subject?.trim();
    const message = input.message?.trim();

    if (!subject || subject.length < 3) {
      return { ok: false, error: "Le sujet doit faire au moins 3 caractères" };
    }
    if (!message || message.length < 5) {
      return { ok: false, error: "Le message doit faire au moins 5 caractères" };
    }
    if (subject.length > 200) {
      return { ok: false, error: "Le sujet ne peut pas dépasser 200 caractères" };
    }
    if (message.length > 5000) {
      return { ok: false, error: "Le message ne peut pas dépasser 5000 caractères" };
    }

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true, name: true, slug: true },
    });

    const senderName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.email.split("@")[0];

    const ticket = await db.$transaction(async (tx) => {
      const newTicket = await tx.supportTicket.create({
        data: {
          userId: user.id,
          shopId: shop?.id ?? null,
          shopName: shop?.name ?? null,
          shopSlug: shop?.slug ?? null,
          subject,
          category: input.category,
          priority: input.priority,
          status: "OPEN",
          lastMessageAt: new Date(),
          lastMessageBy: "MERCHANT",
          unreadByUser: 0,
          unreadBySupport: 1,
        },
      });

      await tx.supportMessage.create({
        data: {
          ticketId: newTicket.id,
          senderId: user.id,
          senderType: "MERCHANT",
          senderName,
          content: message,
        },
      });

      await tx.supportMessage.create({
        data: {
          ticketId: newTicket.id,
          senderId: user.id,
          senderType: "SYSTEM",
          senderName: "Sellia Support",
          content:
            "Sellia Support a bien reçu votre demande. Notre équipe vous répondra sous 24h ouvrées. Vous serez notifié(e) par email à chaque réponse.",
        },
      });

      return newTicket;
    });

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: SUPPORT_EMAIL,
        subject: `[Support #${ticket.id.slice(0, 8)}] ${CATEGORY_LABELS[input.category]} · ${subject}`,
        html: `
          <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #FAFAF7; border: 1px solid #E5E5E0; border-radius: 12px; padding: 24px;">
              <div style="border-bottom: 1px solid #E5E5E0; padding-bottom: 16px; margin-bottom: 16px;">
                <div style="font-size: 12px; color: #8B8E94; text-transform: uppercase; letter-spacing: 0.5px;">Nouveau ticket support</div>
                <h2 style="margin: 8px 0 0; color: #0E1116; font-size: 20px;">${escapeHtml(subject)}</h2>
              </div>

              <table style="width: 100%; font-size: 13px; color: #4B5563; margin-bottom: 16px;">
                <tr><td style="padding: 4px 0;"><strong>Marchand :</strong></td><td>${escapeHtml(senderName)} (${escapeHtml(user.email)})</td></tr>
                ${shop ? `<tr><td style="padding: 4px 0;"><strong>Boutique :</strong></td><td>${escapeHtml(shop.name)} (${escapeHtml(shop.slug)}.getsellia.com)</td></tr>` : ""}
                <tr><td style="padding: 4px 0;"><strong>Catégorie :</strong></td><td>${CATEGORY_LABELS[input.category]}</td></tr>
                <tr><td style="padding: 4px 0;"><strong>Priorité :</strong></td><td>${PRIORITY_LABELS[input.priority]}</td></tr>
              </table>

              <div style="background: white; border: 1px solid #E5E5E0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <div style="font-size: 11px; color: #8B8E94; text-transform: uppercase; margin-bottom: 8px;">Message du marchand</div>
                <div style="color: #0E1116; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</div>
              </div>

              <div style="text-align: center; padding-top: 8px;">
                <a href="https://getsellia.com/admin/support/${ticket.id}" style="display: inline-block; background: #E84B1F; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Ouvrir dans l'admin</a>
              </div>

              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5E5E0; font-size: 11px; color: #8B8E94; text-align: center;">
                Ticket #${ticket.id} · ${new Date().toLocaleString("fr-FR", { timeZone: "Africa/Douala" })}
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[support] Resend admin email failed:", emailErr);
    }

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: `Sellia Support : votre demande "${subject}" a bien été reçue`,
        html: `
          <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #FAFAF7; border-radius: 12px; padding: 24px;">
              <h2 style="margin: 0 0 12px; color: #0E1116; font-size: 22px;">Votre demande a bien été reçue</h2>
              <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                Bonjour ${escapeHtml(senderName)},
              </p>
              <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                Nous avons bien reçu votre message concernant <strong>"${escapeHtml(subject)}"</strong>.
                Notre équipe support reviendra vers vous sous <strong>24 heures ouvrées</strong>.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="https://getsellia.com/dashboard/aide" style="display: inline-block; background: #E84B1F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Voir mon ticket</a>
              </div>
              <p style="color: #8B8E94; font-size: 12px; text-align: center; margin-top: 16px;">
                Vous recevrez un email à chaque nouvelle réponse de notre équipe.
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[support] Resend confirmation email failed:", emailErr);
    }

    revalidatePath("/dashboard/aide");
    return { ok: true, ticketId: ticket.id };
  } catch (err: unknown) {
    console.error("[createTicketAction]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function sendMessageAction(ticketId: string, content: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    const trimmed = content?.trim();
    if (!trimmed) return { ok: false, error: "Le message ne peut pas être vide" };
    if (trimmed.length > 5000) return { ok: false, error: "Message trop long (max 5000)" };

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true, status: true, subject: true },
    });
    if (!ticket || ticket.userId !== user.id) {
      return { ok: false, error: "Ticket introuvable" };
    }
    if (ticket.status === "CLOSED") {
      return { ok: false, error: "Ce ticket est fermé. Créez-en un nouveau si besoin." };
    }

    const senderName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.email.split("@")[0];

    await db.$transaction(async (tx) => {
      await tx.supportMessage.create({
        data: {
          ticketId,
          senderId: user.id,
          senderType: "MERCHANT",
          senderName,
          content: trimmed,
        },
      });

      await tx.supportTicket.update({
        where: { id: ticketId },
        data: {
          lastMessageAt: new Date(),
          lastMessageBy: "MERCHANT",
          status: ticket.status === "RESOLVED" ? "OPEN" : "WAITING_SUPPORT",
          unreadBySupport: { increment: 1 },
        },
      });
    });

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: SUPPORT_EMAIL,
        subject: `[Support #${ticketId.slice(0, 8)}] Nouvelle réponse · ${ticket.subject}`,
        html: `
          <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #FAFAF7; border-radius: 12px; padding: 24px;">
              <div style="font-size: 12px; color: #8B8E94; text-transform: uppercase;">Nouveau message · Ticket #${ticketId.slice(0, 8)}</div>
              <h3 style="margin: 8px 0 16px; color: #0E1116;">${escapeHtml(ticket.subject)}</h3>
              <div style="background: white; border: 1px solid #E5E5E0; border-radius: 8px; padding: 16px;">
                <div style="font-size: 11px; color: #8B8E94; margin-bottom: 8px;">${escapeHtml(senderName)} a écrit :</div>
                <div style="color: #0E1116; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(trimmed)}</div>
              </div>
              <div style="text-align: center; margin-top: 16px;">
                <a href="https://getsellia.com/admin/support/${ticketId}" style="display: inline-block; background: #E84B1F; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Répondre</a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[support] Resend new-message email failed:", emailErr);
    }

    revalidatePath("/dashboard/aide");
    return { ok: true };
  } catch (err: unknown) {
    console.error("[sendMessageAction]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function listTicketsAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé", tickets: [] };

    const tickets = await db.supportTicket.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { lastMessageAt: "desc" }],
      select: {
        id: true,
        subject: true,
        category: true,
        priority: true,
        status: true,
        lastMessageAt: true,
        lastMessageBy: true,
        unreadByUser: true,
        createdAt: true,
        resolvedAt: true,
      },
    });

    return {
      ok: true,
      tickets: tickets.map((t) => ({
        ...t,
        lastMessageAt: t.lastMessageAt.toISOString(),
        createdAt: t.createdAt.toISOString(),
        resolvedAt: t.resolvedAt?.toISOString() ?? null,
      })),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message, tickets: [] };
  }
}

export async function getTicketWithMessagesAction(ticketId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            senderId: true,
            senderType: true,
            senderName: true,
            content: true,
            attachments: true,
            readAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!ticket || ticket.userId !== user.id) {
      return { ok: false, error: "Ticket introuvable" };
    }

    return {
      ok: true,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
        lastMessageAt: ticket.lastMessageAt.toISOString(),
      },
      messages: ticket.messages.map((m) => ({
        ...m,
        readAt: m.readAt?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function markTicketAsReadAction(ticketId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false };

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true },
    });
    if (!ticket || ticket.userId !== user.id) return { ok: false };

    await db.supportTicket.update({
      where: { id: ticketId },
      data: { unreadByUser: 0 },
    });

    await db.supportMessage.updateMany({
      where: { ticketId, senderType: "SUPPORT", readAt: null },
      data: { readAt: new Date() },
    });

    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function pollTicketMessagesAction(ticketId: string, sinceMessageId: string | null) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, messages: [] };

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true, status: true },
    });
    if (!ticket || ticket.userId !== user.id) return { ok: false, messages: [] };

    let cutoff: Date | null = null;
    if (sinceMessageId) {
      const refMsg = await db.supportMessage.findUnique({
        where: { id: sinceMessageId },
        select: { createdAt: true },
      });
      cutoff = refMsg?.createdAt ?? null;
    }

    const messages = await db.supportMessage.findMany({
      where: {
        ticketId,
        ...(cutoff ? { createdAt: { gt: cutoff } } : {}),
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        senderId: true,
        senderType: true,
        senderName: true,
        content: true,
        attachments: true,
        readAt: true,
        createdAt: true,
      },
    });

    return {
      ok: true,
      status: ticket.status,
      messages: messages.map((m) => ({
        ...m,
        readAt: m.readAt?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch {
    return { ok: false, messages: [] };
  }
}

export async function closeTicketAction(ticketId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true, status: true },
    });
    if (!ticket || ticket.userId !== user.id) {
      return { ok: false, error: "Ticket introuvable" };
    }
    if (ticket.status === "CLOSED") {
      return { ok: false, error: "Déjà fermé" };
    }

    await db.$transaction(async (tx) => {
      await tx.supportTicket.update({
        where: { id: ticketId },
        data: { status: "CLOSED", closedAt: new Date() },
      });
      await tx.supportMessage.create({
        data: {
          ticketId,
          senderId: user.id,
          senderType: "SYSTEM",
          senderName: "Sellia Support",
          content: "Ce ticket a été fermé par le marchand. Pour toute nouvelle demande, créez un nouveau ticket.",
        },
      });
    });

    revalidatePath("/dashboard/aide");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
