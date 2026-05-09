import { notFound } from "next/navigation";
import { getPublishedShopBySlug } from "@/lib/shop-data";
import FavoritesView from "@/components/shop/FavoritesView";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function FavoritesPage({ params }: Props) {
  const { slug } = await params;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) notFound();

  return <FavoritesView shop={shop} />;
}
