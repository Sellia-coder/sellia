import { getCurrentUser } from "@/lib/auth/session";
import { getActiveDraftShopForUser } from "@/lib/draftShop/claim";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export default async function DashboardHomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  if (!user.onboardingCompleted) {
    const draft = await getActiveDraftShopForUser(user.id);
    if (draft) {
      redirect("/personnaliser-ma-boutique");
    }
  }

  return <HomeClient firstName={user.firstName || ""} />;
}
