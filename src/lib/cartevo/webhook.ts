import crypto from "node:crypto";

/**
 * Vérifie qu'un webhook Cartevo est légitime.
 * Header attendu : X-Webhook-Signature: sha256=<hmac_hex>
 *
 * @param rawBody - Le body brut de la requête (string, pas object)
 * @param signatureHeader - Valeur du header X-Webhook-Signature
 * @returns true si la signature est valide
 */
export function verifyCartevoWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined
): boolean {
  const secret = process.env.CARTEVO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[cartevo] CARTEVO_WEBHOOK_SECRET not configured");
    return false;
  }

  if (!signatureHeader) {
    return false;
  }

  const match = signatureHeader.match(/^sha256=(.+)$/i);
  if (!match) {
    return false;
  }

  const providedSig = match[1].trim();

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedSig, "hex"),
      Buffer.from(expectedSig, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Extrait l'ID de webhook pour idempotency
 */
export function getCartevoWebhookId(
  webhookIdHeader: string | null | undefined,
  fallbackBody: { event: string; data: { transaction_id?: string } }
): string {
  if (webhookIdHeader && webhookIdHeader.trim().length > 0) {
    return webhookIdHeader.trim();
  }
  const txId = fallbackBody?.data?.transaction_id;
  return `${fallbackBody.event}:${txId || "unknown"}`;
}
