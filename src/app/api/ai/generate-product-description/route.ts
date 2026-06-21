import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { callClaude } from "@/lib/ai/anthropic";
import {
  enforceAiRateLimit,
  getMerchantPlanForUser,
  merchantKeyForUser,
} from "@/lib/ai/merchant-rate-limit";

type ToneKey = "commerce" | "story" | "tech";

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fence ? fence[1]!.trim() : trimmed;
  try {
    const v = JSON.parse(jsonStr);
    return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function coerceVersions(parsed: Record<string, unknown>): Record<ToneKey, string> | null {
  const out: Partial<Record<ToneKey, string>> = {};
  for (const key of ["commerce", "story", "tech"] as ToneKey[]) {
    const val = parsed[key];
    if (typeof val !== "string" || !val.trim()) return null;
    out[key] = val.trim();
  }
  return out as Record<ToneKey, string>;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
  }

  let body: {
    productName?: string;
    productCategory?: string;
    productType?: string;
    shopName?: string | null;
    shopCategory?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const productName = (body.productName ?? "").trim();
  if (!productName) {
    return NextResponse.json({ ok: false, error: "Nom du produit requis" }, { status: 400 });
  }

  const plan = await getMerchantPlanForUser(user.id);
  const rate = enforceAiRateLimit(
    merchantKeyForUser(user.id),
    "text_description",
    plan
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: rate.message, retryAfterSec: rate.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  const ctx = `
Boutique : ${body.shopName ?? "non précisée"}
Univers / catégorie boutique : ${body.shopCategory ?? "non précisée"}
Produit : ${productName}
Catégorie produit (code) : ${body.productCategory ?? "non précisée"}
Type de produit : ${body.productType ?? "physical"}
`.trim();

  const userPrompt = `${ctx}

Réponds UNIQUEMENT avec un objet JSON UTF-8 (pas de markdown, pas de texte avant ou après) ayant EXACTEMENT ces trois clés : "commerce", "story", "tech".
Chaque valeur est une chaîne HTML courte (quelques balises <p>, éventuellement <ul>/<li>), en français naturel pour des clients francophones :
- commerce : axe bénéfices, preuve sociale légère, appel à l'action doux ;
- story : récit, valeur, émotion ;
- tech : précision sur usage, matière, livraison / usage, garantie de sérieux ;

N'invente pas de données factuelles impossibles ; reste plausible.`;

  const res = await callClaude(userPrompt, {
    system:
      "Tu es un assistant e-commerce francophone expert. Réponses strictement au format JSON attendu avec les trois clés string HTML.",
    maxTokens: 4096,
    temperature: 0.65,
  });

  if (!res.success || !res.text) {
    return NextResponse.json(
      { ok: false, error: res.error ?? "Réponse IA vide" },
      { status: 502 },
    );
  }

  const parsedObj = extractJsonObject(res.text);
  if (!parsedObj) {
    return NextResponse.json({ ok: false, error: "Format de réponse IA invalide" }, { status: 502 });
  }

  const versions = coerceVersions(parsedObj);
  if (!versions) {
    return NextResponse.json({ ok: false, error: "Réponse IA incomplète" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, versions });
}
