import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { createMerchantWithdrawal } from "@/lib/payouts/withdrawal";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: {
        id: true,
        currency: true,
        country: true,
        payoutPhone: true,
        payoutOperator: true,
        payoutCountry: true,
        phone: true,
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Aucune boutique trouvée" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const amount = Math.floor(Number(body.amount) || 0);

    const result = await createMerchantWithdrawal(shop, amount);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    revalidatePath("/dashboard/paiements");

    return NextResponse.json({
      ok: true,
      mode: result.mode,
      requestedAmount: result.requestedAmount,
      withdrawalFee: result.withdrawalFee,
      withdrawalFeeRate: result.withdrawalFeeRate,
      netAmount: result.netAmount,
      isFree: result.isFree,
      message: result.message,
    });
  } catch (err: unknown) {
    console.error("[payout request]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
