/**
 * submit-inquiry
 *
 * The only path from the public website into the database. The browser never
 * inserts directly: it posts multipart form data here, and everything that
 * matters is decided on this side of the wire.
 *
 * Order of operations:
 *   1. Origin allowlist and payload size
 *   2. Rate limit by hashed IP
 *   3. Honeypot and timing traps
 *   4. Cloudflare Turnstile verification (fails closed)
 *   5. Full re-validation of every field
 *   6. Idempotency check
 *   7. Insert inquiry, upload attachments, write audit event
 *   8. Notify n8n
 *
 * Failures return a generic message. Database and validation internals are
 * logged, never returned.
 */

import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TURNSTILE_SECRET = Deno.env.get('TURNSTILE_SECRET_KEY') ?? '';
const N8N_WEBHOOK_URL =
  Deno.env.get('N8N_WEBHOOK_URL') ??
  'https://c01t-b2tt-6-8-2002.app.n8n.cloud/webhook/contract-sub-form-hook';
const NOTIFICATION_EMAIL =
  Deno.env.get('NOTIFICATION_EMAIL') ?? 'contracts@tx4contracting.com';
const IP_HASH_SALT = Deno.env.get('IP_HASH_SALT') ?? SERVICE_ROLE_KEY;

const ALLOWED_ORIGINS = (
  Deno.env.get('ALLOWED_ORIGINS') ??
  'https://tx4contracting.com,https://www.tx4contracting.com,http://localhost:3000'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const GENERIC_ERROR =
  'We could not submit your inquiry. Please try again, or contact us directly if the problem continues.';

const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;
const MIN_FILL_SECONDS = 3;
const RATE_LIMIT_HOUR = 5;
const RATE_LIMIT_DAY = 15;

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
]);

const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'];

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/* ----------------------------- helpers ----------------------------- */

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin! : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers':
      'authorization, apikey, content-type, idempotency-key, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(
  body: unknown,
  status: number,
  origin: string | null
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(IP_HASH_SALT + ':' + ip);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('cf-connecting-ip') ?? 'unknown';
}

function str(form: FormData, key: string, max = 4000): string {
  const value = form.get(key);
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function list(form: FormData, key: string): string[] {
  return form
    .getAll(key)
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 25);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}

function sanitizeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'file';
  const cleaned = base
    .replace(/[^\w.\- ]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 100);
  return cleaned || 'file';
}

function hasAllowedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ALLOWED_EXT.some((ext) => lower.endsWith(ext));
}

async function recordAttempt(
  ipHash: string,
  outcome: string,
  kind: string | null
) {
  await admin
    .from('submission_attempts')
    .insert({ ip_hash: ipHash, outcome, submission_kind: kind });
}

/* ---------------------------- validation ---------------------------- */

