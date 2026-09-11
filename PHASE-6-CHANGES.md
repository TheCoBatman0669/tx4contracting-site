# TX4 Contracting — Phase 6 (Protected Admin Queue)

Database work is **already applied** to the live project. The files in
`phase6/` are the Next.js side — drop them into the repo, preserving paths.

---

## Getting the four of you logged in

Admin access is granted by **email allowlist**, not by signing up. These four
addresses are already on it:

- colton@tx4contracting.com
- gavin@tx4contracting.com
- dennis@tx4contracting.com
- rodrigo@tx4contracting.com

Creating an account is necessary but not sufficient. If someone signs up with
an address that is not on the allowlist, the account exists with **zero
access** — every policy checks admin_users membership, and they will see the
"No access" screen.

**Three steps in the Supabase dashboard:**

1. **Authentication → Providers → Email:** turn **off** "Allow new users to
   sign up". Nobody should be self-registering on this project.
2. **Authentication → Users → Invite user:** invite each of the four addresses.
   Each person gets an email and sets their own password. A database trigger
   promotes them to administrator automatically on account creation.
3. **Authentication → URL Configuration:** add
   `https://tx4contracting.com/admin/inquiries` to the redirect allowlist so
   invite and password-reset links land in the right place.

Passwords never pass through me, this chat, or a migration file. To add or
remove an administrator later, add or delete a row in `admin_allowlist`, or set
`is_active = false` in `admin_users` to revoke access while keeping their audit
history intact.

---

## What the queue does

**`/admin/inquiries`** — stats across the top (new, unassigned, assigned to me,
last 7 days, spam caught), then filters for status, form type, capability,
assignment, and date range, plus search across reference number, organization,
contact name, email, and solicitation number. Sortable by date, status, or
organization. CSV export respects the current filters.

**`/admin/inquiries/[id]`** — the full submission, attachments, workflow
controls, internal notes, and complete event history.

A few decisions worth knowing about:

- **Spam is hidden by default** rather than deleted, so a flood of it never
  buries real submissions — but it is one filter selection away, and flagged
  items carry a visible reminder that heuristics get things wrong.
- **Downloads mint a 2-minute signed URL at click time** and log who requested
  it before opening. Nothing in the queue is ever a public file URL.
- **CSV export escapes formula injection.** A cell starting with `=`, `+`, `-`,
  or `@` is executed by Excel and Sheets on open. Since these values come from
  a public form, they are prefixed with an apostrophe.
- **Login errors are deliberately vague.** "Not recognised" rather than "wrong
  password", because distinguishing the two tells an attacker which addresses
  are real.
- **The "This became work" checkbox** moves a record from the 24-month schedule
  to the 7-year contract-record schedule. It is on the detail page and writes an
  audit event.

---

## Audit trail

Every admin action — status change, assignment, note, file download — writes an
event in the same transaction as the change, so the trail cannot drift from the
data. The actor is stamped from the session inside a `SECURITY DEFINER`
function, so it cannot be spoofed by the caller.

Combined with the Phase 5 column grants, this means **administrators can change
workflow state but cannot edit a submission's content**. What the submitter
sent is what the record shows, permanently.

---

## Attachment purge (the Phase 5 leftover)

`purge-attachments` is deployed. It removes storage objects 12 months after
submission, stamps `purged_at`, and writes one audit event per inquiry. The
file row is kept so the queue can still show that a file existed and when it
went.

It is not called by a browser, so it runs with JWT verification off and a shared
secret instead. **Set `PURGE_SECRET`** in Edge Function secrets to a long random
string, then run this once in the SQL editor to schedule it, substituting your
value:

```sql
create extension if not exists pg_net;

select cron.schedule(
  'purge-attachments',
  '30 8 * * *',
  $$
  select net.http_post(
    url := 'https://jhcyijhcdjgnrcurpyzn.supabase.co/functions/v1/purge-attachments',
    headers := '{"Content-Type":"application/json","x-purge-secret":"YOUR_PURGE_SECRET"}'::jsonb
  );
  $$
);
```

I did not schedule this myself because it needs the secret, and the secret
should not pass through this conversation.

I also fixed a bug in the Phase 5 purge routine while I was here: it had a no-op
`update` setting `purged_at = null` on rows where it was already null. It now
reports what is due and leaves the stamping to the edge function.

---

## Security verification

I tested rather than assumed, simulating a signed-in user who is **not** an
administrator:

- Sees zero inquiries, zero files, zero admin_users
- `is_admin()` returns false
- `admin_inquiry_stats()` and `admin_add_note()` both denied

The linter also caught something real: `handle_new_auth_user()` was exposed at
`/rest/v1/rpc/handle_new_auth_user` to anonymous callers, because Postgres
grants `EXECUTE` to `PUBLIC` by default. It would have failed without trigger
context, but an unauthenticated endpoint into a `SECURITY DEFINER` function has
no business existing. Revoked. Triggers run as the table owner and are
unaffected.

Remaining linter findings are all intentional: `submission_attempts` has RLS on
with no policies (deliberate deny-all), and the `admin_*` functions are
`SECURITY DEFINER` callable by authenticated users — which is what makes them
work, and each checks `is_admin()` first.

---

## Files

**New:** `lib/admin/types.ts`, `components/admin/admin-provider.tsx`,
`components/admin/admin-login.tsx`, `components/admin/admin-shell.tsx`,
`components/admin/inquiry-queue.tsx`, `components/admin/inquiry-detail.tsx`,
`components/site-chrome.tsx`, `app/admin/layout.tsx`, `app/admin/page.tsx`,
`app/admin/inquiries/page.tsx`, `app/admin/inquiries/[id]/page.tsx`,
`supabase/functions/purge-attachments/`

**Modified:** `lib/supabase.ts` (lazy browser client with session persistence),
`app/layout.tsx` (chrome now conditional, so `/admin` gets no marketing header
or footer — every public URL is unchanged)

---

## Still outstanding

- `TURNSTILE_SECRET_KEY`, `IP_HASH_SALT`, `ALLOWED_ORIGINS` from Phase 5. Until
  the first is set, the public forms return an error on every submission.
- `PURGE_SECRET` and the cron snippet above.
- **`public/tx4-logo.PNG` is still missing.** It now also affects the admin
  login screen and header, not just the public site.
- The privacy policy still does not state the retention periods.
