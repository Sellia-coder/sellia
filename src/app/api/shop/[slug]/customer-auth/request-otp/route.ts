import { NextRequest, NextResponse } from "next/server";
import { createOTP } from "@/lib/auth/otp";
import { sendOTPEmail } from "@/lib/email/send";
import {
  authClientIp,
  checkShopCustomerOtpAllowed,
  tooManyAttemptsMessage,
} from "@/lib/auth/rate-limit";
import {
  getShopBySlugForCustomer,
  customerHasOrdersInShop,
} from "@/lib/shop-customer/orders";
import { normalizeCustomerEmail } from "@/lib/shop-customer/session";

const NEUTRAL_MESSAGE =
  "Si cet email correspond à un achat sur cette boutique, vous recevrez un code de connexion.";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const shop = await getShopBySlugForCustomer(slug);
  if (!shop) {
    return NextResponse.json({ ok: false, error: "Boutique introuvable" }, { status: 404 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const email = normalizeCustomerEmail(body.email ?? "");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Email invalide" }, { status: 400 });
  }

  const ip = authClientIp(request.headers);
  const rl = checkShopCustomerOtpAllowed(ip, shop.id, email);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: tooManyAttemptsMessage(rl.resetInSec) },
      { status: 429 }
    );
  }

  const hasOrders = await customerHasOrdersInShop(shop.id, email);
  if (hasOrders) {
    const code = await createOTP(email, "SHOP_CUSTOMER_LOGIN");
    await sendOTPEmail(email, code, {}).catch(() => {
      /* best effort */
    });
  }

  return NextResponse.json({ ok: true, message: NEUTRAL_MESSAGE });
}
