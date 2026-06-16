import { NextResponse } from "next/server";
import { getShopBySlugForCustomer, getCustomerOrdersForShop } from "@/lib/shop-customer/orders";
import { getShopCustomerSession } from "@/lib/shop-customer/session";
import { disputeReasonLabel } from "@/lib/disputes/constants";

export async function GET(
  _request: Request,
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

  const orders = await getCustomerOrdersForShop(shop.id, session.email);

  return NextResponse.json({
    ok: true,
    email: session.email,
    shopName: shop.name,
    currency: shop.currency,
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      total: o.total,
      paymentStatus: o.paymentStatus,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      dispute: o.disputes[0]
        ? {
            id: o.disputes[0].id,
            status: o.disputes[0].status,
            reason: disputeReasonLabel(o.disputes[0].reason),
            createdAt: o.disputes[0].createdAt.toISOString(),
            merchantResponse: o.disputes[0].merchantResponse,
            adminResolution: o.disputes[0].adminResolution,
            resolvedAt: o.disputes[0].resolvedAt?.toISOString() ?? null,
          }
        : null,
    })),
  });
}
