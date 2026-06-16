import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  isDuplicateVisit,
  parseCloudflareGeo,
  recordShopVisit,
} from "@/lib/shop-visits";
import {
  getClientIp,
  rateLimit,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rl = rateLimit(
    `visit:ip:${ip}`,
    RATE_LIMITS.VISIT_TRACK_PER_IP.limit,
    RATE_LIMITS.VISIT_TRACK_PER_IP.windowMs
  );
  if (!rl.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: { shopSlug?: string; sessionId?: string; path?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const shopSlug = body.shopSlug?.trim();
  const sessionId = body.sessionId?.trim();
  const path = body.path?.trim() || "/";

  if (!shopSlug || !sessionId || sessionId.length < 8 || sessionId.length > 128) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const shop = await db.shop.findFirst({
    where: { slug: shopSlug, status: "published" },
    select: { id: true },
  });
  if (!shop) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  if (isDuplicateVisit(shop.id, sessionId, path)) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const geo = parseCloudflareGeo(request.headers);

  try {
    await recordShopVisit({
      shopId: shop.id,
      sessionId,
      path,
      country: geo.country,
      city: geo.city,
      region: geo.region,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
