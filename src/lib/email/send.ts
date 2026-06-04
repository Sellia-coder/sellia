import { resend, EMAIL_FROM } from "./resend";
import { otpEmailTemplate, welcomeEmailTemplate, passwordResetEmailTemplate, passwordChangedEmailTemplate, loginAlertEmailTemplate } from "./templates";

export async function sendOTPEmail(email: string, code: string, options?: { firstName?: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Sellia · Votre code : ${code}`,
      html: otpEmailTemplate(code, options),
    });

    if (error) {
      console.error("[email/sendOTP] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[email/sendOTP] Exception:", err);
    return { success: false, error: "Erreur d'envoi email" };
  }
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Bienvenue sur Sellia 👋",
      html: welcomeEmailTemplate(firstName),
    });

    if (error) {
      console.error("[email/sendWelcome] Resend error:", error);
      return { success: false };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[email/sendWelcome] Exception:", err);
    return { success: false };
  }
}

export async function sendPasswordResetEmail(email: string, code: string, options?: { firstName?: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Sellia · Réinitialisation : ${code}`,
      html: passwordResetEmailTemplate(code, options),
    });

    if (error) {
      console.error("[email/sendPasswordReset] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[email/sendPasswordReset] Exception:", err);
    return { success: false, error: "Erreur d'envoi email" };
  }
}

export async function sendLoginAlertEmail(email: string, options?: { firstName?: string; device?: string; location?: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Sellia · Nouvelle connexion à votre compte",
      html: loginAlertEmailTemplate(options),
    });

    if (error) {
      console.error("[email/sendLoginAlert] Resend error:", error);
      return { success: false };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[email/sendLoginAlert] Exception:", err);
    return { success: false };
  }
}

export async function sendPasswordChangedEmail(email: string, options?: { firstName?: string; device?: string; location?: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Sellia · Mot de passe modifié",
      html: passwordChangedEmailTemplate(options),
    });

    if (error) {
      console.error("[email/sendPasswordChanged] Resend error:", error);
      return { success: false };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[email/sendPasswordChanged] Exception:", err);
    return { success: false };
  }
}
