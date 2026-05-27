import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import AideClient from "./AideClient";

export default async function AidePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const tickets = await db.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: [
      { status: "asc" },
      { lastMessageAt: "desc" },
    ],
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

  return (
    <AideClient
      currentUserId={user.id}
      currentUserEmail={user.email}
      initialTickets={tickets.map((t) => ({
        ...t,
        lastMessageAt: t.lastMessageAt.toISOString(),
        createdAt: t.createdAt.toISOString(),
        resolvedAt: t.resolvedAt?.toISOString() ?? null,
      }))}
    />
  );
}
