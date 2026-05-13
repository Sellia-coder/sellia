import crypto from "node:crypto";

/**
 * NOTE: Cartevo n'envoie PAS de signature HMAC sur les webhooks.
 * On utilise donc le pattern VERIFY-ON-PULL : voir src/lib/cartevo/verify.ts
 *
 * Ce module contient :
 * - Idempotency par body hash (vu qu'on n'a pas d'X-Webhook-Id fiable)
 * - Extraction sécurisée du transaction_id du body
 * - (Future) verify HMAC si Cartevo l'ajoute un jour
 */

export type WebhookSourceReason =
  | "missing_body"
  | "invalid_json"
  | "missing_transaction_id"
  | "invalid_transaction_id_format";

export interface WebhookSourceCheck {
  valid: boolean;
  reason?: WebhookSourceReason;
}

export function hashWebhookBody(rawBody: string): string {
  return crypto.createHash("sha256").update(rawBody, "utf8").digest("hex");
}

export function extractTransactionIdFromWebhook(rawBody: string): {
  ok: boolean;
  transactionId?: string;
  event?: string;
  reason?: WebhookSourceReason;
} {
  if (!rawBody || rawBody.length === 0) {
    return { ok: false, reason: "missing_body" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, reason: "invalid_json" };
  }

  const obj = parsed as Record<string, unknown>;
  const data = obj.data;
  const event = typeof obj.event === "string" ? obj.event : undefined;

  if (typeof data !== "object" || data === null) {
    return { ok: false, reason: "missing_transaction_id" };
  }

  const dataObj = data as Record<string, unknown>;
  const txId = dataObj.transaction_id;

  if (typeof txId !== "string" || txId.length < 8 || txId.length > 100) {
    return { ok: false, reason: "missing_transaction_id" };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(txId)) {
    return { ok: false, reason: "invalid_transaction_id_format" };
  }

  return { ok: true, transactionId: txId, event };
}

export function getCartevoWebhookId(
  webhookIdHeader: string | null | undefined,
  fallbackBody: { event?: string; data: { transaction_id?: string } }
): string {
  if (webhookIdHeader && webhookIdHeader.trim().length > 0) {
    return webhookIdHeader.trim();
  }
  const event = fallbackBody?.event || "unknown";
  const txId = fallbackBody?.data?.transaction_id || "unknown";
  return `${event}:${txId}`;
}

export interface FutureHmacResult {
  valid: boolean;
  hmacDisabled: boolean;
  reason?: string;
}

export function verifyCartevoWebhookFutureHmac(params: {
  rawBody: string;
  signatureHeader: string | null | undefined;
}): FutureHmacResult {
  const secret = process.env.CARTEVO_WEBHOOK_SECRET;

  if (!secret || secret === "NOT_USED_NO_HMAC") {
    return { valid: true, hmacDisabled: true };
  }

  if (!params.signatureHeader) {
    return {
      valid: false,
      hmacDisabled: false,
      reason: "missing_signature_but_secret_configured",
    };
  }

  const match = params.signatureHeader.match(/^sha256=(.+)$/i);
  if (!match) {
    return {
      valid: false,
      hmacDisabled: false,
      reason: "invalid_signature_format",
    };
  }

  const providedSig = match[1].trim();
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(params.rawBody, "utf8")
    .digest("hex");

  try {
    const matches = crypto.timingSafeEqual(
      Buffer.from(providedSig, "hex"),
      Buffer.from(expectedSig, "hex")
    );
    return {
      valid: matches,
      hmacDisabled: false,
      reason: matches ? undefined : "signature_mismatch",
    };
  } catch {
    return {
      valid: false,
      hmacDisabled: false,
      reason: "signature_compare_error",
    };
  }
}

export function verifyCartevoWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined
): boolean {
  const result = verifyCartevoWebhookFutureHmac({ rawBody, signatureHeader });
  return result.valid;
}
