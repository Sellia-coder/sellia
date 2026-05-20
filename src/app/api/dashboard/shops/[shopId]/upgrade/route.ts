import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyShopOwnership } from "@/lib/security/shop-auth";
import { SELLIA_PLANS } from "@/lib/cartevo/pricing";
import { z } from "zod/v3";

const bodySchema = z.object({
  targetPlan: z.enum(["pro", "business"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  const user = await getCurrentUser();
  const { shopId } = await params;
  const auth = await verifyShopOwnership(user?.id, shopId);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { targetPlan } = parsed.data;
  const plan = SELLIA_PLANS[targetPlan];

  const existing = await db.shop.findUnique({
    where: { id: shopId },
    select: { proSince: true, businessSince: true },
  });

  const now = new Date();
  const renewalAt = new Date();
  renewalAt.setMonth(renewalAt.getMonth() + 1);

  await db.shop.update({
    where: { id: shopId },
    data: {
      plan: targetPlan,
      ...(targetPlan === "pro" && !existing?.proSince ? { proSince: now } : {}),
      ...(targetPlan === "business" && !existing?.businessSince
        ? { businessSince: now }
        : {}),
      planRenewalAt: renewalAt,
    },
  });

  return NextResponse.json({
    ok: true,
    plan: plan.name,
    checkoutUrl: `/dashboard/parametres/abonnement?upgraded=${targetPlan}`,
  });
}
