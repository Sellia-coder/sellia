import { callClaude } from "./anthropic";

export interface GeneratedProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  emoji?: string;
}

export interface GeneratedShopData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  targetAudience: string;
  region: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  products: GeneratedProduct[];
  generatedAt: string;
}

const SYSTEM_PROMPT = `Tu es l'expert créatif et stratégique de Sellia, une plateforme e-commerce premium pour entrepreneurs francophones africains (Cameroun, Côte d'Ivoire, Sénégal, RDC, Bénin, Togo, Mali).

🎯 TA MISSION : générer une boutique en ligne ABSOLUMENT UNIQUE, premium et inspirante à partir de la description de l'entrepreneur. Ne fais JAMAIS du générique. Chaque boutique doit avoir une âme, une histoire, une personnalité.

📜 RÈGLES STRICTES :

**FORMAT** :
- Réponds UNIQUEMENT avec un JSON valide (aucun texte, markdown, ou commentaire avant/après)
- Tous les textes en français professionnel, chaleureux, et culturellement pertinent
- Respecte exactement la structure JSON demandée

**QUALITÉ COPYWRITING** :
- La TAGLINE est une signature poétique (8-14 mots) avec une métaphore, une image forte, un rythme. Pas générique.
- La DESCRIPTION (3-5 phrases) raconte une vraie histoire : origine, valeurs, savoir-faire, mission. Mentionne au moins UN détail concret tiré du prompt utilisateur (ville, technique, ingrédient, tradition).

**PRODUITS UNIQUES** :
- Génère 5 à 7 produits NUMINEUSEMENT VARIÉS
- Chaque NOM produit doit être créatif et évocateur
- Pour chaque produit : nom évocateur + description sensorielle + catégorie spécifique (emoji optionnel, peut être omis)
- Variation des prix sur 3 segments (entrée / milieu / premium)

**PALETTE PROFESSIONNELLE** :
- Choisis 3 couleurs en hex harmonieuses adaptées au DOMAINE
- AUCUNE couleur fluo ou criarde.

**CATÉGORISATION FINE** :
- Identifie la région avec précision (CM/CI/SN/RDC/BJ/TG/ML/Afrique selon contexte)
- Définis un targetAudience PRÉCIS

**SLUG** :
- Lowercase, tirets, sans accents, court (3-30 caractères)
- Doit refléter le nom de la marque tel que fourni (sans l'enrichir)

**CULTURE** :
- Si la description mentionne un pays/région africaine, intègre des références culturelles concrètes

⚠️ INTERDICTIONS :
- Pas de "Bienvenue dans...", banalités
- Pas de "Lorem ipsum"

RÈGLES ABSOLUES SUR LE NOM DE LA BOUTIQUE :
1. NE JAMAIS modifier, embellir, étendre ou compléter le nom de la boutique fourni par l'utilisateur dans le message (champ NOM SOUHAITÉ).
2. Si l'utilisateur écrit "Mdress", le champ JSON "name" doit être exactement "Mdress" — PAS "Mdress Élégance", PAS "Mdress Boutique", PAS "Mdress Shop".
3. Le champ "name" est une COPIE STRICTE du nom souhaité indiqué dans le message.
4. Tu peux générer une TAGLINE séparée et créative (champ tagline), mais le champ "name" est SACRÉ.

EXEMPLES STRICTS :
- NOM SOUHAITÉ "Mdress" → name: "Mdress"
- NOM SOUHAITÉ "Cin Light" → name: "Cin Light"
- NOM SOUHAITÉ "Boutique Awa" → name: "Boutique Awa"

Si tu enrichis le nom, tu casses la confiance utilisateur. Respecte EXACTEMENT le nom fourni.`;

