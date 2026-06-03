"use server";

import { db } from "@/lib/db";
import { ReportReason } from "@prisma/client";

const REASONS = [
  "COUNTERFEIT",
  "INAPPROPRIATE",
  "MISLEADING",
  "SCAM",
  "PROHIBITED",
  "OTHER",
] as const;

export async function createReportAction(input: {
  productId: string;
  reason: string;
  description: string;
  reporterName?: string;
  reporterEmail?: string;
}) {
  try {
    if (!input.productId || !input.reason || !input.description?.trim()) {
      return { ok: false, error: "Veuillez remplir tous les champs requis" };
    }
    if (!REASONS.includes(input.reason as (typeof REASONS)[number])) {
      return { ok: false, error: "Motif invalide" };
    }
    if (input.description.trim().length < 10) {
      return {
        ok: false,
        error: "Veuillez détailler votre signalement (10 caractères min)",
      };
    }

    const product = await db.product.findUnique({
      where: { id: input.productId },
      select: { id: true, shopId: true },
    });
    if (!product) return { ok: false, error: "Produit introuvable" };

    await db.productReport.create({
      data: {
        productId: product.id,
        shopId: product.shopId,
        reason: input.reason as ReportReason,
        description: input.description.trim(),
        reporterName: input.reporterName?.trim() || null,
        reporterEmail: input.reporterEmail?.trim() || null,
      },
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return { ok: false, error: message };
  }
}
