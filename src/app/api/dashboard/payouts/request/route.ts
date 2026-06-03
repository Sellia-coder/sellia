import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { PayoutStatus } from "@prisma/client";
import {
  getMerchantWithdrawalFeeRate,
  computePayoutFees,
  CARTEVO_FEES,
  type CartevoCountryCode,
} from "@/lib/cartevo/pricing";
import { cartevoPayout } from "@/lib/cartevo/client";
import type {
  CartevoOperator,
  CartevoCountry,
  CartevoCurrency,
} from "@/lib/cartevo/types";

// Seuil (FCFA) au-delà duquel un retrait passe par une validation agent.
const WITHDRAWAL_AUTO_THRESHOLD = 50000;

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

    // Sélection FIFO des Payout AVAILABLE couvrant le brut demandé.
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

    // Frais de retrait MARCHAND (revenu Sellia) + net réellement versé.
    const withdrawalFeeRate = getMerchantWithdrawalFeeRate(country);
    const withdrawalFee = Math.round(amount * (withdrawalFeeRate / 100));
    const netAmount = amount - withdrawalFee; // ce que le marchand DOIT recevoir

    // Coût Cartevo (pour log/compta — Sellia l'absorbe).
    const cartevoCost = Math.round(
      computePayoutFees({ requestedAmount: netAmount, country, operator })
        .cartevoFee
    );

    // ───────────────────────────────────────────────────────────────
    // CAS A — amount > 50 000 → EN ATTENTE (validation agent)
    // ───────────────────────────────────────────────────────────────
    if (amount > WITHDRAWAL_AUTO_THRESHOLD) {
      try {
        await db.$transaction(async (tx) => {
          const res = await tx.payout.updateMany({
            where: { id: { in: toRequest }, status: PayoutStatus.AVAILABLE },
            data: { status: PayoutStatus.REQUESTED, requestedAt: new Date() },
          });
          if (res.count !== toRequest.length) {
            throw new Error("CONFLICT");
          }
        });
      } catch (err) {
        if (err instanceof Error && err.message === "CONFLICT") {
          return NextResponse.json(
            { error: "Retrait déjà en cours, réessayez." },
            { status: 409 }
          );
        }
        throw err;
      }

      console.log(
        `[payout request] PENDING_VALIDATION shop ${shop.id}: ${amount} ${shop.currency} (net ${netAmount}, withdrawalFee ${withdrawalFee})`
      );
      revalidatePath("/dashboard/paiements");

      return NextResponse.json({
        ok: true,
        mode: "pending_validation",
        requestedAmount: amount,
        withdrawalFee,
        withdrawalFeeRate,
        netAmount,
        message:
          "Retrait de plus de 50 000 FCFA : en cours de validation par un agent. Vous serez payé sous peu.",
      });
    }

    // ───────────────────────────────────────────────────────────────
    // CAS B — amount ≤ 50 000 → AUTO (décaissement Cartevo immédiat)
    // ⚠️ IDEMPOTENCE STRICTE — anti-double-versement.
    // ───────────────────────────────────────────────────────────────

    // B1 — Verrouiller les fonds AVANT tout appel Cartevo.
    try {
      await db.$transaction(async (tx) => {
        const res = await tx.payout.updateMany({
          where: { id: { in: toRequest }, status: PayoutStatus.AVAILABLE },
          data: { status: PayoutStatus.PROCESSING, requestedAt: new Date() },
        });
        if (res.count !== toRequest.length) {
          throw new Error("CONFLICT");
        }
      });
    } catch (err) {
      if (err instanceof Error && err.message === "CONFLICT") {
        return NextResponse.json(
          { error: "Retrait déjà en cours, réessayez." },
          { status: 409 }
        );
      }
      throw err;
    }

    // B2 — Appel Cartevo (HORS transaction). On envoie netAmount : le marchand
    // ne sera JAMAIS sur-payé (voir audit ÉTAPE 0 pt1).
    let payoutOk = false;
    let cartevoRef: string | undefined;
    try {
      // La devise Cartevo dépend du PAYS (comme dans le flux de collecte),
      // pas de shop.currency (qui peut valoir "FCFA").
      const payoutCurrency = (CARTEVO_FEES[country as CartevoCountryCode]
        ?.currency ?? "XAF") as CartevoCurrency;
      const res = await cartevoPayout({
        operator: operator as CartevoOperator,
        country: country as CartevoCountry,
        phone_number: payoutPhone,
        amount: netAmount,
        currency: payoutCurrency,
      });
      const status = res.data?.status;
      payoutOk =
        res.success === true && status !== "FAILED" && status !== "CANCELLED";
      cartevoRef = res.data?.transaction_id;
    } catch (err) {
      console.error("[payout request] cartevoPayout error", err);
      payoutOk = false;
    }

    // B3 — Marquer le résultat (aucun webhook/cron payout n'existe → statut final
    // basé sur la réponse synchrone).
    if (payoutOk) {
      await db.payout.updateMany({
        where: { id: { in: toRequest }, status: PayoutStatus.PROCESSING },
        data: {
          status: PayoutStatus.SUCCESS,
          paidOutAt: new Date(),
          processedAt: new Date(),
          completedAt: new Date(),
          description: cartevoRef
            ? `Retrait auto · Cartevo ${cartevoRef}`
            : "Retrait auto",
        },
      });

      console.log(
        `[payout request] AUTO SUCCESS shop ${shop.id}: brut ${amount}, net ${netAmount}, withdrawalFee ${withdrawalFee}, cartevoCost ${cartevoCost}, ref ${cartevoRef ?? "n/a"}`
      );
      revalidatePath("/dashboard/paiements");

      return NextResponse.json({
        ok: true,
        mode: "auto",
        requestedAmount: amount,
        withdrawalFee,
        withdrawalFeeRate,
        netAmount,
        isFree: withdrawalFeeRate === 0,
        message:
          withdrawalFeeRate === 0
            ? "Versement effectué. Chez Sellia, votre argent vous appartient — les retraits sont gratuits."
            : "Versement effectué. Vous recevez votre argent sous quelques minutes.",
      });
    }

    // ÉCHEC → ROLLBACK : les fonds redeviennent disponibles, RIEN n'est perdu.
    await db.payout.updateMany({
      where: { id: { in: toRequest }, status: PayoutStatus.PROCESSING },
      data: { status: PayoutStatus.AVAILABLE, requestedAt: new Date() },
    });

    console.error(
      `[payout request] AUTO FAILED (rollback) shop ${shop.id}: brut ${amount}, net ${netAmount}`
    );
    revalidatePath("/dashboard/paiements");

    return NextResponse.json(
      {
        error:
          "Le versement a échoué. Vos fonds restent disponibles, réessayez.",
      },
      { status: 502 }
    );
  } catch (err: unknown) {
    console.error("[payout request]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
