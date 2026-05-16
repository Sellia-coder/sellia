/**
 * Catalogue pays / opérateurs Mobile Money Cartevo.
 * @see https://developer.cartevo.co/api-reference/endpoint/payment_guide_lines
 */

import type { CartevoOperator, CartevoCountry, CartevoCurrency } from "./types";

export interface OperatorInfo {
  code: CartevoOperator;
  name: string;
  shortName: string;
  color: string;
  logoEmoji: string;
  ussd?: string;
  ussdLabel?: string;
}

export interface CountryInfo {
  code: CartevoCountry;
  name: string;
  flag: string;
  currency: CartevoCurrency;
  phonePrefix: string;
  phoneFormat: string;
  phoneLength: number;
  operators: OperatorInfo[];
}

export const OPERATORS_CATALOG: Record<CartevoCountry, CountryInfo> = {
  CM: {
    code: "CM",
    name: "Cameroun",
    flag: "🇨🇲",
    currency: "XAF",
    phonePrefix: "237",
    phoneFormat: "237 6XX XX XX XX",
    phoneLength: 12,
    operators: [
      {
        code: "mtn",
        name: "MTN Mobile Money",
        shortName: "MTN MoMo",
        color: "#FFCC00",
        logoEmoji: "📱",
        ussd: "*126#",
        ussdLabel: "Tapez *126# pour confirmer",
      },
      {
        code: "orange",
        name: "Orange Money",
        shortName: "Orange Money",
        color: "#FF6600",
        logoEmoji: "🟠",
        ussd: "#150*50#",
        ussdLabel: "Tapez #150*50# pour confirmer",
      },
    ],
  },
  CI: {
    code: "CI",
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    currency: "XOF",
    phonePrefix: "225",
    phoneFormat: "225 07 XX XX XX XX",
    phoneLength: 13,
    operators: [
      { code: "mtn", name: "MTN Mobile Money", shortName: "MTN MoMo", color: "#FFCC00", logoEmoji: "📱", ussd: "*133#" },
      { code: "orange", name: "Orange Money", shortName: "Orange Money", color: "#FF6600", logoEmoji: "🟠", ussd: "#144*82#" },
      { code: "moov", name: "Moov Money", shortName: "Moov", color: "#003B79", logoEmoji: "🔵", ussd: "*155#" },
      { code: "wave", name: "Wave", shortName: "Wave", color: "#00CFFF", logoEmoji: "💧" },
    ],
  },
  SN: {
    code: "SN",
    name: "Sénégal",
    flag: "🇸🇳",
    currency: "XOF",
    phonePrefix: "221",
    phoneFormat: "221 7X XXX XX XX",
    phoneLength: 12,
    operators: [
      { code: "orange", name: "Orange Money", shortName: "Orange Money", color: "#FF6600", logoEmoji: "🟠", ussd: "#144#" },
      { code: "wave", name: "Wave", shortName: "Wave", color: "#00CFFF", logoEmoji: "💧" },
      { code: "free", name: "Free Money", shortName: "Free", color: "#E60004", logoEmoji: "🔴" },
      { code: "expresso", name: "Expresso", shortName: "Expresso", color: "#FFC400", logoEmoji: "🟡" },
    ],
  },
  BJ: {
    code: "BJ",
    name: "Bénin",
    flag: "🇧🇯",
    currency: "XOF",
    phonePrefix: "229",
    phoneFormat: "229 XX XX XX XX",
    phoneLength: 11,
    operators: [
      { code: "mtn", name: "MTN Mobile Money", shortName: "MTN", color: "#FFCC00", logoEmoji: "📱" },
      { code: "moov", name: "Moov Money", shortName: "Moov", color: "#003B79", logoEmoji: "🔵" },
      { code: "celtiis", name: "Celtiis Cash", shortName: "Celtiis", color: "#00A859", logoEmoji: "🟢" },
    ],
  },
  TG: {
    code: "TG",
    name: "Togo",
    flag: "🇹🇬",
    currency: "XOF",
    phonePrefix: "228",
    phoneFormat: "228 XX XX XX XX",
    phoneLength: 11,
    operators: [
      { code: "tmoney", name: "T-Money", shortName: "T-Money", color: "#E60004", logoEmoji: "📱" },
      { code: "moov", name: "Moov Flooz", shortName: "Flooz", color: "#003B79", logoEmoji: "🔵" },
    ],
  },
  BF: {
    code: "BF",
    name: "Burkina Faso",
    flag: "🇧🇫",
    currency: "XOF",
    phonePrefix: "226",
    phoneFormat: "226 XX XX XX XX",
    phoneLength: 11,
    operators: [
      { code: "orange", name: "Orange Money", shortName: "Orange Money", color: "#FF6600", logoEmoji: "🟠" },
      { code: "moov", name: "Moov Money", shortName: "Moov", color: "#003B79", logoEmoji: "🔵" },
      { code: "coris", name: "Coris Money", shortName: "Coris", color: "#0033A0", logoEmoji: "🟦" },
    ],
  },
  ML: {
    code: "ML",
    name: "Mali",
    flag: "🇲🇱",
    currency: "XOF",
    phonePrefix: "223",
    phoneFormat: "223 XX XX XX XX",
    phoneLength: 11,
    operators: [
      { code: "orange", name: "Orange Money", shortName: "Orange Money", color: "#FF6600", logoEmoji: "🟠" },
      { code: "moov", name: "Moov Money", shortName: "Moov", color: "#003B79", logoEmoji: "🔵" },
      { code: "wligdicash", name: "Wligdicash", shortName: "Wligdicash", color: "#00A859", logoEmoji: "💚" },
    ],
  },
  NE: {
    code: "NE",
    name: "Niger",
    flag: "🇳🇪",
    currency: "XOF",
    phonePrefix: "227",
    phoneFormat: "227 XX XX XX XX",
    phoneLength: 11,
    operators: [
      { code: "airtel", name: "Airtel Money", shortName: "Airtel", color: "#E40000", logoEmoji: "🔴" },
      { code: "moov", name: "Moov Money", shortName: "Moov", color: "#003B79", logoEmoji: "🔵" },
      { code: "orange", name: "Orange Money", shortName: "Orange Money", color: "#FF6600", logoEmoji: "🟠" },
    ],
  },
  CG: {
    code: "CG",
    name: "Congo Brazzaville",
    flag: "🇨🇬",
    currency: "XAF",
    phonePrefix: "242",
    phoneFormat: "242 XX XXX XX XX",
    phoneLength: 12,
    operators: [
      { code: "airtel", name: "Airtel Money", shortName: "Airtel", color: "#E40000", logoEmoji: "🔴" },
      { code: "mtn", name: "MTN Mobile Money", shortName: "MTN", color: "#FFCC00", logoEmoji: "📱" },
    ],
  },
  GA: {
    code: "GA",
    name: "Gabon",
    flag: "🇬🇦",
    currency: "XAF",
    phonePrefix: "241",
    phoneFormat: "241 XX XX XX XX",
    phoneLength: 11,
    operators: [
      { code: "airtel", name: "Airtel Money", shortName: "Airtel", color: "#E40000", logoEmoji: "🔴" },
      { code: "moov", name: "Moov Money", shortName: "Moov", color: "#003B79", logoEmoji: "🔵" },
    ],
  },
  GN: {
    code: "GN",
    name: "Guinée",
    flag: "🇬🇳",
    currency: "GNF",
    phonePrefix: "224",
    phoneFormat: "224 6XX XX XX XX",
    phoneLength: 12,
    operators: [
      { code: "orange", name: "Orange Money", shortName: "Orange Money", color: "#FF6600", logoEmoji: "🟠" },
      { code: "mtn", name: "MTN Mobile Money", shortName: "MTN", color: "#FFCC00", logoEmoji: "📱" },
    ],
  },
  CD: {
    code: "CD",
    name: "RDC",
    flag: "🇨🇩",
    currency: "CDF",
    phonePrefix: "243",
    phoneFormat: "243 XX XXX XX XX",
    phoneLength: 12,
    operators: [
      { code: "orange", name: "Orange Money", shortName: "Orange Money", color: "#FF6600", logoEmoji: "🟠" },
      { code: "airtel", name: "Airtel Money", shortName: "Airtel", color: "#E40000", logoEmoji: "🔴" },
      { code: "mpesa", name: "M-Pesa", shortName: "M-Pesa", color: "#00A859", logoEmoji: "💚" },
      { code: "afrimoney", name: "Afrimoney", shortName: "Afrimoney", color: "#FFC400", logoEmoji: "🟡" },
      { code: "vodacom", name: "Vodacom M-Pesa", shortName: "Vodacom", color: "#E60004", logoEmoji: "🔴" },
    ],
  },
  TD: {
    code: "TD",
    name: "Tchad",
    flag: "🇹🇩",
    currency: "XAF",
    phonePrefix: "235",
    phoneFormat: "235 XX XX XX XX",
    phoneLength: 11,
    operators: [
      { code: "airtel", name: "Airtel Money", shortName: "Airtel", color: "#E40000", logoEmoji: "🔴" },
      { code: "moov", name: "Moov Money", shortName: "Moov", color: "#003B79", logoEmoji: "🔵" },
    ],
  },
  CF: {
    code: "CF",
    name: "Centrafrique",
    flag: "🇨🇫",
    currency: "XAF",
    phonePrefix: "236",
    phoneFormat: "236 XX XX XX XX",
    phoneLength: 11,
    operators: [
      { code: "orange", name: "Orange Money", shortName: "Orange Money", color: "#FF6600", logoEmoji: "🟠" },
      { code: "moov", name: "Moov Money", shortName: "Moov", color: "#003B79", logoEmoji: "🔵" },
    ],
  },
  GW: {
    code: "GW",
    name: "Guinée-Bissau",
    flag: "🇬🇼",
    currency: "XOF",
    phonePrefix: "245",
    phoneFormat: "245 XXX XX XX",
    phoneLength: 11,
    operators: [
      { code: "orange", name: "Orange Money", shortName: "Orange Money", color: "#FF6600", logoEmoji: "🟠" },
    ],
  },
  GM: {
    code: "GM",
    name: "Gambie",
    flag: "🇬🇲",
    currency: "GMD",
    phonePrefix: "220",
    phoneFormat: "220 XXX XX XX",
    phoneLength: 10,
    operators: [
      { code: "afrimoney", name: "Afrimoney", shortName: "Afrimoney", color: "#FFC400", logoEmoji: "🟡" },
    ],
  },
};

