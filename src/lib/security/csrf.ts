const ALLOWED_ORIGINS_DEFAULT = [
  "https://getsellia.com",
  "https://www.getsellia.com",
];

function getAllowedOrigins(): string[] {
  const fromEnv = process.env.ALLOWED_ORIGINS;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.split(",").map((o) => o.trim()).filter(Boolean);
  }
  if (process.env.NODE_ENV === "development") {
    return [
      ...ALLOWED_ORIGINS_DEFAULT,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];
  }
  return ALLOWED_ORIGINS_DEFAULT;
}

export interface CsrfCheckResult {
  valid: boolean;
  reason?: "missing_origin" | "invalid_origin";
}

export function checkCsrf(headers: Headers): CsrfCheckResult {
  const origin = headers.get("origin");
  const referer = headers.get("referer");

  const sourceUrl = origin || referer;
  if (!sourceUrl) return { valid: false, reason: "missing_origin" };

  let sourceOrigin = sourceUrl;
  if (sourceUrl.includes("/")) {
    try {
      sourceOrigin = new URL(sourceUrl).origin;
    } catch {
      return { valid: false, reason: "invalid_origin" };
    }
  }

  const allowedOrigins = getAllowedOrigins();
  const allowedHosts = allowedOrigins.map((o) => {
    try {
      return new URL(o).host;
    } catch {
      return o;
    }
  });

  const sourceHost = (() => {
    try {
      return new URL(sourceOrigin).host;
    } catch {
      return null;
    }
  })();

  if (!sourceHost) return { valid: false, reason: "invalid_origin" };

  const matches = allowedHosts.some((h) => {
    if (h === sourceHost) return true;
    if (h === "getsellia.com" && sourceHost.endsWith(".getsellia.com"))
      return true;
    return false;
  });

  if (!matches) return { valid: false, reason: "invalid_origin" };
  return { valid: true };
}
