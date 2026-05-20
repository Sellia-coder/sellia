import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import QRCode from "qrcode";
import { buildDeliveryQrUrl } from "@/lib/qr/qr-signature";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; orderNumber: string }> }
) {
  const { slug, orderNumber } = await params;
  const decoded = decodeURIComponent(orderNumber);
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") || "png").toLowerCase();

  const order = await db.order.findFirst({
    where: { orderNumber: decoded, shop: { slug } },
    select: { paymentStatus: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (
    order.paymentStatus !== "paid_escrow" &&
    order.paymentStatus !== "delivered"
  ) {
    return NextResponse.json({ error: "Order not confirmed" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getsellia.com";
  const qrUrl = buildDeliveryQrUrl({
    baseUrl,
    shopSlug: slug,
    orderNumber: decoded,
  });

  const qrOptions = {
    errorCorrectionLevel: "M" as const,
    margin: 2,
    width: format === "png" ? 600 : undefined,
    color: { dark: "#0A0E13", light: "#FFFFFF" },
  };

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(qrUrl, { ...qrOptions, type: "svg" });
      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "private, max-age=3600",
        },
      });
    }
    if (format === "dataurl") {
      const dataUrl = await QRCode.toDataURL(qrUrl, qrOptions);
      return NextResponse.json({ dataUrl, qrUrl });
    }
    const png = await QRCode.toBuffer(qrUrl, qrOptions);
    return new NextResponse(png as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="sellia-${decoded}-qr.png"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("QR generation failed", err);
    return NextResponse.json({ error: "QR generation failed" }, { status: 500 });
  }
}