function validate(
  form: FormData,
  kind: string
): { errors: string[]; row: Record<string, unknown> } {
  const errors: string[] = [];
  const row: Record<string, unknown> = {};

  const firstName = str(form, 'firstName', 80);
  const lastName = str(form, 'lastName', 80);
  const email = str(form, 'email', 254);
  const phone = str(form, 'phone', 40);

  if (!firstName) errors.push('firstName');
  if (!lastName) errors.push('lastName');
  if (!isEmail(email)) errors.push('email');

  Object.assign(row, {
    first_name: firstName,
    last_name: lastName,
    email: email.toLowerCase(),
    phone: phone || null,
  });

  if (kind === 'project_inquiry') {
    const inquiryType = str(form, 'inquiryType', 40);
    const organization = str(form, 'organization', 160);
    const capability = str(form, 'capability', 80);
    const projectLocation = str(form, 'projectLocation', 160);
    const scopeSummary = str(form, 'scopeSummary', 4000);
    const agencyLevel = str(form, 'agencyLevel', 40);
    const relationship = str(form, 'relationshipDescription', 300);
    const deadline = str(form, 'responseDeadline', 20);

    if (!['government_buyer', 'prime_contractor', 'other'].includes(inquiryType)) {
      errors.push('inquiryType');
    }
    if (!organization) errors.push('organization');
    if (!capability) errors.push('capability');
    if (!projectLocation) errors.push('projectLocation');
    if (scopeSummary.length < 30) errors.push('scopeSummary');
    if (inquiryType === 'government_buyer' && !agencyLevel) errors.push('agencyLevel');
    if (inquiryType === 'other' && !relationship) errors.push('relationshipDescription');

    let responseDeadline: string | null = null;
    if (deadline) {
      const parsed = new Date(deadline + 'T00:00:00Z');
      if (Number.isNaN(parsed.getTime())) errors.push('responseDeadline');
      else responseDeadline = deadline;
    }

    Object.assign(row, {
      inquiry_type: inquiryType,
      job_title: str(form, 'jobTitle', 120) || null,
      organization,
      agency_level: agencyLevel || null,
      solicitation_number: str(form, 'solicitationNumber', 120) || null,
      contract_vehicle: str(form, 'contractVehicle', 160) || null,
      relationship_description: relationship || null,
      capability,
      project_location: projectLocation,
      response_deadline: responseDeadline,
      estimated_value_range: str(form, 'estimatedValueRange', 40) || null,
      scope_summary: scopeSummary,
    });
  } else {
    const companyName = str(form, 'companyName', 160);
    const partnerTypes = list(form, 'partnerTypes');
    const capabilitiesProvided = str(form, 'capabilitiesProvided', 1500);
    const serviceTerritory = str(form, 'serviceTerritory', 300);
    const description = str(form, 'description', 3000);
    const years = str(form, 'yearsInBusiness', 3);

    if (!companyName) errors.push('companyName');
    if (partnerTypes.length === 0) errors.push('partnerTypes');
    if (capabilitiesProvided.length < 10) errors.push('capabilitiesProvided');
    if (!serviceTerritory) errors.push('serviceTerritory');
    if (description.length < 30) errors.push('description');

    Object.assign(row, {
      company_name: companyName,
      company_website: str(form, 'companyWebsite', 200) || null,
      years_in_business: /^\d{1,3}$/.test(years) ? Number(years) : null,
      partner_types: partnerTypes,
      capabilities_provided: capabilitiesProvided,
      service_territory: serviceTerritory,
      naics_codes: str(form, 'naicsCodes', 300) || null,
      certifications: list(form, 'certifications'),
      bonding_capacity: str(form, 'bondingCapacity', 40) || null,
      description,
    });
  }

  return { errors, row };
}

