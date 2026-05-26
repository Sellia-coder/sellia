import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import PagesClient from "./PagesClient";

export default async function PagesContenuPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true, slug: true },
  });

  if (!shop) redirect("/personnaliser-ma-boutique");

  const [pages, faqs] = await Promise.all([
    db.shopPage.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: "desc" },
    }),
    db.shopFaq.findMany({
      where: { shopId: shop.id },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <PagesClient
      shopSlug={shop.slug}
      pages={pages.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        content: p.content,
        metaDescription: p.metaDescription,
        isPublished: p.isPublished,
        showInHeader: p.showInHeader,
        showInFooter: p.showInFooter,
        templateKey: p.templateKey,
        createdAt: p.createdAt.toISOString(),
      }))}
      faqs={faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
        order: f.order,
        isPublished: f.isPublished,
      }))}
    />
  );
}
