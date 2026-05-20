import crypto from "node:crypto";

const SIG_VERSION = "v1";

function getSecret(): string {
  const secret = process.env.QR_SIGNING_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("QR_SIGNING_SECRET missing or too short (need 16+ chars)");
  }
  return secret;
}

export function signOrderForDelivery(params: {
  orderNumber: string;
  shopSlug: string;
}): string {
  const secret = getSecret();
  const payload = `${SIG_VERSION}:${params.shopSlug}:${params.orderNumber}`;
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("base64url");
  return `${SIG_VERSION}.${hmac}`;
}

export function verifyOrderDeliverySignature(params: {
  orderNumber: string;
  shopSlug: string;
  signature: string;
}): boolean {
  try {
    const secret = getSecret();
    const [version, providedSig] = params.signature.split(".");
    if (version !== SIG_VERSION || !providedSig) return false;
    const payload = `${SIG_VERSION}:${params.shopSlug}:${params.orderNumber}`;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("base64url");
    const providedBuf = Buffer.from(providedSig);
    const expectedBuf = Buffer.from(expectedSig);
    if (providedBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(providedBuf, expectedBuf);
  } catch {
    return false;
  }
}

export function buildDeliveryQrUrl(params: {
  baseUrl: string;
  shopSlug: string;
  orderNumber: string;
}): string {
  const sig = signOrderForDelivery({
    orderNumber: params.orderNumber,
    shopSlug: params.shopSlug,
  });
  return `${params.baseUrl}/shop/${params.shopSlug}/livraison/${encodeURIComponent(params.orderNumber)}?sig=${encodeURIComponent(sig)}`;
}
