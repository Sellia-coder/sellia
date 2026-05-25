import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import ProductNewClient from "./ProductNewClient";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, slug: true, name: true, category: true, primaryColor: true },
  });

  if (!shop) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Aucune boutique trouvée</h2>
        <p>Créez d&apos;abord votre boutique.</p>
      </div>
    );
  }

  return (
    <ProductNewClient
      shopId={shop.id}
      shopSlug={shop.slug}
      shopName={shop.name}
      shopCategory={shop.category}
      shopPrimaryColor={shop.primaryColor || "#E84B1F"}
    />
  );
}
