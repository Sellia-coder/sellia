import { notFound } from "next/navigation";
import { getPublishedShopBySlug } from "@/lib/shop-data";
import CartView from "@/components/shop/CartView";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ method?: string; checkout?: string }>;
}

export default async function CartPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) notFound();

  return (
    <CartView
      shop={shop}
      initialMethod={sp.method ?? null}
      initialCheckout={sp.checkout === "1"}
    />
  );
}
