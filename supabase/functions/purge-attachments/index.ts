/**
 * purge-attachments
 *
 * Completes the retention schedule the database cannot finish on its own:
 * Postgres can delete the inquiry_files rows, but only something with storage
 * access can delete the objects themselves.
 *
 * Attachments are removed 12 months after submission. The inquiry record and
 * its metadata are kept on their own schedule; only the file goes.
 *
 * Authentication: this function is not called by a browser, so it is deployed
 * with JWT verification off and protected by a shared secret instead. Without
 * PURGE_SECRET set it refuses to run.
 */

import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PURGE_SECRET = Deno.env.get('PURGE_SECRET') ?? '';

const RETENTION_MONTHS = 12;
const BATCH_SIZE = 200;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Constant-time comparison so the secret cannot be guessed by timing. */
function secretMatches(provided: string): boolean {
  if (provided.length !== PURGE_SECRET.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ PURGE_SECRET.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!PURGE_SECRET) {
    console.error('PURGE_SECRET is not set. Refusing to run.');
    return new Response(JSON.stringify({ error: 'Not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const provided = req.headers.get('x-purge-secret') ?? '';
  if (!secretMatches(provided)) {
    return new Response(JSON.stringify({ error: 'Unauthorised.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);

    const { data: due, error: selectError } = await admin
      .from('inquiry_files')
      .select('id, inquiry_id, storage_path, original_filename')
      .is('purged_at', null)
      .lt('created_at', cutoff.toISOString())
      .limit(BATCH_SIZE);

    if (selectError) {
      console.error('Could not list expired attachments:', selectError);
      return new Response(JSON.stringify({ error: 'Query failed.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!due || due.length === 0) {
      return new Response(
        JSON.stringify({ purged: 0, message: 'Nothing due.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const paths = due.map((f) => f.storage_path);
    const { error: removeError } = await admin.storage
      .from('inquiry-attachments')
      .remove(paths);

    if (removeError) {
      console.error('Storage removal failed:', removeError);
      return new Response(JSON.stringify({ error: 'Removal failed.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rows are kept with purged_at stamped rather than deleted, so the admin
    // queue can still show that a file existed and when it was removed.
    const now = new Date().toISOString();
    await admin
      .from('inquiry_files')
      .update({ purged_at: now })
      .in(
        'id',
        due.map((f) => f.id)
      );

    // One audit event per inquiry rather than per file.
    const byInquiry = new Map<string, string[]>();
    for (const file of due) {
      const existing = byInquiry.get(file.inquiry_id) ?? [];
      existing.push(file.original_filename);
      byInquiry.set(file.inquiry_id, existing);
    }

    const events = Array.from(byInquiry.entries()).map(([inquiryId, names]) => ({
      inquiry_id: inquiryId,
      event_type: 'purged',
      actor_label: 'system',
      detail: {
        reason: 'attachment_retention_' + RETENTION_MONTHS + '_months',
        files: names,
      },
    }));

    if (events.length > 0) {
      await admin.from('inquiry_events').insert(events);
    }

    console.log('Purged ' + due.length + ' attachments.');

    return new Response(
      JSON.stringify({ purged: due.length, inquiries: byInquiry.size }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(JSON.stringify({ error: 'Purge failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
