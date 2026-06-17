import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { parseShippingZones } from "@/lib/shop-data";
import type { Step35Input } from "@/lib/validations/personnalisation";
import ShippingConfigClient from "./ShippingConfigClient";

export default async function ShippingConfigPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      country: true,
      currency: true,
      shippingZones: true,
      paymentCashOnDelivery: true,
      paymentOnlineEscrow: true,
      products: {
        where: { type: "physical" },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!shop) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Aucune boutique trouvée</h2>
        <p>Créez d&apos;abord votre boutique.</p>
      </div>
    );
  }

  const codUnlock = await db.shopFeatureUnlock.findUnique({
    where: { shopId_feature: { shopId: shop.id, feature: "COD" } },
    select: { id: true },
  });

  const zones = parseShippingZones(shop.shippingZones);
  const initial: Step35Input = {
    shippingZones:
      zones.length > 0
        ? zones.map((z) => ({
            id: z.id,
            name: z.name,
            price: z.price,
            eta: z.eta ?? "",
          }))
        : [
            {
              id: "zone-national",
              name: "National",
              price: 2000,
              eta: "2-5 jours",
            },
          ],
    paymentCashOnDelivery: shop.paymentCashOnDelivery,
    paymentOnlineEscrow: shop.paymentOnlineEscrow,
  };

  return (
    <ShippingConfigClient
      initial={initial}
      countryCode={shop.country ?? "CM"}
      codUnlocked={Boolean(codUnlock)}
      hasPhysicalProducts={shop.products.length > 0}
      currency={shop.currency || "FCFA"}
    />
  );
}
