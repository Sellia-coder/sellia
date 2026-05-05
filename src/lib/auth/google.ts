import crypto from "crypto";
import { cookies } from "next/headers";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const STATE_COOKIE = "sellia_google_oauth_state";
const STATE_DURATION_MINUTES = 10;

export interface GoogleUserInfo {
  sub: string;          // Google user ID (unique)
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

/**
 * Construit l'URL de redirection vers Google avec un state CSRF token.
 */
export async function buildGoogleAuthUrl(intent: "signin" | "signup" = "signin"): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Generate CSRF state token
  const state = crypto.randomBytes(32).toString("base64url");
  const stateData = JSON.stringify({ state, intent, ts: Date.now() });

  // Store state in httpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, stateData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: STATE_DURATION_MINUTES * 60,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state: state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Vérifie le state token pour éviter CSRF.
 */
export async function verifyGoogleState(receivedState: string): Promise<{ valid: boolean; intent?: "signin" | "signup" }> {
  const cookieStore = await cookies();
  const stateData = cookieStore.get(STATE_COOKIE)?.value;

  if (!stateData) return { valid: false };

  // Clear cookie immediately (one-time use)
  cookieStore.delete(STATE_COOKIE);

  try {
    const parsed = JSON.parse(stateData);
    if (parsed.state !== receivedState) return { valid: false };
    // Vérifier que le state n'est pas trop vieux (10 min max)
    if (Date.now() - parsed.ts > STATE_DURATION_MINUTES * 60 * 1000) {
      return { valid: false };
    }
    return { valid: true, intent: parsed.intent };
  } catch {
    return { valid: false };
  }
}

/**
 * Échange le code OAuth contre un access token + récupère les infos user.
 */
export async function exchangeGoogleCode(code: string): Promise<GoogleUserInfo | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  if (!clientId || !clientSecret) {
    console.error("[google/exchangeCode] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing");
    return null;
  }

  try {
    // 1. Échanger le code contre un access token
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("[google/exchangeCode] Token exchange failed:", errText);
      return null;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("[google/exchangeCode] No access_token in response");
      return null;
    }

    // 2. Récupérer les infos user
    const userResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      console.error("[google/exchangeCode] Userinfo failed:", await userResponse.text());
      return null;
    }

    const userInfo: GoogleUserInfo = await userResponse.json();

    // Validation minimale
    if (!userInfo.email || !userInfo.email_verified) {
      console.error("[google/exchangeCode] Email not verified by Google");
      return null;
    }

    return userInfo;
  } catch (err) {
    console.error("[google/exchangeCode] Exception:", err);
    return null;
  }
}
