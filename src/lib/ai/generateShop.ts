import { callClaude } from "./anthropic";

export interface GeneratedProduct {
  name: string;
  description: string;
  price: number;        // en FCFA
  category: string;
  emoji?: string;       // emoji représentatif (en attendant les vraies images)
}

export interface GeneratedShopData {
  // Identité
  name: string;
  slug: string;          // sous-domaine (sans .getsellia.com)
  tagline: string;       // 1 ligne accrocheuse
  description: string;   // 2-4 lignes

  // Contexte
  category: string;      // mode, beauté, formation, alimentation, etc.
  targetAudience: string;
  region: string;        // CM, CI, SN, ou "Afrique" si générique

  // Visuel
  primaryColor: string;  // hex
  secondaryColor: string;
  accentColor: string;

  // Produits suggérés
  products: GeneratedProduct[];

  // Méta
  generatedAt: string;   // ISO timestamp
}

const SYSTEM_PROMPT = `Tu es l'expert créatif et stratégique de Sellia, une plateforme e-commerce premium pour entrepreneurs francophones africains (Cameroun, Côte d'Ivoire, Sénégal, RDC, Bénin, Togo, Mali).

🎯 TA MISSION : générer une boutique en ligne ABSOLUMENT UNIQUE, premium et inspirante à partir de la description de l'entrepreneur. Ne fais JAMAIS du générique. Chaque boutique doit avoir une âme, une histoire, une personnalité.

📜 RÈGLES STRICTES :

**FORMAT** :
- Réponds UNIQUEMENT avec un JSON valide (aucun texte, markdown, ou commentaire avant/après)
- Tous les textes en français professionnel, chaleureux, et culturellement pertinent
- Respecte exactement la structure JSON demandée

**QUALITÉ COPYWRITING** :
- La TAGLINE est une signature poétique (8-14 mots) avec une métaphore, une image forte, un rythme. Pas générique. Exemples du niveau attendu :
  ✓ "L'art du tissu qui raconte l'histoire de votre élégance"
  ✓ "Chaque grain de café porte le soleil du Cameroun"
  ✓ "L'audace bijoutière qui sublime votre lumière intérieure"
  ✗ "Bienvenue chez X" — TROP GÉNÉRIQUE
  ✗ "Votre boutique en ligne" — INTERDIT

- La DESCRIPTION (3-5 phrases) raconte une vraie histoire : origine, valeurs, savoir-faire, mission. Mentionne au moins UN détail concret tiré du prompt utilisateur (ville, technique, ingrédient, tradition).

**PRODUITS UNIQUES** :
- Génère 5 à 7 produits NUMINEUSEMENT VARIÉS
- Chaque NOM produit doit être créatif et évocateur. Modèle :
  ✓ "Robe Wax 'Princesse Bamiléké'"
  ✓ "Coffret Fondation Karité Doux Soleil"
  ✓ "Collier Plastron 'Reine de Saba'"
  ✗ "Robe modèle 1" — INTERDIT
  ✗ "Produit standard" — INTERDIT

- Pour chaque produit : nom évocateur + description sensorielle (texture, usage, occasion) + emoji culturel approprié + catégorie spécifique
- Variation des prix sur 3 segments :
  • 2 produits ENTRÉE (5 000 - 20 000 FCFA)
  • 2-3 produits MILIEU (20 000 - 60 000 FCFA)
  • 1-2 produits PREMIUM (60 000 - 250 000 FCFA)

**PALETTE PROFESSIONNELLE** :
- Choisis 3 couleurs en hex qui forment une harmonie élégante adaptée au DOMAINE :
  • Mode/luxe : tons profonds (bordeaux, doré, ivoire) ou pastels chics
  • Beauté/cosmétique : ocres, terre, vert sauge, beige
  • Alimentation : terreux, chauds (caramel, épices)
  • Tech/services : bleus profonds, gris ardoise, accent vif
  • Artisanat : terracotta, bronze, vert botanique
- AUCUNE couleur fluo ou criarde. Niveau Hermès/Aesop/Maison Margiela.

**CATÉGORISATION FINE** :
- Identifie la région avec précision (CM/CI/SN/RDC/BJ/TG/ML/Afrique selon contexte)
- Définis un targetAudience PRÉCIS (âge, profession, valeurs, lifestyle)
- Catégorie principale + sous-catégories de produits différenciées

**SLUG** :
- Lowercase, tirets, sans accents, court (3-30 caractères)
- Doit refléter le nom de la marque (pas "ma-boutique")

**CULTURE** :
- Si la description mentionne un pays/région africaine, intègre des références culturelles concrètes (ethnies, lieux, traditions, saveurs locales)
- Vocabulaire chaleureux, authentique, pas folklorique-cliché

⚠️ INTERDICTIONS :
- Pas de "Bienvenue dans...", "Chez nous,...", "Notre boutique vous propose..." (banal)
- Pas de "Lorem ipsum" ou placeholder
- Pas de générique. CHAQUE boutique a sa signature unique.`;

