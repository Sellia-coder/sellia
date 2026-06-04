import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getShopProductBySlug,
  getRelatedProducts,
  getApprovedProductReviews,
} from "@/lib/shop-data";
import ProductDetail from "@/components/shop/ProductDetail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; productSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const result = await getShopProductBySlug(slug, productSlug);
  if (!result) return { title: "Produit introuvable" };
  const { shop, product } = result;
  const desc =
    product.metaDescription ??
    product.shortDescription ??
    product.name;

  const url = `https://${shop.slug}.getsellia.com/produit/${productSlug}`;

  return {
    title: product.metaTitle ?? `${product.name} — ${shop.name}`,
    description: desc,
    openGraph: {
      title: product.name,
      description: desc,
      url,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: desc,
    },
    alternates: { canonical: url },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug, productSlug } = await params;
  const result = await getShopProductBySlug(slug, productSlug);
  if (!result) notFound();

  const { shop, product: rawProduct } = result;

  const normalizedProduct = {
    ...rawProduct,
    variants: rawProduct.variants?.map((v) => ({
      ...v,
      attributes:
        v.attributes && typeof v.attributes === "object" && !Array.isArray(v.attributes)
          ? (v.attributes as Record<string, string>)
          : {},
    })) ?? [],
  };

  const product = normalizedProduct;
  const [related, reviews] = await Promise.all([
    getRelatedProducts(shop.id, product.id, 5),
    getApprovedProductReviews(product.id),
  ]);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.name,
    image: product.imageUrl ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency ?? "XAF",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
    brand: { "@type": "Brand", name: shop.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="shop-product-page-wrapper">
        <ProductDetail
          shop={{
            id: shop.id,
            slug: shop.slug,
            name: shop.name,
            primaryColor: shop.primaryColor,
            currency: shop.currency,
            paymentCashOnDelivery: shop.paymentCashOnDelivery,
            paymentOnlineEscrow: shop.paymentOnlineEscrow,
          }}
          product={{
            ...product,
            // Sérialise la Date en ISO string pour un passage fiable
            // serveur → client (PromoCountdown la reparse via new Date()).
            promoEndsAt: product.promoEndsAt
              ? new Date(product.promoEndsAt).toISOString()
              : null,
          }}
          related={related}
          reviews={reviews}
        />
      </div>
    </>
  );
}
