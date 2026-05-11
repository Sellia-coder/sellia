import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const shop = await db.shop.findFirst({
      where: { slug },
      select: { id: true, plan: true },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Boutique introuvable" },
        { status: 404 }
      );
    }

    if (body.paymentMethod === "cash_on_delivery" && shop.plan !== "pro") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Le paiement à la livraison n\u2019est pas disponible pour cette boutique.",
        },
        { status: 403 }
      );
    }

    const qrCode = randomBytes(8).toString("hex").toUpperCase();
    const orderNumber = `SEL-${randomBytes(3).toString("hex").toUpperCase()}`;

    const refundDeadline = new Date();
    refundDeadline.setDate(refundDeadline.getDate() + 6);

    const order = await db.order.create({
      data: {
        orderNumber,
        shopId: shop.id,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail ?? null,
        customerAddress: body.deliveryAddress ?? null,
        customerCity: body.deliveryCity ?? null,
        customerNotes: body.deliveryNotes ?? null,
        paymentMethod: body.paymentMethod,
        paymentSubMethod: body.paymentSubMethod ?? null,
        paymentProvider: body.paymentProvider ?? null,
        subtotal: body.subtotal,
        shippingPrice: body.shippingFee ?? 0,
        total: body.total,
        qrCode,
        status: body.paymentMethod === "online_escrow" ? "paid" : "pending",
        paymentStatus:
          body.paymentMethod === "online_escrow" ? "paid" : "pending",
        paidAt: body.paymentMethod === "online_escrow" ? new Date() : null,
        refundDeadline:
          body.paymentMethod === "online_escrow" ? refundDeadline : null,
        items: body.items,
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      qrCode: order.qrCode,
    });
  } catch (err) {
    console.error("[POST /orders] Error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
