import { NextRequest, NextResponse } from "next/server";
import { reconcileProcessingWithdrawals } from "@/lib/payouts/withdrawal";
import { safeLogger } from "@/lib/security/redact";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const startedAt = Date.now();

  try {
    const stats = await reconcileProcessingWithdrawals();
    const durationMs = Date.now() - startedAt;

    safeLogger.info("Cron reconcile payouts completed", {
      durationMs,
      ...stats,
    });

    return NextResponse.json({ ok: true, durationMs, ...stats });
  } catch (err) {
    safeLogger.error("Cron reconcile payouts error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
