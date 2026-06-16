import { NextResponse } from "next/server";
import { getShopBySlugForCustomer } from "@/lib/shop-customer/orders";
import { getShopCustomerSession } from "@/lib/shop-customer/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const shop = await getShopBySlugForCustomer(slug);
  if (!shop) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 404 });
  }

  const session = await getShopCustomerSession(shop.id);
  if (!session) {
    return NextResponse.json({ ok: true, authenticated: false });
  }

  return NextResponse.json({
    ok: true,
    authenticated: true,
    email: session.email,
  });
}