/**
 * Génère une boutique complète à partir d'un prompt et d'un nom.
 * Retourne les données structurées ou null en cas d'erreur.
 */
export async function generateShop(
  prompt: string,
  shopName: string
): Promise<{ success: boolean; data?: GeneratedShopData; error?: string }> {
  const userMessage = `Voici la description de l'entrepreneur :

🏷️ NOM SOUHAITÉ : ${shopName}
📝 ACTIVITÉ : ${prompt}

Génère une boutique COMPLÈTE et UNIQUE avec exactement cette structure JSON :

{
  "name": "Nom final (peut affiner ou enrichir le nom souhaité — ex: 'Maison Aïda Couture' au lieu de juste 'Maison Aïda')",
  "slug": "nom-en-slug-court-évocateur",
  "tagline": "Signature poétique de 8 à 14 mots, métaphore puissante, AUCUNE phrase générique",
  "description": "3 à 5 phrases qui racontent l'histoire de la marque : origine, valeurs, savoir-faire spécifique, ce qui la rend unique. INTÈGRE au moins un détail concret du prompt.",
  "category": "mode | beauté | alimentation | artisanat | services | formation | tech | autre",
  "targetAudience": "Description précise du public cible (âge, profession, valeurs, lifestyle)",
  "region": "CM | CI | SN | RDC | BJ | TG | ML | Afrique",
  "primaryColor": "#RRGGBB",
  "secondaryColor": "#RRGGBB",
  "accentColor": "#RRGGBB",
  "products": [
    {
      "name": "Nom créatif et évocateur (ex: 'Robe Wax Princesse Bamiléké', pas 'Robe 1')",
      "description": "Description sensorielle (texture, usage, occasion) en 1-2 phrases",
      "price": 25000,
      "category": "Sous-catégorie spécifique",
      "emoji": "Un emoji parfaitement adapté"
    }
  ]
}

⚡ RAPPEL CRITIQUE :
- 5 à 7 produits avec variation de prix (entrée/milieu/premium)
- Tagline POÉTIQUE et UNIQUE (interdiction des phrases banales)
- Description raconte une HISTOIRE
- Palette élégante et cohérente avec le domaine
- Réponds UNIQUEMENT avec le JSON, sans aucun texte avant ou après`;

  const response = await callClaude(userMessage, {
    system: SYSTEM_PROMPT,
    maxTokens: 4096,
    temperature: 0.7,
  });

  if (!response.success || !response.text) {
    return { success: false, error: response.error || "Pas de réponse de l'IA" };
  }

  // Parser le JSON
  let parsed: GeneratedShopData;
  try {
    // Nettoyer la réponse au cas où Claude entoure de markdown
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

  // Validation minimale
  if (!parsed.name || !parsed.slug || !parsed.tagline || !Array.isArray(parsed.products)) {
    return { success: false, error: "Structure de données IA incomplète" };
  }

  // Ajouter le timestamp
  parsed.generatedAt = new Date().toISOString();

  return { success: true, data: parsed };
}
