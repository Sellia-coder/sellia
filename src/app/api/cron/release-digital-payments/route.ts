import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPayoutFromOrder } from "@/lib/payouts";
import { getOrderTypeKind, type OrderItem } from "@/lib/order-status";
import { PayoutType } from "@prisma/client";
import { ORDER_STATUS } from "@/lib/cartevo/order-status";

const RELEASE_DELAY_MS = 3 * 60 * 60 * 1000;

interface ProcessResult {
  scanned: number;
  released: number;
  errors: Array<{ orderId: string; error: string }>;
}

function authorizeCron(req: NextRequest): boolean {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const token = url.searchParams.get("token");
  const expected = process.env.CRON_SECRET;
  return !!expected && (secret === expected || token === expected);
}

async function processRelease(): Promise<NextResponse> {
  const result: ProcessResult = {
    scanned: 0,
    released: 0,
    errors: [],
  };

  try {
    const threshold = new Date(Date.now() - RELEASE_DELAY_MS);

    const candidates = await db.order.findMany({
      where: {
        paymentStatus: "paid_escrow",
        paidAt: { lte: threshold },
        qrScannedAt: null,
        payouts: { none: {} },
      },
      select: {
        id: true,
        orderNumber: true,
        items: true,
      },
      take: 200,
    });

    result.scanned = candidates.length;

    for (const order of candidates) {
      try {
        const items = order.items as unknown as OrderItem[];
        const kind = getOrderTypeKind(items);
        // G4.B — Filet de sécurité : digital/service sont normalement libérés
        // INSTANTANÉMENT au paiement (settlePaidOrderPayout). Ce cron ne traite
        // que les anciennes commandes ou les cas où la libération au paiement
        // aurait échoué. Le physique n'est JAMAIS auto-libéré (code client requis).
        if (kind !== "digital" && kind !== "service") continue;

        await db.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "paid_released",
            status: ORDER_STATUS.DELIVERED,
            deliveredAt: new Date(),
          },
        });

        await createPayoutFromOrder({
          orderId: order.id,
          payoutType:
            kind === "service"
              ? PayoutType.ORDER_SERVICE
              : PayoutType.ORDER_DIGITAL,
          releaseImmediately: true,
        });

        result.released++;
      } catch (err: unknown) {
        result.errors.push({
          orderId: order.id,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: unknown) {
    console.error("[cron release-digital-payments]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json(
      { ok: false, error: message, ...result },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return processRelease();
}

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return processRelease();
}
