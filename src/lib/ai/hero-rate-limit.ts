export const MAX_HERO_GENERATIONS_PER_24H = 3;

export function isWithin24hWindow(generatedAt: Date | null): boolean {
  if (!generatedAt) return false;
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return generatedAt > last24h;
}

export function canGenerateHero(
  generatedAt: Date | null,
  generations: number
): boolean {
  if (!isWithin24hWindow(generatedAt)) return true;
  return generations < MAX_HERO_GENERATIONS_PER_24H;
}

export function nextGenerationCount(
  generatedAt: Date | null,
  generations: number
): number {
  if (!isWithin24hWindow(generatedAt)) return 1;
  return generations + 1;
}
