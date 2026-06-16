import { db } from "@/lib/db";
import { buildLegalPageContents, type ShopLegalContext } from "./legal-templates";

export type { ShopLegalContext } from "./legal-templates";

/**
 * Génère les pages légales par défaut (CGV, confidentialité, mentions légales, retours).
 * Idempotent : ne crée pas si le slug existe déjà (ne réécrase pas une page éditée).
 */
export async function generateLegalPagesForShop(
  shop: ShopLegalContext
): Promise<{ createdCount: number }> {
  const pages = buildLegalPageContents(shop);
  let createdCount = 0;

  for (const page of pages) {
    const existing = await db.shopPage.findUnique({
      where: { shopId_slug: { shopId: shop.id, slug: page.slug } },
    });
    if (existing) continue;

    await db.shopPage.create({
      data: {
        shopId: shop.id,
        slug: page.slug,
        title: page.title,
        content: page.content,
        metaDescription: page.metaDescription,
        templateKey: page.templateKey,
        isPublished: true,
        showInFooter: true,
      },
    });
    createdCount++;
  }

  return { createdCount };
}
