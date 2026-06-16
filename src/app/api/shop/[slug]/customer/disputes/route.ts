import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DISPUTE_REASONS } from "@/lib/disputes/constants";
import {
  getShopBySlugForCustomer,
  verifyCustomerOwnsOrder,
} from "@/lib/shop-customer/orders";
import { getShopCustomerSession } from "@/lib/shop-customer/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const shop = await getShopBySlugForCustomer(slug);
  if (!shop) {
    return NextResponse.json({ ok: false, error: "Boutique introuvable" }, { status: 404 });
  }

  const session = await getShopCustomerSession(shop.id);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Non connecté" }, { status: 401 });
  }

  let body: { orderId?: string; reason?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  const reason = body.reason?.trim();
  const description = body.description?.trim() ?? "";

  if (!orderId || !reason) {
    return NextResponse.json({ ok: false, error: "Champs requis manquants" }, { status: 400 });
  }

  if (!DISPUTE_REASONS.some((r) => r.value === reason)) {
    return NextResponse.json({ ok: false, error: "Motif invalide" }, { status: 400 });
  }

  if (description.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Décrivez votre problème (10 caractères minimum)" },
      { status: 400 }
    );
  }

  const owns = await verifyCustomerOwnsOrder(shop.id, session.email, orderId);
  if (!owns) {
    return NextResponse.json({ ok: false, error: "Commande introuvable" }, { status: 403 });
  }

  const existing = await db.dispute.findUnique({ where: { orderId } });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "Un litige existe déjà pour cette commande" },
      { status: 409 }
    );
  }

  const dispute = await db.dispute.create({
    data: {
      orderId,
      shopId: shop.id,
      customerEmail: session.email,
      reason,
      description: description.slice(0, 2000),
      status: "OPEN",
    },
  });

  return NextResponse.json({
    ok: true,
    disputeId: dispute.id,
    status: dispute.status,
  });
}
