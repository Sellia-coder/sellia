import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import ShopPageMarkdown from "@/components/shop/ShopPageMarkdown";
import { LEGAL_TEMPLATE_KEYS } from "@/lib/shop/legal-templates";

interface Props {
  params: Promise<{ slug: string; pageSlug: string }>;
}

const RESERVED_SLUGS = new Set([
  "commander",
  "panier",
  "favoris",
  "recherche",
  "produit",
  "contact",
  "a-propos",
  "commande",
  "livraison",
  "panier",
  "faq",
]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  if (RESERVED_SLUGS.has(pageSlug)) return {};

  const shop = await db.shop.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!shop) return {};

  const page = await db.shopPage.findUnique({
    where: { shopId_slug: { shopId: shop.id, slug: pageSlug } },
    select: { title: true, metaDescription: true },
  });

  if (!page) return {};

  return {
    title: page.title,
    description: page.metaDescription || undefined,
  };
}

export default async function ShopCustomPageView({ params }: Props) {
  const { slug, pageSlug } = await params;
  if (RESERVED_SLUGS.has(pageSlug)) notFound();

  const shop = await db.shop.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  if (!shop) notFound();

  const page = await db.shopPage.findUnique({
    where: { shopId_slug: { shopId: shop.id, slug: pageSlug } },
  });

  if (!page || !page.isPublished) notFound();

  return (
    <div className="shop-page-container">
      <article className="shop-page-content">
        <header className="shop-page-header">
          <h1 className="shop-page-title">{page.title}</h1>
          {page.templateKey && LEGAL_TEMPLATE_KEYS.has(page.templateKey) && (
            <p className="shop-page-legal-disclaimer">
              Modèle fourni à titre indicatif — à faire valider par un conseil juridique.
            </p>
          )}
        </header>
        <ShopPageMarkdown content={page.content} />
      </article>
    </div>
  );
}
