import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateHeroImage } from "@/lib/ai/generate-hero-image";
import {
  MAX_HERO_GENERATIONS_PER_24H,
  canGenerateHero,
  nextGenerationCount,
} from "@/lib/ai/hero-rate-limit";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyShopOwnershipBySlug } from "@/lib/security/shop-auth";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = await verifyShopOwnershipBySlug(user.id, slug);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const shop = await db.shop.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      tagline: true,
      category: true,
      primaryColor: true,
      heroImageGenerations: true,
      heroImageGeneratedAt: true,
    },
  });

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  if (
    !canGenerateHero(shop.heroImageGeneratedAt, shop.heroImageGenerations)
  ) {
    const nextAt = shop.heroImageGeneratedAt
      ? new Date(shop.heroImageGeneratedAt.getTime() + 24 * 60 * 60 * 1000)
      : null;
    return NextResponse.json(
      {
        error: "Limite atteinte (3 générations / 24h). Réessayez demain.",
        nextAvailableAt: nextAt,
      },
      { status: 429 }
    );
  }

  const result = await generateHeroImage({
    shopId: shop.id,
    shopName: shop.name,
    tagline: shop.tagline,
    category: shop.category,
    primaryColor: shop.primaryColor,
  });

  if (!result.success || !result.imageUrl) {
    return NextResponse.json(
      { error: result.error || "Génération échouée" },
      { status: 500 }
    );
  }

  const newGenerations = nextGenerationCount(
    shop.heroImageGeneratedAt,
    shop.heroImageGenerations
  );

  await db.shop.update({
    where: { slug },
    data: {
      heroImageUrl: result.imageUrl,
      heroImagePrompt: result.prompt || null,
      heroImageGenerations: newGenerations,
      heroImageGeneratedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    imageUrl: result.imageUrl,
    generationsUsed: newGenerations,
    generationsRemaining: MAX_HERO_GENERATIONS_PER_24H - newGenerations,
  });
}
