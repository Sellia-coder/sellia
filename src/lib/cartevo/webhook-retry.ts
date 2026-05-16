/**
 * Helpers pour le retry exponentiel des webhooks Cartevo
 * bloqués sur 404 (race condition Cartevo).
 *
 * Stratégie : 30s, 1min, 5min, 30min, 2h, puis "investigation_needed".
 */

const RETRY_DELAYS_SECONDS = [30, 60, 300, 1800, 7200];
export const MAX_RETRY_COUNT = RETRY_DELAYS_SECONDS.length;

export function computeNextRetryAt(currentRetryCount: number): Date | null {
  if (currentRetryCount >= MAX_RETRY_COUNT) {
    return null;
  }
  const delaySec = RETRY_DELAYS_SECONDS[currentRetryCount];
  const next = new Date();
  next.setSeconds(next.getSeconds() + delaySec);
  return next;
}

export function describeRetryDelay(retryCount: number): string {
  if (retryCount >= MAX_RETRY_COUNT) return "max reached";
  const delaySec = RETRY_DELAYS_SECONDS[retryCount];
  if (delaySec < 60) return `${delaySec}s`;
  if (delaySec < 3600) return `${Math.round(delaySec / 60)}min`;
  return `${Math.round(delaySec / 3600)}h`;
}

export const WEBHOOK_ERROR_STATUS = {
  PENDING_PROPAGATION: "pending_propagation_at_cartevo",
  INVESTIGATION_NEEDED: "investigation_needed_max_retry_reached",
  AMOUNT_MISMATCH: "amount_mismatch",
  NO_LOCAL_TX: "no_local_transaction",
  VERIFY_FAILED: "verify_on_pull_failed",
} as const;
