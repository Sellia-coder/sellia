/**
 * G2.1.I — Génération d'image hero pour boutique via OpenAI gpt-image-1
 *
 * - Modèle : gpt-image-1 (1536x1024, quality medium)
 * - Réponse base64 → stockage local public/uploads/heroes/
 *
 * Ne throw jamais : retourne { success: false } en cas d'échec.
 */

import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

const HEROES_DIR = path.join(process.cwd(), "public", "uploads", "heroes");

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "[hero-ai] OPENAI_API_KEY not configured, skipping AI generation"
    );
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export interface GenerateHeroParams {
  shopId: string;
  shopName: string;
  tagline?: string | null;
  category?: string | null;
  primaryColor?: string | null;
}

export interface GenerateHeroResult {
  success: boolean;
  imageUrl?: string;
  prompt?: string;
  error?: string;
}

function buildPrompt(params: GenerateHeroParams): string {
  const { shopName, tagline, category, primaryColor } = params;

  const categoryHints: Record<string, string> = {
    jewelry: "luxury jewelry, gold and silver pieces, elegant display",
    bijoux: "luxury jewelry, gold and silver pieces, elegant display",
    mode: "fashion editorial, model wearing premium clothing",
    fashion: "fashion editorial, model wearing premium clothing",
    tech: "modern technology, sleek devices, futuristic atmosphere",
    smartphone: "premium smartphone on minimal background",
    beauty: "premium beauty products, soft lighting, cosmetics",
    cosmetic: "premium beauty products, soft lighting, cosmetics",
    food: "appetizing food, restaurant ambiance, warm lighting",
    restaurant: "appetizing food, restaurant ambiance, warm lighting",
    home: "interior design, modern home decor, elegant living space",
    deco: "interior design, modern home decor, elegant living space",
  };

  const categoryKey = (category || "").toLowerCase();
  const categoryHint =
    Object.entries(categoryHints).find(([k]) => categoryKey.includes(k))?.[1] ||
    "premium African boutique products, editorial style";

  return [
    `Premium e-commerce hero banner background for an African boutique called "${shopName}".`,
    tagline ? `Tagline: "${tagline}".` : "",
    `Subject: ${categoryHint}.`,
    "Style: editorial magazine-quality photography, premium, sophisticated, modern African luxury aesthetic.",
    "Composition: cinematic wide shot, subject positioned on the right side, leaving negative space on the left for text overlay.",
    "Lighting: golden hour, soft warm tones.",
    primaryColor ? `Color harmony with ${primaryColor}.` : "",
    "STRICTLY NO TEXT, NO LOGOS, NO WATERMARKS, NO LETTERS visible in the image.",
    "High resolution, photorealistic, professional commercial photography, depth of field.",
  ]
    .filter(Boolean)
    .join(" ");
}

async function saveBase64Image(b64: string, shopId: string): Promise<string> {
  await fs.mkdir(HEROES_DIR, { recursive: true });
  const timestamp = Date.now();
  const filename = `${shopId}-${timestamp}.png`;
  const filepath = path.join(HEROES_DIR, filename);
  const buffer = Buffer.from(b64, "base64");
  await fs.writeFile(filepath, buffer);
  return `/uploads/heroes/${filename}`;
}

export async function generateHeroImage(
  params: GenerateHeroParams
): Promise<GenerateHeroResult> {
  const openai = getOpenAI();
  if (!openai) {
    return { success: false, error: "OpenAI not configured" };
  }

  const prompt = buildPrompt(params);

  try {
    console.log(`[hero-ai] Generating hero for shop ${params.shopId}...`);

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1536x1024",
      quality: "medium",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      return {
        success: false,
        error: "No image data in OpenAI response",
      };
    }

    console.log("[hero-ai] OpenAI returned image, saving...");
    const publicUrl = await saveBase64Image(b64, params.shopId);
    console.log(`[hero-ai] Stored at ${publicUrl}`);

    return {
      success: true,
      imageUrl: publicUrl,
      prompt,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[hero-ai] Generation failed:", message);
    return {
      success: false,
      error: message || "Unknown error",
    };
  }
}
