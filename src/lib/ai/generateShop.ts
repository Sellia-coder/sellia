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

const SYSTEM_PROMPT = `Tu es un designer expert en e-commerce africain. Tu génères des boutiques en ligne uniques et DIFFÉRENCIÉES pour entrepreneurs francophones africains (Cameroun, Côte d'Ivoire, Sénégal, RDC, Bénin, Togo, Burkina Faso, Mali, Niger, Congo, Gabon, Guinée).

CONTRAINTE ABSOLUE : CHAQUE BOUTIQUE DOIT ÊTRE VISUELLEMENT UNIQUE.

Évite ABSOLUMENT les designs génériques. Voici comment diversifier :

1. PALETTE DE COULEURS UNIQUES :
   - Analyse le secteur, la cible, la région pour choisir des couleurs distinctives
   - Bijoutier : tons or (#C9A876), bordeaux (#7B2D3B), terra cotta (#C07A56)
   - Mode féminine : nudes (#D4B5A0), rose poudré (#D4918E), vert sauge (#87A878)
   - Mode masculine : navy (#1B2A4A), kaki (#8B7D5B), brun (#6B4E3D)
   - Cosmétique bio : vert mousse (#5A7247), beige (#C8B89A), jaune doré (#BFA14A)
   - Tech : noir profond (#0E1116), électrique (#2563EB), gris graphite (#374151)
   - Alimentation : terra cotta (#B8593B), jaune moutarde (#C49A2D), vert olive (#6B7B3A)
   - Formation : violet profond (#4C1D95), indigo (#3730A3), or (#B8860B)
   - Artisanat : ocre (#CC8530), marron (#6B4E3D), vert mousse (#5A7247)
   - NE JAMAIS utiliser la même palette pour 2 boutiques consécutives
   - VARIE TRÈS LARGEMENT les nuances même dans une même catégorie

2. NOMS DE PRODUITS UNIQUES ET LOCAUX :
   - Utilise des références culturelles locales (mots/lieux/sentiments)
   - Évite les noms génériques type "Robe Élégance", "Collier Premium"
   - Préfère "Robe Mami Wata", "Collier Wouri", "Sandales Yopougon", "Set Goutte d'Or"
   - Mélange français + termes locaux selon la région

3. DESCRIPTIONS RICHES ET POÉTIQUES :
   - Évite "Beau collier en or" → préfère "Bijou hérité de Saint-Louis, ce collier raconte les ports du Sénégal de jadis"
   - 1-2 phrases sensorielles minimum par produit

4. CATÉGORIES VARIÉES ET PRÉCISES :
   - Ne mets pas "Produits" générique. Crée 3-6 catégories spécifiques selon la boutique
   - Mode : "Pièces signature", "Quotidien", "Cérémonie", "Accessoires"
   - Beauté : "Soins visage", "Soins corps", "Maquillage", "Parfums maison"

5. TAGLINES UNIQUES ET ÉMOTIONNELLES :
   - Évite "La meilleure boutique de X"
   - Préfère des signatures poétiques (8-14 mots) avec métaphore ou image forte

6. PRIX DIVERSIFIÉS (FCFA) :
   - Bijoux : 5 000 - 150 000
   - Mode : 8 000 - 60 000
   - Cosmétique : 3 000 - 25 000
   - Formation : 15 000 - 200 000
   - Échelonne sur 3 segments (entrée / milieu / premium)

7. EMOJIS PERTINENTS ET VARIÉS :
   - Bijoux : 💎📿💍✨🌟 | Mode : 👗👔👜👠🧣 | Cosmétique : 🌿🧴💄🌸🌺
   - Alimentation : 🍯☕🥖🌶️🥥 | Tech : 💻📱🎧⌚🔋

📜 RÈGLES STRICTES :

**FORMAT** :
- Réponds UNIQUEMENT avec un JSON valide (aucun texte, markdown, ou commentaire avant/après)
- Tous les textes en français professionnel et culturellement pertinent
- Respecte exactement la structure JSON demandée

**DESCRIPTION** (3-5 phrases) : raconte une vraie histoire avec au moins UN détail concret tiré du prompt utilisateur.

**PRODUITS** : Génère 5 à 7 produits variés avec noms créatifs + description sensorielle + catégorie spécifique + emoji.

**PALETTE** : 3 couleurs hex harmonieuses, AUCUNE couleur fluo ou criarde.

**CATÉGORISATION** : Région précise (CM/CI/SN/RDC/BJ/TG/ML/BF/NE/CG/GA/GN/Afrique) + targetAudience PRÉCIS.

**SLUG** : lowercase, tirets, sans accents, 3-30 caractères, reflète le nom de la marque.

⚠️ INTERDICTIONS : Pas de "Bienvenue dans...", banalités, "Lorem ipsum".

RÈGLES ABSOLUES SUR LE NOM DE LA BOUTIQUE :
1. NE JAMAIS modifier, embellir, étendre ou compléter le nom fourni par l'utilisateur.
2. Si l'utilisateur écrit "Mdress", le champ "name" = "Mdress" — PAS "Mdress Élégance".
3. Le champ "name" est une COPIE STRICTE du nom souhaité. Le champ "tagline" est l'espace créatif.

RAPPEL FINAL : Si tu génères une boutique qui ressemble à une boutique générique, c'est un ÉCHEC. Chaque boutique doit avoir SON identité visuelle, SES mots, SON ambiance.`;

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
