import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import PayoutDetailClient from "./PayoutDetailClient";

export default async function PayoutDetailPage({
  params,
}: {
  params: Promise<{ payoutId: string }>;
}) {
  const { payoutId } = await params;
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const payout = await db.payout.findUnique({
    where: { id: payoutId },
    include: {
      shop: { select: { ownerId: true, currency: true, name: true } },
      order: {
        select: {
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          total: true,
          paymentStatus: true,
          status: true,
        },
      },
    },
  });

  if (!payout || payout.shop.ownerId !== user.id) notFound();

  return (
    <PayoutDetailClient
      currency={payout.shop.currency || "FCFA"}
      payout={{
        id: payout.id,
        amount: Number(payout.amount),
        grossAmount: payout.grossAmount ? Number(payout.grossAmount) : null,
        commissionAmount: payout.commissionAmount
          ? Number(payout.commissionAmount)
          : null,
        commissionRate: payout.commissionRate
          ? Number(payout.commissionRate)
          : null,
        feeCartevo: Number(payout.feeCartevo),
        netAmount: Number(payout.netAmount),
        currency: payout.currency,
        status: payout.status,
        payoutType: payout.payoutType,
        operator: payout.operator,
        country: payout.country,
        phoneNumber: payout.phoneNumber,
        description: payout.description,
        createdAt: payout.createdAt.toISOString(),
        releasedAt: payout.releasedAt?.toISOString() || null,
        paidOutAt: payout.paidOutAt?.toISOString() || null,
        requestedAt: payout.requestedAt.toISOString(),
        completedAt: payout.completedAt?.toISOString() || null,
        orderNumber: payout.order?.orderNumber || null,
        customerName: payout.order?.customerName || null,
        customerPhone: payout.order?.customerPhone || null,
        orderPaymentStatus: payout.order?.paymentStatus || null,
        orderStatus: payout.order?.status || null,
      }}
    />
  );
}