/* ------------------------------ handler ------------------------------ */

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, origin);
  }

  // Hostname check. A missing Origin is allowed so server-side tooling and
  // curl-based smoke tests still work; a present-but-wrong one is rejected.
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    console.warn('Rejected origin:', origin);
    return json({ error: GENERIC_ERROR }, 403, origin);
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (contentLength > MAX_TOTAL_BYTES) {
    return json({ error: 'Attachments are too large.' }, 413, origin);
  }

  const ipHash = await hashIp(clientIp(req));

  try {
    /* ---- rate limiting ---- */
    const hourAgo = new Date(Date.now() - 3600_000).toISOString();
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();

    const [hourResult, dayResult] = await Promise.all([
      admin
        .from('submission_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', hourAgo),
      admin
        .from('submission_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', dayAgo),
    ]);

    if ((hourResult.count ?? 0) >= RATE_LIMIT_HOUR || (dayResult.count ?? 0) >= RATE_LIMIT_DAY) {
      await recordAttempt(ipHash, 'rate_limited', null);
      return json(
        {
          error:
            'Too many submissions from this connection. Please wait a few minutes and try again.',
        },
        429,
        origin
      );
    }

    const form = await req.formData();
    const kind = str(form, 'submissionKind', 40);
    if (kind !== 'project_inquiry' && kind !== 'teaming') {
      await recordAttempt(ipHash, 'bad_kind', null);
      return json({ error: GENERIC_ERROR }, 400, origin);
    }

    const spamReasons: string[] = [];

    /* ---- honeypot ---- */
    if (str(form, 'companyFax', 100)) {
      spamReasons.push('honeypot_filled');
    }

    /* ---- timing trap ---- */
    const renderedAt = Number(str(form, 'formRenderedAt', 20));
    if (Number.isFinite(renderedAt) && renderedAt > 0) {
      const elapsed = (Date.now() - renderedAt) / 1000;
      if (elapsed < MIN_FILL_SECONDS) spamReasons.push('submitted_too_fast');
    }

    /* ---- Turnstile, fails closed ---- */
    if (!TURNSTILE_SECRET) {
      console.error(
        'TURNSTILE_SECRET_KEY is not set. Refusing to accept submissions without bot verification.'
      );
      await recordAttempt(ipHash, 'turnstile_unconfigured', kind);
      return json({ error: GENERIC_ERROR }, 500, origin);
    }

    const turnstileToken = str(form, 'turnstileToken', 4000);
    if (!turnstileToken) {
      await recordAttempt(ipHash, 'turnstile_missing', kind);
      return json(
        { error: 'Please complete the verification check and try again.' },
        400,
        origin
      );
    }

    const verifyBody = new FormData();
    verifyBody.append('secret', TURNSTILE_SECRET);
    verifyBody.append('response', turnstileToken);
    verifyBody.append('remoteip', clientIp(req));

    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: verifyBody }
    );
    const verifyResult = await verifyResponse.json();

    if (!verifyResult.success) {
      console.warn('Turnstile rejected:', verifyResult['error-codes']);
      await recordAttempt(ipHash, 'turnstile_failed', kind);
      return json(
        { error: 'Verification failed. Please refresh the page and try again.' },
        400,
        origin
      );
    }

    /* ---- consent ---- */
    if (str(form, 'consent', 10) !== 'true') {
      await recordAttempt(ipHash, 'no_consent', kind);
      return json(
        { error: 'Consent is required before an inquiry can be submitted.' },
        400,
        origin
      );
    }

    /* ---- field validation ---- */
    const validated = validate(form, kind);
    if (validated.errors.length > 0) {
      console.warn('Validation failed for fields:', validated.errors.join(', '));
      await recordAttempt(ipHash, 'validation_failed', kind);
      return json(
        { error: 'Some required information is missing or invalid.' },
        400,
        origin
      );
    }
    const row = validated.row;

    /* ---- idempotency ---- */
    const idempotencyKey = req.headers.get('idempotency-key')?.slice(0, 100) ?? null;

    if (idempotencyKey) {
      const existingResult = await admin
        .from('inquiries')
        .select('reference_number')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existingResult.data?.reference_number) {
        // A retry of a submission we already stored. Return the original
        // reference rather than creating a second record.
        return json(
          { referenceNumber: existingResult.data.reference_number },
          200,
          origin
        );
      }
    }

    /* ---- attachments ---- */
    const rawFiles = form
      .getAll('attachments')
      .filter((f): f is File => f instanceof File && f.size > 0)
      .slice(0, MAX_FILES);

    let totalBytes = 0;
    for (const file of rawFiles) {
      totalBytes += file.size;
      if (file.size > MAX_FILE_BYTES || totalBytes > MAX_TOTAL_BYTES) {
        await recordAttempt(ipHash, 'file_too_large', kind);
        return json({ error: 'Attachments are too large.' }, 413, origin);
      }
      if (!ALLOWED_MIME.has(file.type) && !hasAllowedExtension(file.name)) {
        await recordAttempt(ipHash, 'file_type_rejected', kind);
        return json(
          { error: 'One of the attached files is not an accepted file type.' },
          400,
          origin
        );
      }
    }

    /* ---- reference number and insert ---- */
    const refResult = await admin.rpc('generate_reference_number');
    if (refResult.error || !refResult.data) {
      console.error('Reference generation failed:', refResult.error);
      return json({ error: GENERIC_ERROR }, 500, origin);
    }

    const insertResult = await admin
      .from('inquiries')
      .insert({
        ...row,
        reference_number: refResult.data,
        submission_kind: kind,
        status: spamReasons.length > 0 ? 'spam' : 'new',
        spam_reasons: spamReasons,
        consent_at: new Date().toISOString(),
        source_page: str(form, 'sourcePage', 200) || null,
        referrer: str(form, 'referrer', 300) || null,
        utm_source: str(form, 'utmSource', 120) || null,
        utm_medium: str(form, 'utmMedium', 120) || null,
        utm_campaign: str(form, 'utmCampaign', 120) || null,
        utm_term: str(form, 'utmTerm', 120) || null,
        utm_content: str(form, 'utmContent', 120) || null,
        ip_hash: ipHash,
        user_agent: (req.headers.get('user-agent') ?? '').slice(0, 400) || null,
        idempotency_key: idempotencyKey,
      })
      .select('id, reference_number')
      .single();

    if (insertResult.error || !insertResult.data) {
      console.error('Insert failed:', insertResult.error);
      await recordAttempt(ipHash, 'insert_failed', kind);
      return json({ error: GENERIC_ERROR }, 500, origin);
    }
    const inserted = insertResult.data;

    /* ---- upload attachments to the private bucket ---- */
    const storedFiles: {
      originalFilename: string;
      mimeType: string;
      size: number;
      signedUrl: string | null;
    }[] = [];

    for (const file of rawFiles) {
      const safeName = sanitizeFilename(file.name);
      const path = inserted.id + '/' + crypto.randomUUID() + '-' + safeName;

      const uploadResult = await admin.storage
        .from('inquiry-attachments')
        .upload(path, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });

      if (uploadResult.error) {
        // A failed attachment must not lose the inquiry itself. Record the
        // problem and carry on: the text of the submission is what matters most.
        console.error('Upload failed for', safeName, uploadResult.error);
        continue;
      }

      await admin.from('inquiry_files').insert({
        inquiry_id: inserted.id,
        storage_path: path,
        original_filename: file.name.slice(0, 255),
        sanitized_filename: safeName,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
      });

      const signedResult = await admin.storage
        .from('inquiry-attachments')
        .createSignedUrl(path, 60 * 60 * 24 * 7);

      storedFiles.push({
        originalFilename: file.name.slice(0, 255),
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        signedUrl: signedResult.data?.signedUrl ?? null,
      });
    }

    /* ---- audit trail ---- */
    await admin.from('inquiry_events').insert({
      inquiry_id: inserted.id,
      event_type: 'submission_received',
      actor_label: 'system',
      detail: {
        submission_kind: kind,
        attachment_count: storedFiles.length,
        spam_reasons: spamReasons,
        source_page: str(form, 'sourcePage', 200) || null,
      },
    });

    /* ---- notify n8n ---- */
    // Sent after the record is safely stored, so a webhook outage can never
    // cost us a submission. Failures are logged, not surfaced to the visitor.
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNumber: inserted.reference_number,
          submissionKind: kind,
          status: spamReasons.length > 0 ? 'spam' : 'new',
          spamReasons,
          notificationEmail: NOTIFICATION_EMAIL,
          submittedAt: new Date().toISOString(),
          submitter: {
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
          },
          submission: row,
          attribution: {
            sourcePage: str(form, 'sourcePage', 200),
            referrer: str(form, 'referrer', 300),
            utmSource: str(form, 'utmSource', 120),
            utmMedium: str(form, 'utmMedium', 120),
            utmCampaign: str(form, 'utmCampaign', 120),
            utmTerm: str(form, 'utmTerm', 120),
            utmContent: str(form, 'utmContent', 120),
          },
          attachments: storedFiles.map((f) => ({
            filename: f.originalFilename,
            mimeType: f.mimeType,
            size: f.size,
            // Signed link, valid 7 days. Not a public URL.
            downloadUrl: f.signedUrl,
          })),
        }),
      });
    } catch (webhookError) {
      console.error('n8n webhook failed:', webhookError);
    }

    await recordAttempt(ipHash, spamReasons.length > 0 ? 'spam' : 'accepted', kind);

    return json({ referenceNumber: inserted.reference_number }, 200, origin);
  } catch (error) {
    console.error('Unhandled error:', error);
    await recordAttempt(ipHash, 'error', null);
    return json({ error: GENERIC_ERROR }, 500, origin);
  }
});