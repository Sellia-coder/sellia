import { z } from "zod/v3";

export const cartevoOperatorSchema = z.enum([
  "mtn",
  "orange",
  "moov",
  "airtel",
  "mpesa",
  "afrimoney",
  "vodacom",
  "wave",
  "wligdicash",
  "expresso",
  "free",
  "tmoney",
  "celtiis",
  "coris",
]);

export const cartevoCountrySchema = z.enum([
  "CM",
  "CI",
  "SN",
  "BJ",
  "TG",
  "BF",
  "ML",
  "NE",
  "CG",
  "GA",
  "GN",
  "CD",
  "TD",
  "CF",
  "GW",
  "GM",
]);

export const cartevoCurrencySchema = z.enum([
  "XAF",
  "XOF",
  "CDF",
  "GNF",
  "GMD",
  "USD",
]);

const PHONE_PATTERNS: Record<string, RegExp> = {
  CM: /^237[26][0-9]{8}$/,
  CI: /^225[0-9]{10}$/,
  SN: /^221[7][0-9]{8}$/,
  BJ: /^229[0-9]{8,10}$/,
  TG: /^228[0-9]{8}$/,
  BF: /^226[0-9]{8}$/,
  ML: /^223[0-9]{8}$/,
  NE: /^227[0-9]{8}$/,
  CG: /^242[0-9]{9}$/,
  GA: /^241[0-9]{8,9}$/,
  GN: /^224[0-9]{8,9}$/,
  CD: /^243[0-9]{9}$/,
  TD: /^235[0-9]{8}$/,
  CF: /^236[0-9]{8}$/,
  GW: /^245[0-9]{7,9}$/,
  GM: /^220[0-9]{7,9}$/,
};

export function validatePhoneForCountry(phone: string, country: string): boolean {
  const pattern = PHONE_PATTERNS[country];
  if (!pattern) return false;
  return pattern.test(phone);
}

export const cartevoAmountSchema = z
  .number({
    invalid_type_error: "Amount must be a number",
    required_error: "Amount is required",
  })
  .finite("Amount must be finite")
  .positive("Amount must be positive")
  .max(50_000_000, "Amount exceeds maximum (50M)");

export const cartevoCollectRequestSchema = z
  .object({
    operator: cartevoOperatorSchema,
    country: cartevoCountrySchema,
    phone_number: z
      .string()
      .min(8)
      .max(15)
      .regex(/^[0-9]+$/, "Phone must be digits only"),
    amount: cartevoAmountSchema,
    currency: cartevoCurrencySchema,
  })
  .refine((d) => validatePhoneForCountry(d.phone_number, d.country), {
    message: "Phone format invalid for country",
    path: ["phone_number"],
  });

export const cartevoPayoutRequestSchema = z
  .object({
    operator: cartevoOperatorSchema,
    country: cartevoCountrySchema,
    phone_number: z.string().min(8).max(15).regex(/^[0-9]+$/),
    amount: cartevoAmountSchema.min(1000, "Minimum payout 1000"),
    currency: cartevoCurrencySchema,
  })
  .refine((d) => validatePhoneForCountry(d.phone_number, d.country), {
    message: "Phone format invalid for country",
    path: ["phone_number"],
  });

export const cartevoWebhookPayloadSchema = z.object({
  event: z.string().min(1).max(100),
  data: z.record(z.string(), z.unknown()),
});

export const cartevoWebhookTxIdSchema = z.object({
  event: z.string(),
  data: z
    .object({
      transaction_id: z
        .string()
        .min(8)
        .max(100)
        .regex(/^[a-zA-Z0-9_-]+$/),
    })
    .passthrough(),
});

export type ValidatedCollectRequest = z.infer<typeof cartevoCollectRequestSchema>;
export type ValidatedPayoutRequest = z.infer<typeof cartevoPayoutRequestSchema>;
export type ValidatedWebhookPayload = z.infer<typeof cartevoWebhookPayloadSchema>;
