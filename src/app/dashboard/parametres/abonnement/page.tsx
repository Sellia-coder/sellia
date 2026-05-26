import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import AbonnementClient from "./AbonnementClient";

export default async function AbonnementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, name: true, plan: true },
  });
  if (!shop) redirect("/personnaliser-ma-boutique");

  return (
    <AbonnementClient
      currentPlan={shop.plan || "free"}
      shopName={shop.name}
    />
  );
}
