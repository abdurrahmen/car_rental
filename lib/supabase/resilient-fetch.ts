/**
 * Resilient fetch implementation for Supabase client.
 * Includes a fast circuit-breaker to prevent hanging on paused or unreachable Supabase hosts,
 * and sets AbortError to prevent PostgREST's internal 7+ second exponential retry loop.
 */

let isOffline = false;
let lastFailure = 0;
const OFFLINE_COOLDOWN_MS = 30000; // 30 seconds circuit breaker

async function checkHost(hostname: string): Promise<boolean> {
  // If in browser or environment without Node.js dns, return true and rely on timeout
  if (typeof window !== 'undefined') return true;

  try {
    const dns = await import('dns').then((m) => m.promises);
    const lookupPromise = dns.lookup(hostname);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 400),
    );
    await Promise.race([lookupPromise, timeoutPromise]);
    return true;
  } catch {
    return false;
  }
}

export async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const now = Date.now();

  // Fast-fail if circuit is open
  if (isOffline && now - lastFailure < OFFLINE_COOLDOWN_MS) {
    const abortErr = new Error(
      'Supabase host is currently unreachable (circuit open)',
    );
    abortErr.name = 'AbortError';
    throw abortErr;
  }

  // Pre-flight host check if offline cooldown expired
  try {
    const urlStr =
      typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request).url;
    const hostname = new URL(urlStr).hostname;
    const reachable = await checkHost(hostname);
    if (!reachable) {
      isOffline = true;
      lastFailure = Date.now();
      const abortErr = new Error('Supabase host unreachable: DNS lookup failed');
      abortErr.name = 'AbortError';
      throw abortErr;
    }
  } catch (e: unknown) {
    if ((e as Error)?.name === 'AbortError') throw e;
  }

  try {
    const timeoutSignal = AbortSignal.timeout(2000);
    const signal = init?.signal
      ? AbortSignal.any([init.signal, timeoutSignal])
      : timeoutSignal;

    const res = await fetch(input, { ...init, signal });
    isOffline = false;
    return res;
  } catch (err: unknown) {
    isOffline = true;
    lastFailure = Date.now();
    const message = err instanceof Error ? err.message : 'Host unreachable';
    const abortErr = new Error(`Supabase request failed: ${message}`);
    // PostgREST specifically skips retry loops when error name is AbortError
    abortErr.name = 'AbortError';
    throw abortErr;
  }
}
