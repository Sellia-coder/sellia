import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = await db.shop.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!shop) return {};
  return {
    title: `FAQ — ${shop.name}`,
    description: `Questions fréquentes — ${shop.name}.`,
  };
}

export default async function ShopFaqPage({ params }: Props) {
  const { slug } = await params;

  const shop = await db.shop.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  if (!shop) notFound();

  const faqs = await db.shopFaq.findMany({
    where: { shopId: shop.id, isPublished: true },
    select: { id: true, question: true, answer: true, category: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  if (faqs.length === 0) notFound();

  // Regroupe par catégorie (les entrées sans catégorie sont regroupées sous "").
  const groups = new Map<string, typeof faqs>();
  for (const faq of faqs) {
    const key = faq.category?.trim() || "";
    const arr = groups.get(key);
    if (arr) arr.push(faq);
    else groups.set(key, [faq]);
  }

  return (
    <div className="shop-page-container">
      <article className="shop-page-content">
        <header className="shop-page-header">
          <h1 className="shop-page-title">Questions fréquentes</h1>
        </header>

        {Array.from(groups.entries()).map(([category, items]) => (
          <section key={category || "general"} style={{ marginBottom: 28 }}>
            {category && (
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  margin: "0 0 12px",
                  color: "var(--shop-ink, #0E1116)",
                }}
              >
                {category}
              </h2>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((faq) => (
                <details
                  key={faq.id}
                  style={{
                    border: "1px solid var(--shop-border, #E5E2DA)",
                    borderRadius: 12,
                    background: "#FFFFFF",
                    overflow: "hidden",
                  }}
                >
                  <summary
                    style={{
                      cursor: "pointer",
                      listStyle: "none",
                      padding: "16px 18px",
                      fontSize: 15.5,
                      fontWeight: 600,
                      color: "var(--shop-ink, #0E1116)",
                    }}
                  >
                    {faq.question}
                  </summary>
                  <div
                    style={{
                      padding: "0 18px 16px",
                      fontSize: 14.5,
                      lineHeight: 1.7,
                      color: "var(--shop-muted, #4B5563)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
