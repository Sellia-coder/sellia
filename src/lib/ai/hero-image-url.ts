/** URL publique pour une image hero stockée sur disque (route API, pas static). */
export function heroImageApiUrl(filename: string): string {
  return `/api/uploads/heroes/${filename}`;
}

/** Normalise les anciennes URLs /uploads/heroes/ vers la route API. */
export function resolveHeroImageUrl(
  stored: string | null | undefined
): string | null {
  if (!stored) return null;
  if (stored.startsWith("/api/uploads/heroes/")) return stored;
  if (stored.startsWith("/uploads/heroes/")) {
    const filename = stored.slice("/uploads/heroes/".length);
    return heroImageApiUrl(filename);
  }
  return stored;
}
