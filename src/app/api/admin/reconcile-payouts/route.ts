import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { reconcileProcessingWithdrawals } from "@/lib/payouts/withdrawal";
import { safeLogger } from "@/lib/security/redact";

export async function POST(_request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const startedAt = Date.now();
  try {
    const stats = await reconcileProcessingWithdrawals();
    const durationMs = Date.now() - startedAt;

    safeLogger.info("Admin reconcile payouts completed", {
      adminId: admin.id,
      durationMs,
      ...stats,
    });

    return NextResponse.json({ ok: true, durationMs, ...stats });
  } catch (err) {
    safeLogger.error("Admin reconcile payouts error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
