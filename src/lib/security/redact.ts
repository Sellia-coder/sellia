/**
 * Redact sensitive data before logging.
 * Toujours utiliser avant console.log d'un objet contenant des secrets.
 */

const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "api_key",
  "apikey",
  "token",
  "access_token",
  "refresh_token",
  "bearer",
  "client_id",
  "client_key",
  "client_secret",
  "webhook_secret",
  "cartevo_client_id",
  "cartevo_client_key",
  "cartevo_webhook_secret",
  "password",
  "password_hash",
  "passwordhash",
  "pwd",
  "secret",
  "private_key",
  "privatekey",
  "card_number",
  "cardnumber",
  "cvv",
  "pin",
  "ssn",
  "session",
  "sessionid",
  "session_id",
]);

const REDACTED = "[REDACTED]";

export function redactSecrets<T>(input: T, depth = 0): T {
  if (depth > 10) return input;
  if (input === null || input === undefined) return input;
  if (typeof input === "number" || typeof input === "boolean") return input;
  if (typeof input === "string") return redactStringIfSensitive(input) as T;

  if (Array.isArray(input)) {
    return input.map((item) => redactSecrets(item, depth + 1)) as T;
  }

  if (typeof input === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      const keyLower = key.toLowerCase();
      if (SENSITIVE_KEYS.has(keyLower)) {
        result[key] = REDACTED;
      } else {
        result[key] = redactSecrets(value, depth + 1);
      }
    }
    return result as T;
  }

  return input;
}

function redactStringIfSensitive(s: string): string {
  if (/^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(s))
    return REDACTED;
  if (/^Bearer\s+\S+/i.test(s)) return "Bearer " + REDACTED;
  if (/^sha256=[a-f0-9]{32,}$/i.test(s)) return "sha256=" + REDACTED;
  return s;
}

export const safeLogger = {
  info: (message: string, data?: unknown) => {
    console.log(`[INFO] ${message}`, data ? redactSecrets(data) : "");
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data ? redactSecrets(data) : "");
  },
  error: (message: string, data?: unknown) => {
    console.error(`[ERROR] ${message}`, data ? redactSecrets(data) : "");
  },
};
