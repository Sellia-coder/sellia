/**
 * Rate limiting dédié à l'authentification (anti brute force / bourrage).
 *
 * ⚠️ FAIL-OPEN : si le store de rate-limit lève une exception, on LAISSE PASSER.
 * On ne bloque JAMAIS un utilisateur légitime à cause d'un bug de rate-limit.
 * ⚠️ Fenêtres glissantes en mémoire : aucun verrou permanent, tout expire.
 */

import {
  rateLimit,
  peekRateLimit,
  resetRateLimit,
  getClientIp,
} from "@/lib/security/rate-limit";

const MIN = 60_000;
const HOUR = 60 * MIN;

/** Seuils prudents — desserrer si trop strict. */
export const AUTH_LIMITS = {
  /** Login : 5 échecs / 15 min par (IP + email). Reset au succès. */
  LOGIN: { limit: 5, windowMs: 15 * MIN },
  /** Inscription : 5 / heure / IP (anti-spam de comptes). */
  SIGNUP: { limit: 5, windowMs: HOUR },
  /** Forgot password : 3 / heure / email (anti-spam d'emails). */
  FORGOT: { limit: 3, windowMs: HOUR },
} as const;

/** Récupère l'IP cliente (cf-connecting-ip > 1ère IP de x-forwarded-for). */
export function authClientIp(headers: Headers): string {
  try {
    return getClientIp(headers);
  } catch {
    return "unknown";
  }
}

function norm(s: string): string {
  return s.trim().toLowerCase().slice(0, 200);
}

/**
 * Vérifie (sans consommer) si une tentative de login est encore autorisée.
 * À appeler AVANT de vérifier le mot de passe.
 */
export function checkLoginAllowed(
  ip: string,
  email: string
): { allowed: boolean; resetInSec: number } {
  try {
    const key = `auth:login:${ip}:${norm(email)}`;
    const { allowed, resetIn } = peekRateLimit(key, AUTH_LIMITS.LOGIN.limit);
    return { allowed, resetInSec: Math.ceil(resetIn / 1000) };
  } catch {
    return { allowed: true, resetInSec: 0 }; // fail-open
  }
}

/** Enregistre un échec de login (incrémente le compteur IP+email). */
export function recordLoginFailure(ip: string, email: string): void {
  try {
    const key = `auth:login:${ip}:${norm(email)}`;
    rateLimit(key, AUTH_LIMITS.LOGIN.limit, AUTH_LIMITS.LOGIN.windowMs);
  } catch {
    /* fail-open : on ignore */
  }
}

/** Réinitialise le compteur de login (connexion réussie). */
export function resetLoginFailures(ip: string, email: string): void {
  try {
    resetRateLimit(`auth:login:${ip}:${norm(email)}`);
  } catch {
    /* fail-open */
  }
}

/**
 * Consomme une unité de quota pour une action par clé (signup, forgot…).
 * Retourne allowed=false quand le quota est dépassé.
 */
function consume(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; resetInSec: number } {
  try {
    const r = rateLimit(key, limit, windowMs);
    return { allowed: r.allowed, resetInSec: Math.ceil(r.resetIn / 1000) };
  } catch {
    return { allowed: true, resetInSec: 0 }; // fail-open
  }
}

/** Inscription : 5 / heure / IP. */
export function checkSignupAllowed(ip: string): {
  allowed: boolean;
  resetInSec: number;
} {
  return consume(
    `auth:signup:${ip}`,
    AUTH_LIMITS.SIGNUP.limit,
    AUTH_LIMITS.SIGNUP.windowMs
  );
}

/** Forgot password : 3 / heure / email. */
export function checkForgotAllowed(email: string): {
  allowed: boolean;
  resetInSec: number;
} {
  return consume(
    `auth:forgot:${norm(email)}`,
    AUTH_LIMITS.FORGOT.limit,
    AUTH_LIMITS.FORGOT.windowMs
  );
}

/** Message standard 429 (durée arrondie en minutes, min 1). */
export function tooManyAttemptsMessage(resetInSec: number): string {
  const min = Math.max(1, Math.ceil(resetInSec / 60));
  return `Trop de tentatives. Réessayez dans ${min} minute${min > 1 ? "s" : ""}.`;
}
