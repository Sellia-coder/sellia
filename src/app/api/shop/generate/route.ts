import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateShop } from "@/lib/ai/generateShop";
import {
  enforceAiRateLimit,
  getMerchantPlanForUser,
  merchantKeyForIp,
  merchantKeyForUser,
} from "@/lib/ai/merchant-rate-limit";
import { getClientIp } from "@/lib/security/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";

const DRAFT_TTL_HOURS = 24;
const MIN_PROMPT_LENGTH = 30;
const MAX_PROMPT_LENGTH = 2000;
const MIN_SHOP_NAME_LENGTH = 2;
const MAX_SHOP_NAME_LENGTH = 60;

// Rate limiting legacy IP (draft count) — complété par quotas IA marchand/IP
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_HOURS = 1;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = String(body.prompt || "").trim();
    const shopName = String(body.shopName || "").trim();

    // Validation prompt
    if (prompt.length < MIN_PROMPT_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Description trop courte (minimum ${MIN_PROMPT_LENGTH} caractères).` },
        { status: 400 }
      );
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Description trop longue (maximum ${MAX_PROMPT_LENGTH} caractères).` },
        { status: 400 }
      );
    }

    // Validation shopName
    if (shopName.length < MIN_SHOP_NAME_LENGTH) {
      return NextResponse.json(
        { success: false, error: "Le nom de boutique est requis (au moins 2 caractères)." },
        { status: 400 }
      );
    }
    if (shopName.length > MAX_SHOP_NAME_LENGTH) {
      return NextResponse.json(
        { success: false, error: "Le nom de boutique est trop long (max 60 caractères)." },
        { status: 400 }
      );
    }

    // Récupérer IP pour rate limiting
    const ipAddress = getClientIp(req.headers);

    const user = await getCurrentUser();
    const merchantKey = user?.id
      ? merchantKeyForUser(user.id)
      : merchantKeyForIp(ipAddress);
    const plan = user?.id ? await getMerchantPlanForUser(user.id) : "free";

    const aiRate = enforceAiRateLimit(merchantKey, "text_shop_generate", plan);
    if (!aiRate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: aiRate.message,
          retryAfterSec: aiRate.retryAfterSec,
        },
        { status: 429, headers: { "Retry-After": String(aiRate.retryAfterSec) } }
      );
    }

    // Rate limiting legacy (compteur drafts par IP)
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000);
    const recentCount = await db.draftShop.count({
      where: {
        ipAddress,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { success: false, error: `Trop de générations récentes. Réessayez dans ${RATE_LIMIT_WINDOW_HOURS}h.` },
        { status: 429 }
      );
    }

    // Créer le DraftShop en status "pending"
    const expiresAt = new Date(Date.now() + DRAFT_TTL_HOURS * 60 * 60 * 1000);
    const draft = await db.draftShop.create({
      data: {
        prompt,
        shopName,
        status: "pending",
        ipAddress,
        expiresAt,
      },
    });

    // Lancer la génération en arrière-plan (non bloquant)
    // Note: Next.js serverless ne garantit pas l'exécution post-response,
    // mais ça suffit pour le MVP. Pour production-grade, utiliser BullMQ.
    generateShopAsync(draft.id, prompt, shopName).catch((err) => {
      console.error("[/api/shop/generate] Background generation error:", err);
    });

    return NextResponse.json({
      success: true,
      draftShopId: draft.id,
    });
  } catch (err) {
    console.error("[/api/shop/generate] Exception:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur. Réessayez." },
      { status: 500 }
    );
  }
}

/**
 * Génère la boutique en arrière-plan et met à jour le DraftShop.
 */
async function generateShopAsync(draftId: string, prompt: string, shopName: string) {
  const result = await generateShop(prompt, shopName);

  if (result.success && result.data) {
    // succès : stocker les données et passer en "ready"
    await db.draftShop.update({
      where: { id: draftId },
      data: {
        status: "ready",
        generatedData: result.data as unknown as object,
      },
    });
  } else {
    // échec : marquer comme failed
    await db.draftShop.update({
      where: { id: draftId },
      data: {
        status: "failed",
        errorMessage: result.error || "Erreur inconnue",
      },
    });
  }
}
