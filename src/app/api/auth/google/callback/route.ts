import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exchangeGoogleCode, verifyGoogleState } from "@/lib/auth/google";
import { isUserBlocked } from "@/lib/auth/blocked";
import { createSession } from "@/lib/auth/session";
import { isDeviceTrusted, trustCurrentDevice, parseDevice } from "@/lib/auth/trustedDevice";
import { sendWelcomeEmail, sendLoginAlertEmail } from "@/lib/email/send";
import { claimDraftShop } from "@/lib/draftShop/claim";

export async function GET(req: NextRequest) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const { searchParams } = new URL(req.url);
  const draftShopIdFromCookie = req.cookies.get("sellia_draft_shop_id")?.value || null;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // L'utilisateur a refusé ou une erreur s'est produite côté Google
  if (error || !code || !state) {
    return NextResponse.redirect(`${appUrl}/connexion?error=google_cancelled`);
  }

  // Vérifier le state token (anti-CSRF)
  const stateResult = await verifyGoogleState(state);
  if (!stateResult.valid) {
    return NextResponse.redirect(`${appUrl}/connexion?error=google_invalid_state`);
  }

  // Échanger le code contre les infos user
  const userInfo = await exchangeGoogleCode(code);
  if (!userInfo) {
    return NextResponse.redirect(`${appUrl}/connexion?error=google_exchange_failed`);
  }

  const email = userInfo.email.toLowerCase();
  const firstName = userInfo.given_name || userInfo.name?.split(" ")[0] || null;
  const lastName = userInfo.family_name || null;

  // Chercher si un user existe déjà avec cet email OU ce googleId
  let user = await db.user.findFirst({
    where: {
      OR: [
        { email },
        { googleId: userInfo.sub },
      ],
    },
  });

  let isNewUser = false;

  if (!user) {
    // Nouveau user : créer le compte avec googleId, sans password
    user = await db.user.create({
      data: {
        email,
        googleId: userInfo.sub,
        authProvider: "google",
        firstName,
        lastName,
        avatarUrl: userInfo.picture || null,
        emailVerified: new Date(),  // Google a déjà vérifié l'email
        lastLoginAt: new Date(),
      },
    });
    isNewUser = true;
  } else {
    // User existe déjà : lier le compte Google si pas encore lié
    const updates: {
      googleId?: string;
      avatarUrl?: string;
      firstName?: string;
      lastName?: string;
      emailVerified?: Date;
      lastLoginAt: Date;
    } = {
      lastLoginAt: new Date(),
    };

    if (!user.googleId) {
      updates.googleId = userInfo.sub;
    }
    // Compléter les infos manquantes
    if (!user.avatarUrl && userInfo.picture) {
      updates.avatarUrl = userInfo.picture;
    }
    if (!user.firstName && firstName) {
      updates.firstName = firstName;
    }
    if (!user.lastName && lastName) {
      updates.lastName = lastName;
    }
    // Si email pas encore vérifié, le marquer (Google = source de vérité)
    if (!user.emailVerified) {
      updates.emailVerified = new Date();
    }

    user = await db.user.update({
      where: { id: user.id },
      data: updates,
    });
  }

  // Récupérer metadata appareil
  const userAgent = req.headers.get("user-agent") || undefined;
  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || req.headers.get("x-real-ip")
    || undefined;

  if (isUserBlocked(user)) {
    return NextResponse.redirect(`${appUrl}/connexion?error=account_suspended`);
  }

  // Détecte si l'appareil était déjà reconnu AVANT de le trust (pour l'alerte).
  const wasTrusted = await isDeviceTrusted(user.id, userAgent, ipAddress);

  // Créer la session
  await createSession(user.id, { userAgent, ipAddress });

  // Trust device automatique (sauf si 2FA forcée)
  if (!user.twoFactorEnabled) {
    await trustCurrentDevice(user.id, { userAgent, ipAddress });
  }

  // Email de bienvenue si nouveau user (non bloquant)
  if (isNewUser && user.firstName) {
    sendWelcomeEmail(email, user.firstName).catch(() => {});
  }

  // Alerte de connexion : appareil non reconnu pour un compte existant.
  if (!isNewUser && !wasTrusted) {
    sendLoginAlertEmail(email, {
      firstName: user.firstName || undefined,
      device: userAgent ? parseDevice(userAgent) : undefined,
      location: undefined,
    }).catch(() => {});
  }

  // Claim DraftShop si cookie présent
  if (draftShopIdFromCookie) {
    await claimDraftShop(user.id, draftShopIdFromCookie).catch((err) => {
      console.warn("[google/callback] DraftShop claim failed:", err);
    });
  }

  const finalResponse = NextResponse.redirect(`${appUrl}/dashboard`);
  if (draftShopIdFromCookie) {
    finalResponse.cookies.delete("sellia_draft_shop_id");
  }

  return finalResponse;
}
