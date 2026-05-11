import { notFound } from "next/navigation";
import { getPublishedShopBySlug } from "@/lib/shop-data";
import ShopHero from "@/components/shop/ShopHero";
import ShopProductListing from "@/components/shop/ShopProductListing";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ShopHomePage({ params }: Props) {
  const { slug } = await params;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) notFound();

  return (
    <>
      <ShopHero shop={shop} />

      <ShopProductListing shop={shop} />
    </>
  );
}
