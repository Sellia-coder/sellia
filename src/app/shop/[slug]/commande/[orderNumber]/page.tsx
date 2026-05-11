import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import OrderConfirmation from "./OrderConfirmation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { slug, orderNumber } = await params;
  const decoded = decodeURIComponent(orderNumber);

  const order = await db.order.findFirst({
    where: {
      orderNumber: decoded,
      shop: { slug },
    },
    include: {
      shop: {
        select: {
          slug: true,
          name: true,
          primaryColor: true,
          phone: true,
          email: true,
          whatsappNumber: true,
        },
      },
    },
  });

  if (!order) notFound();

  return <OrderConfirmation order={order as any} />;
}
