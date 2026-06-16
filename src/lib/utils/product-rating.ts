/**
 * Notes produit basées uniquement sur des avis réels (BDD).
 * Ne jamais inventer de note ou de compteur.
 */

export interface ProductRating {
  value: number;
  count: number;
  formatted: string;
}

export function computeProductRating(
  reviews: Array<{ rating: number }>
): ProductRating | null {
  if (reviews.length === 0) return null;
  const value =
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const rounded = Math.round(value * 10) / 10;
  return {
    value: rounded,
    count: reviews.length,
    formatted: rounded.toFixed(1),
  };
}

export function getRatingAriaLabel(rating: ProductRating): string {
  return `Note moyenne : ${rating.formatted} étoiles sur 5 (${rating.count} avis)`;
}

/** Répartition 1–5 étoiles pour affichage honnête. */
export function computeStarDistribution(
  reviews: Array<{ rating: number }>
): Array<{ star: number; count: number; pct: number }> {
  const total = reviews.length;
  if (total === 0) return [];
  return [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return {
      star,
      count,
      pct: Math.round((count / total) * 100),
    };
  });
}

/**
 * @deprecated Utiliser computeProductRating avec de vrais avis.
 * Conservé pour éviter les imports cassés — retourne null (pas de fake).
 */
export function getProductRating(
  _productId?: string | null
): ProductRating | null {
  return null;
}
