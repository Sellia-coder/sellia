import { NextRequest, NextResponse } from "next/server";
import { syncShopCartevoBalance } from "@/lib/cartevo/sync-balance";
import { verifyShopOwnership } from "@/lib/security/shop-auth";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  const user = await getCurrentUser();
  const { shopId } = await params;
  const auth = await verifyShopOwnership(user?.id, shopId);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const balance = await syncShopCartevoBalance(shopId);
  return NextResponse.json({ ok: true, ...balance });
}
