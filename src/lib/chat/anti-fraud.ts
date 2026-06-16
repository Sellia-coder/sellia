/**
 * Filtre anti-fraude côté serveur pour le chat boutique.
 * Bloque numéros de téléphone et tentatives de transaction hors site.
 */

export type ChatFraudReason = "phone_number" | "offsite_transaction";

export type ChatFraudResult =
  | { blocked: false }
  | { blocked: true; reason: ChatFraudReason };

const OFFSITE_PATTERNS: RegExp[] = [
  /mobile\s*money/i,
  /\bmomo\b/i,
  /orange\s*money/i,
  /\bmtn\s*money\b/i,
  /\bwave\b/i,
  /whatsapp/i,
  /whats\s*app/i,
  /\bappelle[\s-]?moi\b/i,
  /\bappel[\s-]?moi\b/i,
  /envoie[\s-]?(l[''])?argent/i,
  /transf[eè]re/i,
  /mon\s+num[eé]ro/i,
  /mon\s+t[eé]l[eé]phone/i,
  /hors\s+(du\s+)?site/i,
  /en\s+priv[eé]/i,
  /paiement\s+direct/i,
  /paye[\s-]?moi\s+sur/i,
  /contacte[\s-]?moi\s+sur/i,
];

/** Retire les montants type « 5000 FCFA » pour éviter les faux positifs sur les prix. */
function stripPricePatterns(text: string): string {
  return text.replace(
    /\d[\d\s.,]*\s*(fcfa|f\b|xaf|francs?|cfa)\b/gi,
    " [prix] "
  );
}

function hasOffsiteKeywords(text: string): boolean {
  return OFFSITE_PATTERNS.some((re) => re.test(text));
}

function hasPhoneNumber(text: string): boolean {
  const withoutPrices = stripPricePatterns(text);

  // Préfixes internationaux (+237, 00237…)
  if (/(\+|00)\d{2,3}[\s.-]?\d/.test(withoutPrices)) {
    const digits = withoutPrices.replace(/\D/g, "");
    if (digits.length >= 9) return true;
  }

  // Mobile Cameroun / Afrique centrale : 6XX XXX XXX
  const mobileMatch = withoutPrices.match(/\b6[\d\s.\-/]{6,14}\b/);
  if (mobileMatch) {
    const d = mobileMatch[0].replace(/\D/g, "");
    if (d.length >= 9) return true;
  }

  // Autres formats : 07 XX XX XX XX (CI), etc.
  const altMobile = withoutPrices.match(/\b0?[67][\d\s.\-/]{7,14}\b/);
  if (altMobile) {
    const d = altMobile[0].replace(/\D/g, "");
    if (d.length >= 9) return true;
  }

  // Suite de 7+ chiffres (hors montants déjà retirés)
  const compact = withoutPrices.replace(/[\s.\-,/()[\]]/g, "");
  if (/\d{7,}/.test(compact)) return true;

  return false;
}

export function analyzeChatMessage(content: string): ChatFraudResult {
  const trimmed = content.trim();
  if (!trimmed) return { blocked: false };

  if (hasPhoneNumber(trimmed)) {
    return { blocked: true, reason: "phone_number" };
  }

  if (hasOffsiteKeywords(trimmed)) {
    return { blocked: true, reason: "offsite_transaction" };
  }

  return { blocked: false };
}
