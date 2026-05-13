import type { CartevoAuthRequest, CartevoAuthResponse } from "./types";
import { CartevoError } from "./types";

interface TokenCache {
  token: string;
  expiresAt: number; // timestamp ms
}

let cache: TokenCache | null = null;
let pendingFetch: Promise<string> | null = null;

const SAFETY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère un token JWT Cartevo valide.
 * - Retourne le token en cache s'il reste plus de 5 min de validité
 * - Sinon récupère un nouveau token
 * - Sérialise les appels concurrents (1 seul fetch à la fois)
 */
export async function getCartevoToken(): Promise<string> {
  if (cache && cache.expiresAt > Date.now() + SAFETY_BUFFER_MS) {
    return cache.token;
  }

  if (pendingFetch) {
    return pendingFetch;
  }

  pendingFetch = fetchNewToken()
    .then((token) => {
      pendingFetch = null;
      return token;
    })
    .catch((err) => {
      pendingFetch = null;
      throw err;
    });

  return pendingFetch;
}

async function fetchNewToken(): Promise<string> {
  const baseUrl = process.env.CARTEVO_BASE_URL;
  const clientId = process.env.CARTEVO_CLIENT_ID;
  const clientKey = process.env.CARTEVO_CLIENT_KEY;

  if (!baseUrl || !clientId || !clientKey) {
    throw new CartevoError(
      "Cartevo credentials missing. Set CARTEVO_BASE_URL, CARTEVO_CLIENT_ID, CARTEVO_CLIENT_KEY."
    );
  }

  const url = `${baseUrl.replace(/\/$/, "")}/auth/token`;
  const body: CartevoAuthRequest = {
    client_id: clientId,
    client_key: clientKey,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new CartevoError(
      `Cartevo auth failed (${res.status}): ${text}`,
      res.status
    );
  }

  const json = (await res.json()) as CartevoAuthResponse;

  if (!json.access_token || !json.expires_in) {
    throw new CartevoError("Cartevo auth: invalid response", res.status, json);
  }

  cache = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  return cache.token;
}

/**
 * Vide le cache (utile après un 401, ou pour tests)
 */
export function clearCartevoTokenCache(): void {
  cache = null;
  pendingFetch = null;
}
