import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedShopBySlug,
  getShopCategoryTemplate,
} from "@/lib/shop-data";
import { CartProvider } from "@/components/shop/CartProvider";
import SeliaMenuPro from "@/components/shop/SeliaMenuPro";
import ShopFooter from "@/components/shop/ShopFooter";
import PreFooterTrust from "@/components/shop/PreFooterTrust";
import ToastProvider from "@/components/shop/ToastProvider";
import "./shop.css";

export const dynamic = "force-dynamic";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) {
    return { title: "Boutique introuvable" };
  }
  const description =
    shop.tagline ??
    (shop.description ? shop.description.replace(/<[^>]+>/g, "").slice(0, 160) : null) ??
    `Boutique en ligne ${shop.name}`;

  const canonical = `https://${shop.slug}.getsellia.com`;

  return {
    title: shop.seoTitle ?? shop.name,
    description: shop.seoDescription ?? description,
    metadataBase: new URL("https://getsellia.com"),
    alternates: { canonical },
    openGraph: {
      title: shop.seoTitle ?? shop.name,
      description: shop.seoDescription ?? description,
      type: "website",
      siteName: shop.name,
      url: canonical,
      images: shop.ogImageUrl
        ? [{ url: shop.ogImageUrl, alt: shop.name }]
        : shop.logoUrl
          ? [{ url: shop.logoUrl, alt: shop.name }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: shop.name,
      description: shop.seoDescription ?? description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ShopLayout({ children, params }: Props) {
  const { slug } = await params;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) notFound();

  const template = getShopCategoryTemplate(shop.category);
  const cssVars: React.CSSProperties = {
    ["--shop-primary" as string]: shop.primaryColor ?? "#E84B1F",
    ["--shop-secondary" as string]: shop.secondaryColor ?? "#0E1116",
    ["--shop-accent" as string]: shop.accentColor ?? "#E84B1F",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: shop.name,
    description:
      shop.tagline ??
      (shop.description ? shop.description.replace(/<[^>]+>/g, "").slice(0, 280) : undefined),
    url: `https://${shop.slug}.getsellia.com`,
    image: shop.logoUrl ?? undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CartProvider shopSlug={shop.slug}>
        <div className={`shop-root shop-template-${template}`} style={cssVars}>
          <SeliaMenuPro shop={shop} />
          <main className="shop-main">{children}</main>
          <PreFooterTrust />
          <ShopFooter shop={shop} />
          <ToastProvider />
        </div>
      </CartProvider>
    </>
  );
}
