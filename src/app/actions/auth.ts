"use server";

import { db } from "@/lib/db";
import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/auth/password";
import { createOTP, verifyOTP } from "@/lib/auth/otp";
import { createSession, destroySession, getSession } from "@/lib/auth/session";
import { isDeviceTrusted, trustCurrentDevice } from "@/lib/auth/trustedDevice";
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from "@/lib/email/send";
import { createPasswordResetToken, verifyPasswordResetToken, consumePasswordResetToken } from "@/lib/auth/passwordReset";
import { claimDraftShop } from "@/lib/draftShop/claim";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// ============================================
// SIGN UP
// ============================================
export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const firstName = String(formData.get("firstName") || "").trim();
  const draftShopId = String(formData.get("draftShopId") || "").trim() || null;
  const lastName = String(formData.get("lastName") || "").trim() || null;

  // Validation
  if (!firstName || firstName.length < 2) {
    return { success: false, error: "Veuillez entrer votre prénom." };
  }
  if (!email || !email.includes("@")) {
    return { success: false, error: "Email invalide." };
  }

  const pwdCheck = validatePasswordStrength(password);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.error };
  }

  // Vérifier si l'email existe déjà
  const existing = await db.user.findUnique({ where: { email } });
  let user;
  if (existing) {
    if (existing.emailVerified) {
      return { success: false, error: "Un compte existe déjà avec cet email. Connectez-vous." };
    }
    // Compte existe mais non vérifié — on update et on renvoie un code
    const passwordHash = await hashPassword(password);
    user = await db.user.update({
      where: { email },
      data: { passwordHash, firstName: firstName || existing.firstName, lastName: lastName || existing.lastName },
    });
  } else {
    // Créer le user (non vérifié)
    const passwordHash = await hashPassword(password);
    user = await db.user.create({
      data: { email, passwordHash, firstName, lastName },
    });
  }

  // Générer + envoyer le code OTP
  const code = await createOTP(email, "EMAIL_VERIFICATION");
  const sendResult = await sendOTPEmail(email, code, { firstName: firstName || undefined });

  if (!sendResult.success) {
    return { success: false, error: "Impossible d'envoyer l'email de vérification. Réessayez." };
  }

  // Claim DraftShop si draftShopId fourni (depuis form ou cookie OAuth)
  if (draftShopId) {
    const claimResult = await claimDraftShop(user.id, draftShopId);
    if (!claimResult.success) {
      console.warn("[signUpAction] DraftShop claim failed:", claimResult.error);
      // Non bloquant : on laisse le signup continuer
    }
  }

  return { success: true, email, requiresVerification: true, draftShopId };
}

// ============================================
// VERIFY OTP (post-inscription)
// ============================================
export async function verifyOTPAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const code = String(formData.get("code") || "").trim();
  const flow = String(formData.get("flow") || "EMAIL_VERIFICATION");
  const draftShopId = String(formData.get("draftShopId") || "").trim() || null;

  if (!email || !code || code.length !== 6) {
    return { success: false, error: "Code invalide." };
  }

  const tokenType = flow === "LOGIN" ? "LOGIN" : "EMAIL_VERIFICATION";

  const result = await verifyOTP(email, code, tokenType);
  if (!result.valid) {
    return { success: false, error: result.error };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: "Compte introuvable." };
  }

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || undefined;
  const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0].trim()
    || headersList.get("x-real-ip")
    || undefined;

  if (tokenType === "EMAIL_VERIFICATION") {
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), lastLoginAt: new Date() },
    });

    await createSession(user.id, { userAgent, ipAddress });

    if (!user.twoFactorEnabled) {
      await trustCurrentDevice(user.id, { userAgent, ipAddress });
    }

    if (user.firstName) {
      sendWelcomeEmail(email, user.firstName).catch(() => {});
    }

    // Filet de sécurité : si draftShopId présent et pas encore claimed, claim ici
    if (draftShopId) {
      const draft = await db.draftShop.findUnique({
        where: { id: draftShopId },
        select: { userId: true },
      });
      if (draft && !draft.userId) {
        await claimDraftShop(user.id, draftShopId).catch(() => {});
      }
    }
  } else {
    // LOGIN flow
    await createSession(user.id, { userAgent, ipAddress });
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    if (!user.twoFactorEnabled) {
      await trustCurrentDevice(user.id, { userAgent, ipAddress });
    }
  }

  if (tokenType === "EMAIL_VERIFICATION") {
    const publishedShop = await db.shop.findFirst({
      where: {
        ownerId: user.id,
        OR: [{ status: "published" }, { isPublished: true }],
      },
      select: { id: true },
    });

    return {
      success: true,
      redirectTo: publishedShop
        ? "/dashboard"
        : "/personnaliser-ma-boutique",
    };
  }

  return { success: true, redirectTo: "/dashboard" };
}

// ============================================
// RESEND OTP
// ============================================
export async function resendOTPAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const flow = String(formData.get("flow") || "EMAIL_VERIFICATION");

  if (!email) {
    return { success: false, error: "Email manquant." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: "Compte introuvable." };
  }

  const tokenType = flow === "LOGIN" ? "LOGIN" : "EMAIL_VERIFICATION";
  const code = await createOTP(email, tokenType);
  const sendResult = await sendOTPEmail(email, code, { firstName: user.firstName || undefined });

  if (!sendResult.success) {
    return { success: false, error: "Impossible d'envoyer l'email." };
  }

  return { success: true };
}

