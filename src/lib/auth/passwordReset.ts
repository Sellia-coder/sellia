import { db } from "@/lib/db";
import crypto from "crypto";

const RESET_TOKEN_EXPIRY_MINUTES = 15;

function generateResetToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Crée un token de reset de mot de passe (utilisé après vérification OTP).
 * Ce token sert dans l'URL /reinitialiser-mot-de-passe?token=...
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  // Invalider tous les anciens tokens pour cet email
  await db.passwordResetToken.updateMany({
    where: { email, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

  await db.passwordResetToken.create({
    data: { email, token, expiresAt },
  });

  return token;
}

/**
 * Vérifie qu'un token de reset est valide.
 * Retourne l'email associé si valide, null sinon.
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const record = await db.passwordResetToken.findUnique({ where: { token } });
  if (!record) return null;
  if (record.consumedAt) return null;
  if (record.expiresAt < new Date()) return null;
  return record.email;
}

/**
 * Marque un token de reset comme consommé.
 * Appelé après le changement de mot de passe réussi.
 */
export async function consumePasswordResetToken(token: string): Promise<void> {
  await db.passwordResetToken.updateMany({
    where: { token, consumedAt: null },
    data: { consumedAt: new Date() },
  });
}
