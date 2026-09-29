/**
 * Client-generated key for wallet mutations (freeze / unfreeze / approve / reject).
 * Mint once per attempt; reuse on retries of the same request; mint a new key for
 * a distinct attempt.
 */
export function createIdempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}
