import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import AppearanceStudioClient from "./AppearanceStudioClient";

export default async function AppearancePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      logoUrl: true,
      faviconUrl: true,
      mobileLogoUrl: true,
      themeId: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      bgColor: true,
      displayFont: true,
      bodyFont: true,
      headerStyle: true,
      productGridCols: true,
      footerStyle: true,
      heroStyle: true,
    },
  });

  if (!shop) redirect("/personnaliser-ma-boutique");

  return (
    <AppearanceStudioClient
      shop={{
        id: shop.id,
        slug: shop.slug,
        name: shop.name,
        tagline: shop.tagline || "",
        logoUrl: shop.logoUrl,
        faviconUrl: shop.faviconUrl,
        mobileLogoUrl: shop.mobileLogoUrl,
        themeId: shop.themeId || "elegance",
        primaryColor: shop.primaryColor || "#E84B1F",
        secondaryColor: shop.secondaryColor || "#0A0E13",
        accentColor: shop.accentColor || "#FFEDD5",
        backgroundColor: shop.bgColor || "#FAFAF7",
        headingFont: shop.displayFont || "Fraunces",
        bodyFont: shop.bodyFont || "Inter",
        headerStyle: shop.headerStyle || "centered",
        productGridCols: shop.productGridCols ?? 3,
        footerStyle: shop.footerStyle || "classic",
        heroStyle: shop.heroStyle || "image-text",
      }}
    />
  );
}
