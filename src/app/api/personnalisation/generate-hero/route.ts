import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateHeroImage } from "@/lib/ai/generate-hero-image";
import {
  MAX_HERO_GENERATIONS_PER_24H,
  canGenerateHero,
  nextGenerationCount,
} from "@/lib/ai/hero-rate-limit";
import { getCurrentUser } from "@/lib/auth/session";

type DraftHeroMeta = {
  heroAiGenerations?: number;
  heroAiGeneratedAt?: string;
};

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const draft = await db.draftShop.findFirst({
    where: {
      userId: user.id,
      status: { not: "consumed" },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!draft) {
    return NextResponse.json({ error: "Aucune boutique en cours" }, { status: 404 });
  }

  const generatedData =
    draft.generatedData && typeof draft.generatedData === "object"
      ? (draft.generatedData as Record<string, unknown> & DraftHeroMeta)
      : {};

  const heroAiGeneratedAt = generatedData.heroAiGeneratedAt
    ? new Date(generatedData.heroAiGeneratedAt)
    : null;
  const heroAiGenerations = generatedData.heroAiGenerations ?? 0;

  if (!canGenerateHero(heroAiGeneratedAt, heroAiGenerations)) {
    return NextResponse.json(
      {
        error: "Limite atteinte (3 générations / 24h). Réessayez demain.",
      },
      { status: 429 }
    );
  }

  const shopName =
    draft.shopName?.trim() ||
    (typeof generatedData.name === "string" ? generatedData.name : null) ||
    "Ma boutique";

  const result = await generateHeroImage({
    shopId: `preview-${user.id}`,
    shopName,
    tagline:
      typeof generatedData.tagline === "string" ? generatedData.tagline : null,
    category:
      typeof generatedData.category === "string" ? generatedData.category : null,
    primaryColor:
      typeof generatedData.primaryColor === "string"
        ? generatedData.primaryColor
        : null,
  });

  if (!result.success || !result.imageUrl) {
    return NextResponse.json(
      { error: result.error || "Génération échouée" },
      { status: 500 }
    );
  }

  const newGenerations = nextGenerationCount(
    heroAiGeneratedAt,
    heroAiGenerations
  );

  await db.draftShop.update({
    where: { id: draft.id },
    data: {
      generatedData: {
        ...generatedData,
        heroAiGenerations: newGenerations,
        heroAiGeneratedAt: new Date().toISOString(),
      },
    },
  });

  return NextResponse.json({
    ok: true,
    imageUrl: result.imageUrl,
    generationsUsed: newGenerations,
    generationsRemaining: MAX_HERO_GENERATIONS_PER_24H - newGenerations,
  });
}
