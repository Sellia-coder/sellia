import { NextRequest, NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/auth/google";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const intent = (searchParams.get("intent") === "signup" ? "signup" : "signin") as "signin" | "signup";
    const draftShopId = searchParams.get("draftShopId");

    const authUrl = await buildGoogleAuthUrl(intent);
    const response = NextResponse.redirect(authUrl);

    // Si draftShopId fourni, le stocker en cookie httpOnly pour le claim au callback
    if (draftShopId && draftShopId.length > 0 && draftShopId.length < 100) {
      response.cookies.set("sellia_draft_shop_id", draftShopId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60,
        path: "/",
      });
    }

    return response;
  } catch (err) {
    console.error("[/api/auth/google/start] Error:", err);
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/connexion?error=google_init_failed`);
  }
}
