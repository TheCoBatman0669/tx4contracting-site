/**
 * Submission transport.
 *
 * Posts multipart form data to the Supabase edge function built in Phase 5.
 * This module intentionally knows nothing about validation rules or database
 * shape: it packages the payload, sends it, and reports back.
 *
 * The browser never inserts directly into Postgres. Every submission goes
 * through the server-side function so validation, Turnstile verification,
 * rate limiting, and file handling are enforced where they cannot be bypassed.
 */

export const SUBMISSION_ENDPOINT_PATH = '/functions/v1/submit-inquiry';

export type SubmissionKind = 'project_inquiry' | 'teaming';

export interface SubmissionResult {
  ok: boolean;
  referenceNumber?: string;
  /** Message safe to show the visitor. Never contains server internals. */
  error?: string;
  /** True when the confirmation came from the local preview path, not the server. */
  preview?: boolean;
}

const GENERIC_ERROR =
  'We could not submit your inquiry. Please try again, or contact us directly if the problem continues.';

function getEndpoint(): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}${SUBMISSION_ENDPOINT_PATH}`;
}

/** Per-attempt key so a double-click or retry cannot create two records. */
export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Development-only stand-in used before the Phase 5 function is deployed, so
 * the form flow can be reviewed end to end. Never runs in production: without a
 * working endpoint, production shows a real error instead of a false success.
 */
function previewResult(): SubmissionResult {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return {
    ok: true,
    referenceNumber: `TX4-${year}-PREVIEW-${suffix}`,
    preview: true,
  };
}

export async function submitInquiry(
  kind: SubmissionKind,
  formData: FormData,
  idempotencyKey: string
): Promise<SubmissionResult> {
  const endpoint = getEndpoint();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isDev = process.env.NODE_ENV === 'development';

  formData.set('submissionKind', kind);

  if (!endpoint || !anonKey) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(
        '[TX4] Supabase env vars missing. Returning a preview confirmation. Deploy the Phase 5 submit-inquiry function for real submissions.'
      );
      return previewResult();
    }
    return { ok: false, error: GENERIC_ERROR };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        // Supabase edge functions require the anon key on the request.
        // Do not set Content-Type: the browser sets the multipart boundary.
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Idempotency-Key': idempotencyKey,
      },
      body: formData,
    });

    if (response.status === 404 && isDev) {
      // eslint-disable-next-line no-console
      console.warn(
        '[TX4] submit-inquiry function not deployed yet. Returning a preview confirmation.'
      );
      return previewResult();
    }

    let payload: { referenceNumber?: string; error?: string } = {};
    try {
      payload = await response.json();
    } catch {
      // Some failures return an empty body. Fall through to the generic error.
    }

    if (!response.ok) {
      if (response.status === 429) {
        return {
          ok: false,
          error:
            'Too many submissions from this connection. Please wait a few minutes and try again.',
        };
      }
      if (response.status === 413) {
        return {
          ok: false,
          error:
            'The attachments are too large to submit. Remove a file and try again.',
        };
      }
      // Only surface a server message when the function explicitly provides a
      // visitor-safe one. Everything else falls back to the generic error.
      return { ok: false, error: payload.error || GENERIC_ERROR };
    }

    if (!payload.referenceNumber) {
      return { ok: false, error: GENERIC_ERROR };
    }

    return { ok: true, referenceNumber: payload.referenceNumber };
  } catch {
    return {
      ok: false,
      error:
        'We could not reach the server. Check your connection and try again.',
    };
  }
}
