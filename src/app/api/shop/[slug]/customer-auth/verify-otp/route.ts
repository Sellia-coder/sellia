import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/auth/otp";
import { getShopBySlugForCustomer } from "@/lib/shop-customer/orders";
import {
  normalizeCustomerEmail,
  setShopCustomerSession,
} from "@/lib/shop-customer/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const shop = await getShopBySlugForCustomer(slug);
  if (!shop) {
    return NextResponse.json({ ok: false, error: "Boutique introuvable" }, { status: 404 });
  }

  let body: { email?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const email = normalizeCustomerEmail(body.email ?? "");
  const code = (body.code ?? "").trim();
  if (!email || code.length !== 6) {
    return NextResponse.json({ ok: false, error: "Données invalides" }, { status: 400 });
  }

  const result = await verifyOTP(email, code, "SHOP_CUSTOMER_LOGIN");
  if (!result.valid) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  await setShopCustomerSession(shop.id, email);

  return NextResponse.json({
    ok: true,
    email,
    shopSlug: shop.slug,
  });
}
