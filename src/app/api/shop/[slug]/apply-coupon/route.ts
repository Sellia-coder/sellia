import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCouponForCheckout } from "@/lib/coupons";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const code = String(body.code || "").trim();
    const subtotal = Number(body.subtotal || 0);
    const customerPhone = String(body.customerPhone || "").trim();

    if (!code) {
      return NextResponse.json({ error: "Code requis" }, { status: 400 });
    }

    const shop = await db.shop.findUnique({
      where: { slug: slug.toLowerCase() },
      select: { id: true },
    });
    if (!shop) {
      return NextResponse.json(
        { error: "Boutique introuvable" },
        { status: 404 }
      );
    }

    const result = await validateCouponForCheckout({
      shopId: shop.id,
      code,
      subtotal,
      customerPhone: customerPhone || undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { coupon, discount } = result;

    return NextResponse.json({
      ok: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
      newTotal: Math.max(0, subtotal - discount),
    });
  } catch (err: unknown) {
    console.error("[apply-coupon]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
