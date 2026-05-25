import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { PayoutStatus } from "@prisma/client";
import { computePayoutFees } from "@/lib/cartevo/pricing";

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

    const payoutPhone = shop.payoutPhone || shop.phone;
    if (!payoutPhone) {
      return NextResponse.json(
        {
          error:
            "Méthode de retrait non configurée. Renseignez votre numéro Mobile Money dans les paramètres.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const amount = Math.floor(Number(body.amount) || 0);

    if (amount < 1000) {
      return NextResponse.json(
        { error: "Montant minimum : 1 000 FCFA" },
        { status: 400 }
      );
    }

    const available = await db.payout.findMany({
      where: {
        shopId: shop.id,
        status: PayoutStatus.AVAILABLE,
      },
      orderBy: { createdAt: "asc" },
    });

    const totalAvailable = available.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    if (totalAvailable < amount) {
      return NextResponse.json(
        {
          error: `Solde disponible insuffisant (${Math.floor(totalAvailable).toLocaleString("fr-FR")} FCFA)`,
        },
        { status: 400 }
      );
    }

    let remaining = amount;
    const toRequest: string[] = [];
    for (const p of available) {
      if (remaining <= 0) break;
      toRequest.push(p.id);
      remaining -= Number(p.amount);
    }

    const country = shop.payoutCountry || shop.country || "CM";
    const operator = (shop.payoutOperator || "mtn").replace(
      /_mobile_money$/,
      ""
    );
    const fees = computePayoutFees({
      requestedAmount: amount,
      country,
      operator,
    });
    const feeCartevo = Math.round(fees.cartevoFee);
    const netAmount = Math.round(fees.merchantReceives);

    await db.$transaction(async (tx) => {
      await tx.payout.updateMany({
        where: { id: { in: toRequest } },
        data: {
          status: PayoutStatus.REQUESTED,
          requestedAt: new Date(),
        },
      });
    });

    console.log(
      `[payout request] Shop ${shop.id}: ${amount} ${shop.currency} → ${operator} ${payoutPhone} (net ${netAmount}, fee ${feeCartevo})`
    );

    revalidatePath("/dashboard/paiements");

    return NextResponse.json({
      ok: true,
      requestedAmount: amount,
      feeCartevo,
      netAmount,
      message:
        "Demande de retrait envoyée. Vous recevrez votre argent sous quelques minutes.",
    });
  } catch (err: unknown) {
    console.error("[payout request]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