// ============================================
// SIGN IN
// ============================================
export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { success: false, error: "Email et mot de passe requis." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: "Email ou mot de passe incorrect." };
  }

  // Cas Google-only : user créé via Google sans password
  if (!user.passwordHash) {
    return {
      success: false,
      error: "Ce compte utilise Google. Cliquez sur 'Continuer avec Google' pour vous connecter."
    };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Email ou mot de passe incorrect." };
  }

  // Si email pas encore vérifié, on renvoie le code OTP
  if (!user.emailVerified) {
    const code = await createOTP(email, "EMAIL_VERIFICATION");
    await sendOTPEmail(email, code, { firstName: user.firstName || undefined }).catch(() => {});
    return { success: false, requiresVerification: true as const, email };
  }

  // Récupérer metadata appareil
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || undefined;
  const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0].trim()
    || headersList.get("x-real-ip")
    || undefined;

  // Vérifier si l'appareil est trusted ET si le user n'a pas activé "OTP à chaque connexion"
  const deviceTrusted = await isDeviceTrusted(user.id, userAgent, ipAddress || undefined);
  const requireOTPAlways = user.twoFactorEnabled;

  if (deviceTrusted && !requireOTPAlways) {
    // Appareil connu + 2FA pas forcée → connexion directe
    await createSession(user.id, { userAgent, ipAddress: ipAddress || undefined });
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    return { success: true };
  }

  // Nouvel appareil OU 2FA forcée → envoyer OTP de connexion
  const code = await createOTP(email, "LOGIN");
  const sendResult = await sendOTPEmail(email, code, { firstName: user.firstName || undefined });

  if (!sendResult.success) {
    return { success: false, error: "Impossible d'envoyer le code. Réessayez." };
  }

  return {
    success: false,
    requiresLoginOTP: true,
    email,
    message: requireOTPAlways
      ? "Code de connexion envoyé (vérification renforcée activée)."
      : "Nouvel appareil détecté — un code a été envoyé à votre email."
  };
}

// ============================================
// SIGN OUT
// ============================================
export async function signOutAction() {
  await destroySession();
  redirect("/connexion");
}

// ============================================
// TOGGLE 2FA (forcer OTP à chaque connexion)
// ============================================
export async function toggle2FAAction() {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non authentifié." };
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return { success: false, error: "Utilisateur introuvable." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: !user.twoFactorEnabled },
  });

  return {
    success: true,
    enabled: !user.twoFactorEnabled
  };
}

// ============================================
// FORGOT PASSWORD — Étape 1 : Demande de reset
// ============================================
export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { success: false, error: "Email invalide." };
  }

  const user = await db.user.findUnique({ where: { email } });

  // Sécurité : on retourne success même si l'email n'existe pas (anti énumération)
  // Mais on n'envoie un email QUE si le compte existe
  if (user) {
    const code = await createOTP(email, "PASSWORD_RESET");
    await sendPasswordResetEmail(email, code, {
      firstName: user.firstName || undefined
    }).catch((err) => {
      console.error("[forgotPassword] Send error:", err);
    });
  }

  // Toujours retourner succès (anti énumération)
  return { success: true, email };
}

// ============================================
// FORGOT PASSWORD — Étape 2 : Vérification du code OTP
// ============================================
export async function verifyPasswordResetCodeAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const code = String(formData.get("code") || "").trim();

  if (!email || !code || code.length !== 6) {
    return { success: false, error: "Code invalide." };
  }

  const result = await verifyOTP(email, code, "PASSWORD_RESET");
  if (!result.valid) {
    return { success: false, error: result.error };
  }

  // OTP valide → créer un token de reset court (15 min)
  const resetToken = await createPasswordResetToken(email);

  return { success: true, resetToken };
}

// ============================================
// FORGOT PASSWORD — Étape 3 : Changement effectif du mot de passe
// ============================================
export async function resetPasswordAction(formData: FormData) {
  const resetToken = String(formData.get("resetToken") || "").trim();
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!resetToken) {
    return { success: false, error: "Lien invalide ou expiré." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Les mots de passe ne correspondent pas." };
  }

  const pwdCheck = validatePasswordStrength(newPassword);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.error };
  }

  // Vérifier le token
  const email = await verifyPasswordResetToken(resetToken);
  if (!email) {
    return { success: false, error: "Lien invalide ou expiré. Recommencez la procédure." };
  }

  // Récupérer le user
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: "Compte introuvable." };
  }

  // Hash le nouveau mot de passe
  const passwordHash = await hashPassword(newPassword);

  // Update le user
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Invalidater toutes les sessions actives (sécurité : déconnexion partout)
  await db.session.deleteMany({ where: { userId: user.id } });

  // Invalidater tous les trusted devices (sécurité : on perd la confiance des appareils)
  await db.trustedDevice.deleteMany({ where: { userId: user.id } });

  // Consommer le token de reset
  await consumePasswordResetToken(resetToken);

  // Envoyer email de confirmation (non bloquant)
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || undefined;

  // Parser le device (simple)
  let device = "Appareil inconnu";
  if (userAgent) {
    const ua = userAgent.toLowerCase();
    if (ua.includes("iphone")) device = "iPhone";
    else if (ua.includes("android")) device = "Android";
    else if (ua.includes("mac")) device = "Mac";
    else if (ua.includes("windows")) device = "Windows";

    if (ua.includes("chrome")) device += " · Chrome";
    else if (ua.includes("safari")) device += " · Safari";
    else if (ua.includes("firefox")) device += " · Firefox";
  }

  sendPasswordChangedEmail(email, {
    firstName: user.firstName || undefined,
    device,
    location: undefined,
  }).catch(() => {});

  return { success: true };
}