export function getCountryInfo(code: string): CountryInfo | null {
  return OPERATORS_CATALOG[code as CartevoCountry] || null;
}

export function getOperatorInfo(
  country: string,
  operator: string
): OperatorInfo | null {
  const countryInfo = getCountryInfo(country);
  if (!countryInfo) return null;
  return countryInfo.operators.find((op) => op.code === operator) || null;
}

export function getAllCountries(): CountryInfo[] {
  return Object.values(OPERATORS_CATALOG);
}

export function getDefaultCountry(shopCountry?: string | null): CountryInfo {
  if (shopCountry && OPERATORS_CATALOG[shopCountry as CartevoCountry]) {
    return OPERATORS_CATALOG[shopCountry as CartevoCountry];
  }
  return OPERATORS_CATALOG.CM;
}

export function normalizePhoneNumber(rawPhone: string, country: string): string {
  let phone = rawPhone.replace(/[\s\-()+]/g, "");

  const countryInfo = getCountryInfo(country);
  if (!countryInfo) return phone;

  if (phone.startsWith("0")) {
    phone = countryInfo.phonePrefix + phone.substring(1);
  } else if (!phone.startsWith(countryInfo.phonePrefix)) {
    phone = countryInfo.phonePrefix + phone;
  }

  return phone;
}

export function getOperatorsForCountry(countryCode: string): OperatorInfo[] {
  const info = getCountryInfo(countryCode);
  return info?.operators ?? [];
}

export function formatPhoneDisplay(phone: string, countryCode: string): string {
  const info = getCountryInfo(countryCode);
  if (!info) return phone;

  const digits = phone.replace(/\D/g, "");

  if (countryCode === "CM" && digits.length === 12) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 12)}`;
  }

  return digits;
}
