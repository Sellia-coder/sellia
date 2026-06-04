import { db } from "@/lib/db";
import crypto from "crypto";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export function generateOTP(): string {
  // Cryptographiquement sûr (jamais Math.random pour un secret).
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function createOTP(email: string, type: string = "EMAIL_VERIFICATION"): Promise<string> {
  // Invalidate previous tokens
  await db.verificationToken.updateMany({
    where: { email, type, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.verificationToken.create({
    data: { email, code, type, expiresAt },
  });

  return code;
}

export async function verifyOTP(
  email: string,
  code: string,
  type: string = "EMAIL_VERIFICATION"
): Promise<{ valid: boolean; error?: string }> {
  const token = await db.verificationToken.findFirst({
    where: { email, type, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!token) {
    return { valid: false, error: "Aucun code en attente. Demandez un nouveau code." };
  }

  if (token.expiresAt < new Date()) {
    return { valid: false, error: "Le code a expiré. Demandez un nouveau code." };
  }

  if (token.attempts >= MAX_ATTEMPTS) {
    return { valid: false, error: "Trop de tentatives. Demandez un nouveau code." };
  }

  if (token.code !== code) {
    await db.verificationToken.update({
      where: { id: token.id },
      data: { attempts: { increment: 1 } },
    });
    return { valid: false, error: "Code incorrect." };
  }

  await db.verificationToken.update({
    where: { id: token.id },
    data: { consumedAt: new Date() },
  });

  return { valid: true };
}
