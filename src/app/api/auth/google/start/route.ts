import { NextRequest, NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/auth/google";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const intent = (searchParams.get("intent") === "signup" ? "signup" : "signin") as "signin" | "signup";

    const authUrl = await buildGoogleAuthUrl(intent);
    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error("[/api/auth/google/start] Error:", err);
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/connexion?error=google_init_failed`);
  }
}
