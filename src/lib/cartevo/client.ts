import { getCartevoToken, clearCartevoTokenCache } from "./auth";
import { CartevoError } from "./types";
import type {
  CartevoCollectRequest,
  CartevoCollectResponse,
  CartevoPayoutRequest,
  CartevoPayoutResponse,
  CartevoStatusResponse,
  CartevoBalanceResponse,
} from "./types";

/**
 * Wrapper HTTP générique pour appeler l'API Cartevo
 */
async function cartevoFetch<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    retryOn401?: boolean;
  } = {}
): Promise<T> {
  const { method = "GET", body, retryOn401 = true } = options;
  const baseUrl = process.env.CARTEVO_BASE_URL;

  if (!baseUrl) {
    throw new CartevoError("CARTEVO_BASE_URL not configured");
  }

  const token = await getCartevoToken();
  const base = baseUrl.replace(/\/$/, "");
  const pathPart = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${pathPart}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const init: RequestInit = {
    method,
    headers,
    cache: "no-store",
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);

  if (res.status === 401 && retryOn401) {
    clearCartevoTokenCache();
    return cartevoFetch<T>(path, { ...options, retryOn401: false });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // pas du JSON, on garde le text
    }
    throw new CartevoError(
      `Cartevo ${method} ${path} failed (${res.status})`,
      res.status,
      parsed
    );
  }

  const json = (await res.json()) as T;
  return json;
}

export async function cartevoCollect(
  payload: CartevoCollectRequest
): Promise<CartevoCollectResponse> {
  return cartevoFetch<CartevoCollectResponse>("/payment/collect", {
    method: "POST",
    body: payload,
  });
}

export async function cartevoPayout(
  payload: CartevoPayoutRequest
): Promise<CartevoPayoutResponse> {
  return cartevoFetch<CartevoPayoutResponse>("/payment/payout", {
    method: "POST",
    body: payload,
  });
}

export async function cartevoGetTransactionStatus(
  transactionId: string
): Promise<CartevoStatusResponse> {
  return cartevoFetch<CartevoStatusResponse>(
    `/payment/transactions/${encodeURIComponent(transactionId)}`
  );
}

export async function cartevoGetBalance(): Promise<CartevoBalanceResponse> {
  return cartevoFetch<CartevoBalanceResponse>("/payment/balance");
}

export interface CartevoBalanceData {
  currency: string;
  country: string;
  payin: number;
  payout: number;
}

/**
 * Lit payin_balance et payout_balance (pas `balance` qui vaut 0 sur wallets XAF/XOF).
 */
export async function cartevoGetWalletBalance(params: {
  country: string;
  currency: string;
}): Promise<CartevoBalanceData> {
  const json = await cartevoFetch<{
    success?: boolean;
    data?: { balances?: Array<Record<string, unknown>> };
  }>("/payment/balance");

  const balances = json?.data?.balances ?? [];
  const match = balances.find(
    (b) => b.country === params.country && b.currency === params.currency
  );

  if (!match) {
    return {
      currency: params.currency,
      country: params.country,
      payin: 0,
      payout: 0,
    };
  }

  return {
    currency: String(match.currency ?? params.currency),
    country: String(match.country ?? params.country),
    payin: Number(match.payin_balance ?? 0),
    payout: Number(match.payout_balance ?? 0),
  };
}

export const cartevoClient = {
  collect: cartevoCollect,
  payout: cartevoPayout,
  getStatus: cartevoGetTransactionStatus,
  getBalance: cartevoGetBalance,
  getWalletBalance: cartevoGetWalletBalance,
};
