"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";

export interface AppearanceUpdate {
  themeId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  headingFont?: string;
  bodyFont?: string;
  headerStyle?: string;
  productGridCols?: number;
  footerStyle?: string;
  heroStyle?: string;
  tagline?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  mobileLogoUrl?: string | null;
  heroImageUrl?: string | null;
}

function mapAppearanceToDb(input: AppearanceUpdate) {
  const data: Record<string, unknown> = {};
  if (input.themeId !== undefined) data.themeId = input.themeId;
  if (input.primaryColor !== undefined) data.primaryColor = input.primaryColor;
  if (input.secondaryColor !== undefined) data.secondaryColor = input.secondaryColor;
  if (input.accentColor !== undefined) data.accentColor = input.accentColor;
  if (input.backgroundColor !== undefined) data.bgColor = input.backgroundColor;
  if (input.headingFont !== undefined) data.displayFont = input.headingFont;
  if (input.bodyFont !== undefined) data.bodyFont = input.bodyFont;
  if (input.headerStyle !== undefined) data.headerStyle = input.headerStyle;
  if (input.productGridCols !== undefined) data.productGridCols = input.productGridCols;
  if (input.footerStyle !== undefined) data.footerStyle = input.footerStyle;
  if (input.heroStyle !== undefined) data.heroStyle = input.heroStyle;
  if (input.tagline !== undefined) data.tagline = input.tagline.trim() || null;
  if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
  if (input.faviconUrl !== undefined) data.faviconUrl = input.faviconUrl;
  if (input.mobileLogoUrl !== undefined) data.mobileLogoUrl = input.mobileLogoUrl;
  if (input.heroImageUrl !== undefined) data.heroImageUrl = input.heroImageUrl;
  return data;
}

export async function updateAppearanceAction(input: AppearanceUpdate) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true, slug: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    const colorPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const field of [
      "primaryColor",
      "secondaryColor",
      "accentColor",
      "backgroundColor",
    ] as const) {
      const value = input[field];
      if (value && !colorPattern.test(value)) {
        return { ok: false, error: `Format couleur invalide pour ${field}` };
      }
    }

    await db.shop.update({
      where: { id: shop.id },
      data: mapAppearanceToDb(input),
    });

    revalidatePath("/dashboard/apparence");
    if (shop.slug) revalidatePath(`/shop/${shop.slug}`);

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}

export async function applyThemePresetAction(themeId: string) {
  const presets: Record<string, AppearanceUpdate> = {
    elegance: {
      themeId: "elegance",
      primaryColor: "#E84B1F",
      secondaryColor: "#0A0E13",
      accentColor: "#FFEDD5",
      backgroundColor: "#FAFAF7",
      headingFont: "Manrope",
      bodyFont: "Inter",
    },
    audacieux: {
      themeId: "audacieux",
      primaryColor: "#DC2626",
      secondaryColor: "#171717",
      accentColor: "#FEE2E2",
      backgroundColor: "#FFFFFF",
      headingFont: "Playfair Display",
      bodyFont: "Lato",
    },
    minimal: {
      themeId: "minimal",
      primaryColor: "#000000",
      secondaryColor: "#404040",
      accentColor: "#F5F5F5",
      backgroundColor: "#FFFFFF",
      headingFont: "Inter",
      bodyFont: "Inter",
    },
    nature: {
      themeId: "nature",
      primaryColor: "#15803D",
      secondaryColor: "#1E3A2F",
      accentColor: "#DCFCE7",
      backgroundColor: "#F8FAF8",
      headingFont: "Cormorant Garamond",
      bodyFont: "Lato",
    },
    boutique: {
      themeId: "boutique",
      primaryColor: "#9333EA",
      secondaryColor: "#1E1B4B",
      accentColor: "#EDE9FE",
      backgroundColor: "#FAFAFA",
      headingFont: "DM Serif Display",
      bodyFont: "Inter",
    },
    tech: {
      themeId: "tech",
      primaryColor: "#0EA5E9",
      secondaryColor: "#0F172A",
      accentColor: "#E0F2FE",
      backgroundColor: "#FFFFFF",
      headingFont: "Space Grotesk",
      bodyFont: "Inter",
    },
  };

  const preset = presets[themeId];
  if (!preset) return { ok: false, error: "Thème invalide" };

  return updateAppearanceAction(preset);
}

export async function resetAppearanceAction() {
  return applyThemePresetAction("elegance");
}
