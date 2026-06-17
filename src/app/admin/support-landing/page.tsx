import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import SupportLandingAdminClient from "./SupportLandingAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminSupportLandingPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/connexion");

  const conversationsRaw = await db.landingSupportConversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 200,
        select: {
          id: true,
          sender: true,
          content: true,
          deliveredAt: true,
          readAt: true,
          createdAt: true,
        },
      },
    },
  });

  const conversations = conversationsRaw.map((c) => ({
    id: c.id,
    visitorName: c.visitorName,
    visitorEmail: c.visitorEmail,
    visitorPhone: c.visitorPhone,
    status: c.status,
    unreadForAdmin: c.unreadForAdmin,
    lastMessageAt: c.lastMessageAt.toISOString(),
    lastMessagePreview: c.lastMessagePreview,
    messages: c.messages.map((m) => ({
      id: m.id,
      sender: m.sender === "ADMIN" ? ("admin" as const) : ("visitor" as const),
      content: m.content,
      deliveredAt: m.deliveredAt?.toISOString() ?? null,
      readAt: m.readAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  const newCount = conversations.filter(
    (c) => c.status === "NEW" || c.unreadForAdmin > 0
  ).length;

  return (
    <div>
      <h1 className="admin-page-title">Chat landing</h1>
      <p className="admin-page-subtitle" style={{ marginBottom: 24 }}>
        Conversations visiteurs depuis getsellia.com
        {newCount > 0 ? ` · ${newCount} à traiter` : ""}
      </p>
      <SupportLandingAdminClient conversations={conversations} />
    </div>
  );
}
