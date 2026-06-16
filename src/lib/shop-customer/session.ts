import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "sellia_shop_customer";
const SESSION_HOURS = 24;

function getSecret(): string {
  return (
    process.env.SHOP_CUSTOMER_SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    "dev-shop-customer-secret-change-me"
  );
}

export type ShopCustomerSession = {
  shopId: string;
  email: string;
  exp: number;
};

function signPayload(payload: ShopCustomerSession): string {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

function parseToken(token: string): ShopCustomerSession | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    ) as ShopCustomerSession;
    if (!payload.shopId || !payload.email || !payload.exp) return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setShopCustomerSession(
  shopId: string,
  email: string
): Promise<void> {
  const exp = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const token = signPayload({
    shopId,
    email: email.trim().toLowerCase(),
    exp,
  });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function getShopCustomerSession(
  shopId: string
): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = parseToken(token);
  if (!payload || payload.shopId !== shopId) return null;
  return { email: payload.email };
}

export async function clearShopCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function normalizeCustomerEmail(email: string): string {
  return email.trim().toLowerCase();
}
