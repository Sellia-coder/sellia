import { db } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const TRUSTED_DEVICE_COOKIE = "sellia_trusted_device";
const TRUSTED_DEVICE_DURATION_DAYS = 30;

function generateDeviceToken(): string {
  return crypto.randomBytes(48).toString("base64url");
}

function generateFingerprint(userAgent: string, ipAddress: string): string {
  return crypto.createHash("sha256").update(`${userAgent}::${ipAddress}`).digest("hex");
}

function parseDevice(userAgent: string): string {
  if (!userAgent) return "Appareil inconnu";
  const lowerUA = userAgent.toLowerCase();
  let device = "Ordinateur";
  let browser = "Navigateur";

  if (lowerUA.includes("iphone")) device = "iPhone";
  else if (lowerUA.includes("ipad")) device = "iPad";
  else if (lowerUA.includes("android")) device = "Android";
  else if (lowerUA.includes("mac")) device = "Mac";
  else if (lowerUA.includes("windows")) device = "Windows";
  else if (lowerUA.includes("linux")) device = "Linux";

  if (lowerUA.includes("chrome") && !lowerUA.includes("edg")) browser = "Chrome";
  else if (lowerUA.includes("safari") && !lowerUA.includes("chrome")) browser = "Safari";
  else if (lowerUA.includes("firefox")) browser = "Firefox";
  else if (lowerUA.includes("edg")) browser = "Edge";

  return `${device} · ${browser}`;
}

export async function isDeviceTrusted(userId: string, userAgent?: string, ipAddress?: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;
  if (!token) return false;

  const trusted = await db.trustedDevice.findUnique({ where: { token } });
  if (!trusted) return false;
  if (trusted.userId !== userId) return false;
  if (trusted.expiresAt < new Date()) {
    await db.trustedDevice.delete({ where: { id: trusted.id } }).catch(() => {});
    return false;
  }

  if (userAgent && ipAddress) {
    const currentFingerprint = generateFingerprint(userAgent, ipAddress);
    if (trusted.fingerprint !== currentFingerprint) {
      await db.trustedDevice.delete({ where: { id: trusted.id } }).catch(() => {});
      return false;
    }
  }

  db.trustedDevice.update({
    where: { id: trusted.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return true;
}

export async function trustCurrentDevice(
  userId: string,
  metadata: { userAgent?: string; ipAddress?: string; location?: string }
) {
  const userAgent = metadata.userAgent || "";
  const ipAddress = metadata.ipAddress || "0.0.0.0";

  const token = generateDeviceToken();
  const fingerprint = generateFingerprint(userAgent, ipAddress);
  const expiresAt = new Date(Date.now() + TRUSTED_DEVICE_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await db.trustedDevice.create({
    data: {
      userId,
      token,
      fingerprint,
      device: parseDevice(userAgent),
      location: metadata.location,
      ipAddress,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(TRUSTED_DEVICE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}
