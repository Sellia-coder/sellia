/**
 * Types officiels Cartevo API
 * Source : https://developer.cartevo.co/api-reference
 */

// ===== AUTH =====
export interface CartevoAuthRequest {
  client_id: string;
  client_key: string;
}

export interface CartevoAuthResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number; // secondes (3600 = 1h)
}

// ===== OPERATORS & COUNTRIES =====
export type CartevoOperator =
  | "mtn"
  | "orange"
  | "moov"
  | "airtel"
  | "mpesa"
  | "afrimoney"
  | "vodacom"
  | "wave"
  | "wligdicash"
  | "expresso"
  | "free"
  | "tmoney"
  | "celtiis"
  | "coris";

export type CartevoCountry =
  | "CM" // Cameroon
  | "CI" // Côte d'Ivoire
  | "SN" // Senegal
  | "BJ" // Benin
  | "TG" // Togo
  | "BF" // Burkina Faso
  | "ML" // Mali
  | "NE" // Niger
  | "CG" // Congo Brazzaville
  | "GA" // Gabon
  | "GN" // Guinea Conakry
  | "CD" // RDC (utiliser RDC dans Cartevo ? À VÉRIFIER)
  | "TD" // Tchad
  | "CF" // Central African Republic
  | "GW" // Guinea-Bissau
  | "GM"; // Gambia

export type CartevoCurrency = "XAF" | "XOF" | "CDF" | "GNF" | "GMD" | "USD";

export type CartevoTxStatus =
  | "INITIATED"
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

// ===== COLLECT (paiement client → wallet Sellia) =====
export interface CartevoCollectRequest {
  operator: CartevoOperator;
  country: CartevoCountry;
  phone_number: string; // ex: "237670000000"
  amount: number;
  currency: CartevoCurrency;
  notify_url?: string;
}

export interface CartevoCollectData {
  transaction_id: string;
  external_id: string; // ex: "COLL-1234567890-abc12345"
  status: CartevoTxStatus;
  amount: number;
  currency: CartevoCurrency;
  operator: CartevoOperator;
  country: CartevoCountry;
  phone_number: string;
  initiated_at: string; // ISO 8601
  error_message?: string;
}

export interface CartevoCollectResponse {
  success: boolean;
  message: string;
  data: CartevoCollectData;
}

// ===== PAYOUT (Sellia wallet → MoMo marchand) =====
export interface CartevoPayoutRequest {
  operator: CartevoOperator;
  country: CartevoCountry;
  phone_number: string;
  amount: number;
  currency: CartevoCurrency;
  notify_url?: string;
}

export interface CartevoPayoutData {
  transaction_id: string;
  external_id: string; // ex: "PAYOUT-1234567890-abc12345"
  status: CartevoTxStatus;
  amount: number;
  currency: CartevoCurrency;
  operator: CartevoOperator;
  country: CartevoCountry;
  phone_number: string;
  initiated_at: string;
  error_message?: string;
}

export interface CartevoPayoutResponse {
  success: boolean;
  message: string;
  data: CartevoPayoutData;
}

// ===== STATUS =====
export interface CartevoStatusResponse {
  success: boolean;
  message: string;
  data: CartevoCollectData | CartevoPayoutData;
}

// ===== BALANCE =====
export interface CartevoBalanceResponse {
  success: boolean;
  message: string;
  data: {
    balance: number;
    currency: CartevoCurrency;
    wallet_id?: string;
  };
}

// ===== WEBHOOK =====
export interface CartevoWebhookHeaders {
  "content-type": "application/json";
  "x-webhook-signature": string; // "sha256=<hmac>"
  "x-webhook-id": string;
  "x-webhook-timestamp": string;
  "user-agent": string;
}

export type CartevoWebhookEvent =
  | "payment.collect"
  | "payment.payout" // Si Cartevo l'envoie (à confirmer)
  | "card.created"
  | "card.fund"
  | "card.withdraw"
  | "card.withdraw.failed"
  | "card.terminated"
  | "transaction.authorization.created"
  | "transaction.authorization.declined"
  | "transaction.reversal.completed"
  | "transaction.refund.completed"
  | "transaction.settlement.completed"
  | "transaction.funding.completed"
  | "transaction.withdrawal.completed"
  | "transaction.crossborder.charged"
  | "transaction.terminated"
  | "fee.payment_failure.charged"
  | "fee.crossborder.charged"
  | "debt.recovery.pending"
  | "customer.created";

export interface CartevoWebhookPayload<T = unknown> {
  event: CartevoWebhookEvent;
  data: T;
}

export interface CartevoPaymentCollectWebhookData {
  transaction_id: string;
  amount: number;
  currency: CartevoCurrency;
  operator: CartevoOperator;
  phone_number: string;
  initiated_at: string;
  status?: CartevoTxStatus; // À confirmer si présent
}

// ===== ERROR =====
export class CartevoError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "CartevoError";
  }
}
