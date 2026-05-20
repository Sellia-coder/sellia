import { NextRequest, NextResponse } from "next/server";
import { scanAndMatchAllPending } from "@/lib/cartevo/balance-delta";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const start = Date.now();
  try {
    const result = await scanAndMatchAllPending("cron");
    return NextResponse.json({
      ok: true,
      durationMs: Date.now() - start,
      scanned: result.scanned,
      matched: result.matched,
      results: result.results,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        durationMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
