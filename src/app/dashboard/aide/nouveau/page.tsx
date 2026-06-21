import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatMerchantDisplayName } from "@/lib/utils/capitalize-name";
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
      userName={formatMerchantDisplayName(user.firstName, user.lastName, user.email)}
      userEmail={user.email}
      shopName={shop?.name ?? null}
    />
  );
}
