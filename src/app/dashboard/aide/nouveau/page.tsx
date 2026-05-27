import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import NouveauTicketClient from "./NouveauTicketClient";

export default async function NouveauTicketPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, name: true, slug: true },
  });

  return (
    <NouveauTicketClient
      userName={[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0]}
      userEmail={user.email}
      shopName={shop?.name ?? null}
    />
  );
}
