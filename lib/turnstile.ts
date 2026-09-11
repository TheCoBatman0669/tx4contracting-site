/**
 * Cloudflare Turnstile configuration.
 *
 * When NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset we fall back to Cloudflare's
 * always-passes test key so the forms remain usable in development. That key
 * provides no protection, so the submit button is not gated on it and the
 * Phase 5 edge function must treat a missing secret as a hard failure in
 * production rather than skipping verification.
 */

/** Cloudflare's documented dummy site key: always issues a passing token. */
export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY;

export const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js';

export const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** True once a real site key is configured. */
export function isTurnstileConfigured(): boolean {
  return TURNSTILE_SITE_KEY !== TURNSTILE_TEST_SITE_KEY;
}

/**
 * Whether submission should be blocked until a token is issued. We only enforce
 * this with a real site key: with the test key a widget failure would lock the
 * form for no security benefit.
 */
export function isTurnstileEnforced(): boolean {
  return isTurnstileConfigured();
}
