import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getShopProductBySlug } from "@/lib/shop-data";
import OrderForm from "@/components/shop/OrderForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; productSlug: string }>;
}

function OrderSkeleton() {
  return (
    <section className="shop-order">
      <div className="shop-container shop-page">
        <p className="shop-page-tagline">Chargement du formulaire…</p>
      </div>
    </section>
  );
}

export default async function OrderPage({ params }: Props) {
  const { slug, productSlug } = await params;
  const result = await getShopProductBySlug(slug, productSlug);
  if (!result) notFound();

  return (
    <Suspense fallback={<OrderSkeleton />}>
      <OrderForm shop={result.shop} product={result.product} />
    </Suspense>
  );
}
