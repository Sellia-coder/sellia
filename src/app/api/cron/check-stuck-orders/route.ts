import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { safeLogger } from "@/lib/security/redact";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cutoff = new Date(Date.now() - 24 * 3600 * 1000);

  const stuckOrders = await db.order.findMany({
    where: {
      paymentStatus: "awaiting_confirmation",
      createdAt: { lt: cutoff },
      notifiedAdminAt: null,
    },
    include: {
      shop: { select: { name: true, slug: true } },
      cartevoTransaction: true,
    },
    take: 50,
  });

  if (stuckOrders.length === 0) {
    return NextResponse.json({ ok: true, count: 0 });
  }

  const adminEmail = process.env.EMAIL_ADMIN_ALERT;
  if (!adminEmail) {
    return NextResponse.json({ ok: false, error: "EMAIL_ADMIN_ALERT not set" });
  }

  const { resend, EMAIL_FROM } = await import("@/lib/email/resend");

  const rows = stuckOrders
    .map(
      (o) => `
    <tr>
      <td>${o.orderNumber}</td>
      <td>${o.shop.name}</td>
      <td>${Number(o.total).toLocaleString("fr-FR")} FCFA</td>
      <td>${o.customerPhone}</td>
      <td>${o.cartevoTransaction?.cartevoTxId || "—"}</td>
      <td>${new Date(o.createdAt).toLocaleString("fr-FR")}</td>
    </tr>`
    )
    .join("");

  const html = `
    <h2>${stuckOrders.length} commande(s) bloquée(s) depuis +24h</h2>
    <p>Action requise : vérifier dans le dashboard opérateur.</p>
    <table border="1" cellpadding="8" style="border-collapse:collapse">
      <tr><th>Order</th><th>Boutique</th><th>Montant</th><th>Tel client</th><th>TX</th><th>Créée</th></tr>
      ${rows}
    </table>
  `;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      replyTo: "noreply@getsellia.com",
      to: adminEmail,
      subject: `${stuckOrders.length} commande(s) Sellia bloquée(s) >24h`,
      html,
    });

    await db.order.updateMany({
      where: { id: { in: stuckOrders.map((o) => o.id) } },
      data: { notifiedAdminAt: new Date() },
    });

    return NextResponse.json({ ok: true, count: stuckOrders.length });
  } catch (err) {
    safeLogger.error("check-stuck-orders email failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ ok: false, error: "email_failed" }, { status: 500 });
  }
}
