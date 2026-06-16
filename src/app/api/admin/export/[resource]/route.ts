import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { PayoutStatus } from "@prisma/client";
import { gmvByShopIds } from "@/lib/admin/metrics";
import { planLabel } from "@/lib/admin/constants";
import { payoutStatusLabel } from "@/lib/admin/labels";

function csvEscape(value: string | number | null | undefined): string {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(headers: string[], rows: string[][]): string {
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((r) => r.map(csvEscape).join(",")),
  ];
  return lines.join("\n");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { resource } = await params;
  const date = new Date().toISOString().slice(0, 10);

  if (resource === "boutiques") {
    const shops = await db.shop.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        id: true,
        slug: true,
        name: true,
        plan: true,
        isPublished: true,
        createdAt: true,
        owner: { select: { email: true } },
      },
    });
    const gmvMap = await gmvByShopIds(shops.map((s) => s.id));
    const csv = toCsv(
      ["slug", "nom", "email_proprietaire", "plan", "publiee", "gmv", "cree_le"],
      shops.map((s) => [
        s.slug,
        s.name,
        s.owner.email,
        planLabel(s.plan),
        s.isPublished ? "oui" : "non",
        String(gmvMap[s.id] ?? 0),
        s.createdAt.toISOString(),
      ])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="boutiques-${date}.csv"`,
      },
    });
  }

  if (resource === "transactions") {
    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        orderNumber: true,
        customerName: true,
        total: true,
        paymentStatus: true,
        createdAt: true,
        shop: { select: { slug: true } },
      },
    });
    const csv = toCsv(
      ["numero", "boutique", "client", "montant", "statut_paiement", "date"],
      orders.map((o) => [
        o.orderNumber,
        o.shop.slug,
        o.customerName,
        String(o.total),
        o.paymentStatus,
        o.createdAt.toISOString(),
      ])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transactions-${date}.csv"`,
      },
    });
  }

  if (resource === "retraits") {
    const payouts = await db.payout.findMany({
      where: { withdrawalGroupId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        withdrawalGroupId: true,
        amount: true,
        netAmount: true,
        status: true,
        createdAt: true,
        shop: { select: { slug: true } },
      },
    });
    const csv = toCsv(
      ["groupe", "boutique", "brut", "net", "statut", "date"],
      payouts.map((p) => [
        p.withdrawalGroupId ?? "",
        p.shop.slug,
        String(p.amount),
        String(p.netAmount),
        payoutStatusLabel(p.status),
        p.createdAt.toISOString(),
      ])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="retraits-${date}.csv"`,
      },
    });
  }

  if (resource === "utilisateurs") {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
    });
    const csv = toCsv(
      ["email", "role", "bloque", "cree_le"],
      users.map((u) => [
        u.email,
        u.role ?? "user",
        u.isBlocked ? "oui" : "non",
        u.createdAt.toISOString(),
      ])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="utilisateurs-${date}.csv"`,
      },
    });
  }

  if (resource === "clients") {
    const customers = await db.customer.findMany({
      orderBy: { totalSpent: "desc" },
      take: 5000,
      include: { shop: { select: { slug: true } } },
    });
    const csv = toCsv(
      [
        "boutique",
        "nom",
        "telephone",
        "email",
        "commandes",
        "total_depense",
        "derniere_commande",
      ],
      customers.map((c) => [
        c.shop.slug,
        c.fullName,
        c.phone,
        c.email ?? "",
        String(c.totalOrders),
        String(c.totalSpent),
        c.lastOrderAt?.toISOString() ?? "",
      ])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="clients-${date}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Resource inconnue" }, { status: 404 });
}
