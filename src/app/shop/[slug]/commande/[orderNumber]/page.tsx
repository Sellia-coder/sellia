import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import OrderConfirmation from "@/components/shop/OrderConfirmation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { slug, orderNumber } = await params;
  const decoded = decodeURIComponent(orderNumber);
  const order = await db.order.findUnique({
    where: { orderNumber: decoded },
    include: { shop: true },
  });
  if (!order || order.shop.slug !== slug.trim().toLowerCase()) notFound();

  return <OrderConfirmation order={order} shop={order.shop} />;
}
