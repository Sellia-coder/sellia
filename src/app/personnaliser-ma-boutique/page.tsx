import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveDraftShopAction } from "@/app/actions/personnalisation";
import PersonnalisationWizard from "@/components/personnalisation/PersonnalisationWizard";

export const metadata = {
  title: "Personnaliser ma boutique - Sellia",
  description: "Configure ta boutique en quelques étapes",
};

export default async function PersonnaliserMaBoutiquePage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const existingShop = await db.shop.findFirst({
    where: {
      ownerId: user.id,
      OR: [{ status: "published" }, { isPublished: true }],
    },
    select: { id: true },
  });
  if (existingShop) redirect("/dashboard");

  const result = await getActiveDraftShopAction();
  if (!result.ok || !result.draft) redirect("/");

  return <PersonnalisationWizard draft={result.draft} userEmail={user.email ?? ""} />;
}
