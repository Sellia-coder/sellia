import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import DomaineClient from "./DomaineClient";

export default async function DomainePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      slug: true,
      name: true,
      plan: true,
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      ogImageUrl: true,
      ga4MeasurementId: true,
      fbPixelId: true,
      fbCapiToken: true,
      tiktokPixelId: true,
      snapPixelId: true,
      customDomain: true,
      customDomainVerifiedAt: true,
    },
  });

  if (!shop) redirect("/personnaliser-ma-boutique");

  return (
    <DomaineClient
      shop={{
        slug: shop.slug,
        name: shop.name,
        plan: shop.plan || "free",
        seoTitle: shop.seoTitle || "",
        seoDescription: shop.seoDescription || "",
        seoKeywords: shop.seoKeywords || "",
        ogImageUrl: shop.ogImageUrl || null,
        googleAnalyticsId: shop.ga4MeasurementId || "",
        facebookPixelId: shop.fbPixelId || "",
        facebookCapiToken: shop.fbCapiToken || "",
        tiktokPixelId: shop.tiktokPixelId || "",
        snapchatPixelId: shop.snapPixelId || "",
        customDomain: shop.customDomain || "",
        customDomainVerifiedAt:
          shop.customDomainVerifiedAt?.toISOString() || null,
      }}
    />
  );
}
