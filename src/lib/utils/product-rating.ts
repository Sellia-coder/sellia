/**
 * Helper unifié pour générer des notes et avis déterministes
 * basés sur l'ID du produit. Utilisé partout dans la boutique :
 * - Page d'accueil boutique (grille)
 * - Page détail produit
 * - Page recherche
 * - Page favoris
 *
 * NOTE : Quand le système de vraies reviews sera implémenté,
 * il suffira de remplacer ce helper par une lecture BDD.
 */

export interface ProductRating {
  value: number; // 4.3 à 5.0
  count: number; // 12 à 62
  formatted: string; // "4.7"
}

/**
 * Convertit un ID (string) en nombre stable pour les calculs déterministes.
 */
function hashId(id: string | undefined | null): number {
  if (!id || typeof id !== "string") return 0;
  const slice = id.slice(-3);
  const num = parseInt(slice, 36);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Génère la note et le nombre d'avis pour un produit, de manière déterministe.
 * Le même ID donnera TOUJOURS la même note + le même nombre d'avis.
 */
export function getProductRating(productId: string | undefined | null): ProductRating {
  const hash = hashId(productId);

  const ratingSteps = 8;
  const ratingBase = 4.3;
  const raw = ratingBase + (hash % ratingSteps) * 0.1;
  const value = Math.round(raw * 10) / 10;

  const count = (hash % 50) + 12;

  return {
    value,
    count,
    formatted: value.toFixed(1),
  };
}

/**
 * Génère un libellé "X étoiles" pour l'accessibilité
 */
export function getRatingAriaLabel(rating: ProductRating): string {
  return `Note moyenne : ${rating.formatted} étoiles sur 5 (${rating.count} avis)`;
}
