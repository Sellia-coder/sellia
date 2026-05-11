import { notFound } from "next/navigation";
import { getPublishedShopBySlug } from "@/lib/shop-data";
import CartView from "@/components/shop/CartView";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CartPage({ params }: Props) {
  const { slug } = await params;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) notFound();

  return <CartView shop={shop} />;
}
