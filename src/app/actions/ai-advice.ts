"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getShopKpis, getTopProducts } from "@/lib/analytics";
import { getShopBalances } from "@/lib/payouts";
import {
  enforceAiRateLimit,
  merchantKeyForUser,
  planToTier,
} from "@/lib/ai/merchant-rate-limit";

interface Advice {
  titre: string;
  conseil: string;
  priorite: string;
}

export async function generateMerchantAdviceAction(): Promise<
  | { ok: true; advice: Advice[] }
  | { ok: false; error: string }
> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Non autorisé" };

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true, name: true, category: true, currency: true, plan: true },
    });
    if (!shop) return { ok: false, error: "Boutique introuvable" };

    const rate = enforceAiRateLimit(
      merchantKeyForUser(user.id),
      "text_advice",
      planToTier(shop.plan)
    );
    if (!rate.allowed) {
      return { ok: false, error: rate.message };
    }

    const [kpis, topProducts, balances, productCount, orderCount] =
      await Promise.all([
        getShopKpis(shop.id, "30d"),
        getTopProducts(shop.id, "30d", 5),
        getShopBalances(shop.id),
        db.product.count({ where: { shopId: shop.id } }),
        db.order.count({ where: { shopId: shop.id } }),
      ]);

    const context = {
      boutique: shop.name,
      categorie: shop.category || "non spécifiée",
      devise: shop.currency || "FCFA",
      nbProduits: productCount,
      nbCommandes: orderCount,
      kpis,
      topProduits: topProducts.map((p) => ({
        nom: p.name,
        ventes: p.quantity,
        ca: p.revenue,
      })),
      soldeDisponible: balances.available,
      fondsEnAttente: balances.pendingEscrow,
    };

    const prompt = `Tu es un conseiller e-commerce expert pour les marchands d'Afrique francophone (Mobile Money, paiement à la livraison, marché local).

Voici les données réelles de la boutique "${shop.name}" sur les 30 derniers jours :
${JSON.stringify(context, null, 2)}

Donne EXACTEMENT 3 conseils concrets, actionnables et personnalisés selon ces données réelles. Chaque conseil doit :
- Être spécifique à la situation (pas générique)
- Tenir en 1-2 phrases maximum
- Être directement applicable cette semaine
- Tenir compte du contexte africain francophone

Réponds UNIQUEMENT en JSON valide, sans markdown, format exact :
[{"titre":"...","conseil":"...","priorite":"haute|moyenne|basse"}]`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return { ok: false, error: "Service de conseils indisponible" };
    }

    const data = await response.json();
    const text = (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let advice: unknown;
    try {
      advice = JSON.parse(text);
    } catch {
      return { ok: false, error: "Réponse invalide" };
    }

    if (!Array.isArray(advice)) return { ok: false, error: "Format inattendu" };

    return { ok: true, advice: (advice as Advice[]).slice(0, 3) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur serveur",
    };
  }
}
