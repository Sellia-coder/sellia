/**
 * Suivi de visites boutique — privacy-first (pas d'IP brute stockée).
 * Géo via en-têtes Cloudflare côté serveur uniquement.
 */

import { db } from "@/lib/db";

const LIVE_WINDOW_MS = 5 * 60 * 1000;
const DEDUP_WINDOW_MS = 30_000;

const recentVisitKeys = new Map<string, number>();
let lastDedupCleanup = Date.now();

function cleanupDedup(): void {
  if (Date.now() - lastDedupCleanup < 60_000) return;
  lastDedupCleanup = Date.now();
  const now = Date.now();
  for (const [key, ts] of recentVisitKeys.entries()) {
    if (now - ts > DEDUP_WINDOW_MS) recentVisitKeys.delete(key);
  }
}

export function isDuplicateVisit(
  shopId: string,
  sessionId: string,
  path: string
): boolean {
  cleanupDedup();
  const key = `${shopId}:${sessionId}:${path}`;
  const now = Date.now();
  const last = recentVisitKeys.get(key);
  if (last && now - last < DEDUP_WINDOW_MS) return true;
  recentVisitKeys.set(key, now);
  return false;
}

/** En-têtes Cloudflare disponibles selon le plan / configuration. */
export interface GeoFromHeaders {
  country: string | null;
  city: string | null;
  region: string | null;
}

export function parseCloudflareGeo(headers: Headers): GeoFromHeaders {
  const country = headers.get("cf-ipcountry");
  const city = headers.get("cf-ipcity");
  const region = headers.get("cf-region") ?? headers.get("cf-region-code");

  return {
    country:
      country && country !== "XX" && country.length === 2
        ? country.toUpperCase()
        : null,
    city: city?.trim() || null,
    region: region?.trim() || null,
  };
}

const countryDisplay = new Intl.DisplayNames(["fr"], { type: "region" });

export function formatCountryName(code: string): string {
  try {
    return countryDisplay.of(code) ?? code;
  } catch {
    return code;
  }
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

function startOfMonthUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export interface VisitStats {
  today: number;
  month: number;
  total: number;
  liveVisitors: number;
  topCountries: Array<{ code: string; label: string; count: number }>;
  topCities: Array<{ label: string; country: string; count: number }>;
  cityDataAvailable: boolean;
}

export async function recordShopVisit(input: {
  shopId: string;
  sessionId: string;
  path?: string;
  country?: string | null;
  city?: string | null;
  region?: string | null;
}): Promise<void> {
  await db.shopVisit.create({
    data: {
      shopId: input.shopId,
      sessionId: input.sessionId,
      path: input.path?.slice(0, 500) ?? null,
      country: input.country ?? null,
      city: input.city ?? null,
      region: input.region ?? null,
    },
  });
}

export async function getShopVisitStats(shopId: string): Promise<VisitStats> {
  const todayStart = startOfTodayUtc();
  const monthStart = startOfMonthUtc();
  const liveSince = new Date(Date.now() - LIVE_WINDOW_MS);

  const [today, month, total, liveRows, countryRows, cityRows] =
    await Promise.all([
      db.shopVisit.count({
        where: { shopId, createdAt: { gte: todayStart } },
      }),
      db.shopVisit.count({
        where: { shopId, createdAt: { gte: monthStart } },
      }),
      db.shopVisit.count({ where: { shopId } }),
      db.shopVisit.findMany({
        where: { shopId, createdAt: { gte: liveSince } },
        select: { sessionId: true },
        distinct: ["sessionId"],
      }),
      db.$queryRaw<Array<{ country: string; count: bigint }>>`
        SELECT country, COUNT(DISTINCT session_id)::bigint AS count
        FROM shop_visits
        WHERE shop_id = ${shopId} AND country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
        LIMIT 8
      `,
      db.$queryRaw<Array<{ city: string; country: string; count: bigint }>>`
        SELECT city, country, COUNT(DISTINCT session_id)::bigint AS count
        FROM shop_visits
        WHERE shop_id = ${shopId} AND city IS NOT NULL AND country IS NOT NULL
        GROUP BY city, country
        ORDER BY count DESC
        LIMIT 8
      `,
    ]);

  const topCountries = countryRows.map((row) => ({
    code: row.country,
    label: formatCountryName(row.country),
    count: Number(row.count),
  }));

  const topCities = cityRows.map((row) => ({
    label: row.city,
    country: formatCountryName(row.country),
    count: Number(row.count),
  }));

  return {
    today,
    month,
    total,
    liveVisitors: liveRows.length,
    topCountries,
    topCities,
    cityDataAvailable: topCities.length > 0,
  };
}

export const VISIT_SESSION_STORAGE_KEY = "sellia_shop_visit_session";

export function generateVisitSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
