import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email/client";
import { safeLogger } from "@/lib/security/redact";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; orderNumber: string }> }
) {
  const { slug, orderNumber } = await params;
  const decoded = decodeURIComponent(orderNumber);

  const order = await db.order.findFirst({
    where: { orderNumber: decoded, shop: { slug } },
    include: {
      shop: {
        select: {
          name: true,
          slug: true,
          primaryColor: true,
          phone: true,
          whatsappNumber: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus !== "paid_escrow" && order.paymentStatus !== "delivered") {
    return NextResponse.json(
      { error: "Order not paid yet" },
      { status: 400 }
    );
  }

  if (!order.customerEmail?.trim()) {
    return NextResponse.json(
      { ok: false, error: "no_email", message: "Aucun email client enregistré." },
      { status: 400 }
    );
  }

  try {
    const result = await sendOrderConfirmationEmail(order);
    if (result.sent) {
      await db.order.update({
        where: { id: order.id },
        data: { notifiedAt: new Date() },
      });
      return NextResponse.json({ ok: true, sent: true });
    }
    return NextResponse.json({
      ok: false,
      error: result.reason ?? "send_failed",
    });
  } catch (err) {
    safeLogger.error("send-qr failed", {
      orderNumber: decoded,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
