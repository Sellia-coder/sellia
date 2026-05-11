import { notFound } from "next/navigation";
import { getPublishedShopBySlug } from "@/lib/shop-data";
import CheckoutClient from "./CheckoutClient";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ method?: string }>;
}

export default async function CommanderPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { method } = await searchParams;
  const shop = await getPublishedShopBySlug(slug);
  if (!shop) notFound();

  return <CheckoutClient shop={shop} initialMethod={method ?? null} />;
}
