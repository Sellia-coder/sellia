import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { resolveCodUnlockPayment } from "@/lib/cartevo/cod-unlock";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`cod_unlock_status:${ip}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const txId = request.nextUrl.searchParams.get("txId");
  if (!txId) {
    return NextResponse.json({ error: "Missing txId" }, { status: 400 });
  }

  const result = await resolveCodUnlockPayment(txId, user.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (result.unlocked) {
    revalidatePath("/personnaliser-ma-boutique");
    revalidatePath("/dashboard");
  }

  return NextResponse.json({
    status: result.status,
    unlocked: result.unlocked,
    amount: result.amount,
  });
}
