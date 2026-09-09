# TX4 Contracting — Phase 5 (Database, Security, Server-Side Submissions)

Everything in this phase is **already live** on the `tx4-contracting` Supabase
project (`jhcyijhcdjgnrcurpyzn`, us-east-2). The files in `phase5/` are the
version-controlled copies for your repo — the migrations and function have
already been applied and deployed.

---

## ⚠️ One thing before the forms will work

The edge function **fails closed** if `TURNSTILE_SECRET_KEY` is not set. Until
you add it, every submission returns a generic error. That is deliberate:
accepting submissions with bot verification silently disabled would be worse
than a visible outage.

In the Supabase dashboard → **Project Settings → Edge Functions → Secrets**, add:

| Secret | Value |
|---|---|
| `TURNSTILE_SECRET_KEY` | The private half of your Turnstile pair, from Cloudflare |
| `IP_HASH_SALT` | Any long random string you generate once and never change |
| `ALLOWED_ORIGINS` | `https://tx4contracting.com,https://www.tx4contracting.com,http://localhost:3000` plus your Netlify preview domain |

Already defaulted in code, override only if they change:
`N8N_WEBHOOK_URL`, `NOTIFICATION_EMAIL` (`contracts@tx4contracting.com`).

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically. Never
add the service role key to Netlify.

---

## Schema

**`inquiries`** — one row per submission. Shared contact columns, then
kind-specific columns for project inquiries and teaming, plus consent
timestamp, attribution, hashed IP, user agent, idempotency key, spam reasons,
assignment, and the retention flag.

**`inquiry_files`** — attachment metadata pointing at private storage paths.
No public URLs are ever stored.

**`inquiry_events`** — append-only audit trail. Written by the edge function
directly (service role) and by admins through `log_inquiry_event()`, which
stamps the actor from the session rather than trusting the caller.

**`submission_attempts`** — every attempt including rejected ones, for rate
limiting. IPs are salted-hashed, not stored. Purged after 7 days.

**`admin_users`** — the only thing granting read access to submissions. There is
no self-service path in; rows are added manually in Phase 6.

---

## Security

**Deny by default, verified.** I ran an impersonation test as the `anon` role
against every access path. All five denied: select inquiries, insert inquiries,
select files, select attempts, call the reference generator. The browser cannot
reach Postgres at all — submissions only enter through the edge function.

**Column-level grants.** Even an authenticated admin can only write
`status`, `assigned_to`, `reviewed_at`, and `became_work`. Contact details,
scope text, consent, and attribution are immutable once submitted, so the record
stays faithful to what was actually sent.

**Private storage.** The `inquiry-attachments` bucket is `public = false` with a
10 MB limit and a MIME allowlist enforced by the bucket itself. Uploads happen
with the service role; admins read via short-lived signed URLs.

**Security linter:** three findings, all intentional —
`submission_attempts` has RLS on with zero policies (deliberate deny-all), and
`is_admin()` / `log_inquiry_event()` are `SECURITY DEFINER` callable by
authenticated users, which is what makes them work. I also revoked the default
`PUBLIC` execute grant on `generate_reference_number()`, which the linter did
not flag but would have exposed it to anonymous callers.

---

## The edge function

`submit-inquiry`, JWT verification on. In order: origin allowlist → payload size
→ rate limit → honeypot → timing trap → Turnstile → consent → full field
re-validation → idempotency → insert → upload → audit event → n8n.

Notable behaviours:

- **Spam is stored, not rejected.** A tripped honeypot or a sub-3-second fill
  gets `status = 'spam'` with the reason recorded, and the visitor still sees a
  normal confirmation. Bots learn nothing, and a false positive is recoverable
  from the admin queue rather than lost.
- **Rate limit:** 5 per hour, 15 per day per hashed IP, counting rejected
  attempts too.
- **Idempotency:** a repeated `Idempotency-Key` returns the original reference
  number instead of creating a second row.
- **A failed attachment never loses the inquiry.** Upload errors are logged and
  skipped; the text of the submission is what matters most.
- **The n8n call happens after the record is committed**, so a webhook outage
  cannot cost you a submission. Failures are logged, not shown to the visitor.
- Reference numbers (`TX4-2026-K7M2QP`) omit 0/O and 1/I and carry no sequence,
  so they reveal nothing about submission volume.

---

## What n8n receives

`POST` to your webhook with JSON:

```
referenceNumber, submissionKind, status, spamReasons, notificationEmail,
submittedAt,
submitter: { firstName, lastName, email, phone },
submission: { ...all form fields, snake_case as stored... },
attribution: { sourcePage, referrer, utmSource, utmMedium, utmCampaign,
               utmTerm, utmContent },
attachments: [ { filename, mimeType, size, downloadUrl } ]
```

`downloadUrl` is a signed link valid for 7 days, not a public URL.

Two things to build on your side: route on `status` so spam does not page
anyone, and send the submitter confirmation as well as the internal notification
to `contracts@tx4contracting.com` — the function does not send email itself.

Your webhook is currently unauthenticated. Anyone who has the URL can post to
it. Worth adding header auth in n8n and setting the matching header here.

---

## Retention (your approved schedule, running nightly)

| What | Kept | Job |
|---|---|---|
| Flagged spam | 30 days, whole record | `purge-expired-submissions`, 08:15 UTC |
| Attachments | 12 months, record retained | same job marks; storage cleanup pending |
| Inquiries, no work | 24 months | same job |
| Inquiries that became work | 7 years | same job, keyed on `became_work` |
| Rate-limit ledger | 7 days | `purge-submission-attempts`, 08:45 UTC |

`became_work` is a column an admin sets from the queue in Phase 6. Until someone
flips it, everything is on the 24-month schedule.

**Not yet done:** deleting the storage objects for expired attachments. The
database rows are identified, but removing the files needs a scheduled function
with storage access. I'll add it in Phase 6 alongside the admin download path,
since both need the same signed-URL plumbing.

---

## Still outstanding

- `public/tx4-logo.PNG` is still missing. Every page renders a broken logo.
- The privacy policy describes what is collected but not how long it is kept.
  Now that retention is decided, it should state these periods before launch.