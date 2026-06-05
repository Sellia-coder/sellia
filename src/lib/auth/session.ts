import { db } from "@/lib/db";
import { isUserBlocked } from "@/lib/auth/blocked";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "sellia_session";
const SESSION_DURATION_DAYS = 30;

function generateSessionToken(): string {
  return crypto.randomBytes(48).toString("base64url");
}

export async function createSession(userId: string, metadata?: {
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  location?: string;
}) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const session = await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      device: metadata?.device,
      location: metadata?.location,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return session;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  if (isUserBlocked(session.user)) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  // Update last activity (best effort)
  db.session.update({
    where: { id: session.id },
    data: { lastActivity: new Date() },
  }).catch(() => {});

  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {});
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
