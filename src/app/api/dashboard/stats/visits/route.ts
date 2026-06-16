import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getShopVisitStats } from "@/lib/shop-visits";

export async function GET(_request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
  });
  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  try {
    const stats = await getShopVisitStats(shop.id);
    return NextResponse.json({ ok: true, stats });
  } catch {
    return NextResponse.json({ error: "Visit stats unavailable" }, { status: 503 });
  }
}