/** Extrait un nom explicite depuis un prompt long (secours si le nom structuré manque). */
export function extractShopNameFromPrompt(prompt: string): string | null {
  const patterns: RegExp[] = [
    /appelée?\s+["'«]?([A-Za-zÀ-ÿ][\w\s'’-]{1,40}?)["'»]?(?:\s|$|,|\.|—)/i,
    /nommée?\s+["'«]?([A-Za-zÀ-ÿ][\w\s'’-]{1,40}?)["'»]?(?:\s|$|,|\.|—)/i,
    /boutique\s+["'«]?([A-Za-zÀ-ÿ][\w\s'’-]{1,40}?)["'»]?(?:\s|$|,|\.|—)/i,
    /qui s['']appelle\s+["'«]?([A-Za-zÀ-ÿ][\w\s'’-]{1,40}?)["'»]?(?:\s|$|,|\.|—)/i,
  ];
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match?.[1]) {
      const n = match[1].trim();
      if (n.length >= 1 && n.length <= 42) return n;
    }
  }
  return null;
}

/**
 * Génère une boutique complète à partir d'un prompt et d'un nom.
 */
export async function generateShop(
  prompt: string,
  shopName: string
): Promise<{ success: boolean; data?: GeneratedShopData; error?: string }> {
  const trimmedName = shopName.trim();
  const userMessage = `Voici la description de l'entrepreneur :

🏷️ NOM SOUHAITÉ (à recopier EXACTEMENT dans le champ JSON "name", caractère par caractère, sans ajout) : ${trimmedName}
📝 ACTIVITÉ : ${prompt}

Génère une boutique COMPLÈTE et UNIQUE avec exactement cette structure JSON :

{
  "name": "COPIE EXACTE du NOM SOUHAITÉ ci-dessus — aucune modification",
  "slug": "nom-en-slug-court-basé-sur-le-nom-exact",
  "tagline": "Signature poétique de 8 à 14 mots (créativité ici, pas dans le nom)",
  "description": "3 à 5 phrases qui racontent l'histoire de la marque",
  "category": "mode | beauté | alimentation | artisanat | services | formation | tech | autre",
  "targetAudience": "Description précise du public cible",
  "region": "CM | CI | SN | RDC | BJ | TG | ML | Afrique",
  "primaryColor": "#RRGGBB",
  "secondaryColor": "#RRGGBB",
  "accentColor": "#RRGGBB",
  "products": [
    {
      "name": "Nom créatif et évocateur",
      "description": "Description sensorielle en 1-2 phrases",
      "price": 25000,
      "category": "Sous-catégorie spécifique",
      "emoji": ""
    }
  ]
}

⚡ RAPPEL CRITIQUE :
- Le champ "name" = reproduction exacte du NOM SOUHAITÉ (interdiction d'enrichir)
- 5 à 7 produits avec variation de prix
- Réponds UNIQUEMENT avec le JSON, sans aucun texte avant ou après`;

  const response = await callClaude(userMessage, {
    system: SYSTEM_PROMPT,
    maxTokens: 4096,
    temperature: 0.7,
  });

  if (!response.success || !response.text) {
    return { success: false, error: response.error || "Pas de réponse de l'IA" };
  }

  let parsed: GeneratedShopData;
  try {
    let cleanText = response.text.trim();
    if (cleanText.startsWith("```json")) cleanText = cleanText.slice(7);
    if (cleanText.startsWith("```")) cleanText = cleanText.slice(3);
    if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);
    cleanText = cleanText.trim();

    parsed = JSON.parse(cleanText);
  } catch (err) {
    console.error("[generateShop] JSON parse error:", err);
    console.error("[generateShop] Raw text:", response.text.slice(0, 500));
    return { success: false, error: "Format de réponse IA invalide" };
  }

  if (!parsed.name || !parsed.slug || !parsed.tagline || !Array.isArray(parsed.products)) {
    return { success: false, error: "Structure de données IA incomplète" };
  }

  const fromStructured = trimmedName || null;
  const fromPrompt = extractShopNameFromPrompt(prompt);
  if (fromStructured) {
    parsed.name = fromStructured;
  } else if (fromPrompt) {
    parsed.name = fromPrompt;
  }

  parsed.generatedAt = new Date().toISOString();

  return { success: true, data: parsed };
}
