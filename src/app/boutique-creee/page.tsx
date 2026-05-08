import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import CelebrationView from "@/components/personnalisation/CelebrationView";

export const metadata = { title: "Boutique en ligne - Sellia" };

export default async function BoutiqueCreeePage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: {
      ownerId: user.id,
      OR: [{ status: "published" }, { isPublished: true }],
    },
    orderBy: { publishedAt: "desc" },
    select: { id: true, slug: true, name: true, primaryColor: true, logoUrl: true },
  });

  if (!shop) redirect("/dashboard");

  return <CelebrationView shop={shop} />;
}
