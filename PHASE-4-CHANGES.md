# TX4 Contracting — Phase 4 (Submission Forms)

## How to apply

Drop the contents of `phase4/` into the project root, preserving folder paths.
No new packages: `react-hook-form`, `@hookform/resolvers`, and `zod` were already
in `package.json`. No database changes are required to run Phase 4.

---

## What was built

### Form A — Project or Contract Inquiry (`/contact`)

The contact page is now the form rather than two placeholder cards. The first
question is who you are, and the rest of the form adapts:

| Selection | Extra fields shown |
|---|---|
| Government buyer | Level of government (required), solicitation/contract number, contract vehicle |
| Prime contractor | Solicitation or prime contract number, contract vehicle |
| Something else | How you are involved (required) |

Everyone answers: name, email, phone, organization, job title, capability
needed, project location, response deadline, estimated value range, scope
summary, attachments, consent.

The capability dropdown is generated from published capabilities, so the form
can never offer a service TX4 has not confirmed it performs. As you publish the
draft capabilities from Phase 3, they appear here automatically.

### Form B — Team With TX4 (`/teaming/apply`)

A separate route rather than a second form on `/contact`, because the questions
share almost nothing. `/teaming`'s CTA and a card on `/contact` both point here.

Company name, website, years in business, contact details, partner type
(multi-select), trades/services provided, service territory, NAICS codes,
certifications (multi-select), bonding capacity, company description, and
capability statement upload.

The consent text states plainly that submitting is not a bid, teaming
agreement, or commitment to award work.

### Spam protection

- **Cloudflare Turnstile** on both forms, invisible (`interaction-only`) so real
  visitors normally see nothing.
- **Honeypot** — an off-screen `companyFax` field that must arrive empty. It uses
  off-screen positioning rather than `display: none`, since some bots skip
  fields that are not rendered at all.
- **Timing trap** — `formRenderedAt` is stamped on mount. Submissions completed
  implausibly fast are almost certainly scripted. The server decides the
  threshold in Phase 5.

Turnstile falls back to Cloudflare's always-passes test key when
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, so development is not blocked. The
submit button is only gated on a token once a real key is configured —
otherwise a widget failure would lock the form for no security benefit.

### Validation and accessibility

- Zod schemas with conditional rules via `superRefine`. Attachments are
  validated separately in `lib/file-validation.ts`, deliberately outside zod:
  referencing the `File` global at module scope breaks server rendering.
- Validation on blur, then on every change once submitted.
- Error summary at the top of the form with `role="alert"` that takes focus,
  plus react-hook-form focusing the first invalid field.
- Real `<fieldset>`/`<legend>` grouping, required fields marked visually and for
  screen readers, `aria-describedby` and `aria-invalid` wired by the shadcn form
  primitives.
- Consent is `z.literal(true)`, so submission is impossible without it.
- File list changes are announced through a live region.
- Confirmation screen takes focus on render, so keyboard users are not stranded
  at the bottom of a form that no longer exists.

### Attachments

PDF, Word, Excel, PNG, JPG. Five files at 10 MB each for project inquiries, two
for capability statements, 25 MB total. Extension **and** MIME type are both
checked because browsers report each loosely. The field warns against attaching
classified or otherwise controlled material.

### Confirmation screen

Reference number with a copy button, a summary of what was submitted, and four
numbered next steps with an honest response window. In development, when the
Phase 5 endpoint is not deployed, it renders a clearly-labelled
**"Development preview — nothing was saved"** banner. That path is
`NODE_ENV === 'development'` only; production with no working endpoint shows a
real error rather than a false success.

### Attribution

`lib/attribution.ts` captures source page, referrer origin+path (query string
stripped), and UTM values, persisting UTMs in `sessionStorage` so a visitor who
lands on a campaign URL and browses before submitting still carries the original
source. Read from `window`, not `useSearchParams`, so statically rendered pages
do not need a Suspense boundary.

---

## Database: nothing to change yet, but here is the contract

**Phase 4 needs no Supabase work.** The forms run against the dev preview until
Phase 5 exists. Do not have bolt create tables yet — Phase 5 should create the
schema, RLS policies, storage bucket, and edge function together, since they
only make sense as one unit.

When you start Phase 5, the edge function must match what the client already
sends, or the forms will break. Give bolt this contract:

**Endpoint:** `POST {SUPABASE_URL}/functions/v1/submit-inquiry`
**Content type:** `multipart/form-data`
**Headers:** `apikey` and `Authorization: Bearer <anon key>`, plus
`Idempotency-Key` (a UUID per attempt — reuse must return the original result,
not a duplicate row).

**Fields on every submission:**
`submissionKind` (`project_inquiry` | `teaming`), `turnstileToken`, `consent`,
`companyFax` (honeypot — reject if non-empty), `formRenderedAt` (epoch ms),
`sourcePage`, `referrer`, `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`,
`utmContent`, and repeated `attachments` file parts.

**`project_inquiry` adds:** `inquiryType`, `firstName`, `lastName`, `email`,
`phone`, `jobTitle`, `organization`, `agencyLevel`, `solicitationNumber`,
`contractVehicle`, `relationshipDescription`, `capability`, `projectLocation`,
`responseDeadline`, `estimatedValueRange`, `scopeSummary`.

**`teaming` adds:** `companyName`, `firstName`, `lastName`, `email`, `phone`,
`companyWebsite`, `partnerTypes` (repeated), `capabilitiesProvided`,
`serviceTerritory`, `naicsCodes`, `certifications` (repeated),
`bondingCapacity`, `yearsInBusiness`, `description`.

`partnerTypes` and `certifications` are sent as repeated keys, not a joined
string, so read them with `getAll()`.

**Responses the client already handles:**

| Status | Body | Client behaviour |
|---|---|---|
| 200 | `{ "referenceNumber": "TX4-2026-A7K2Q9" }` | Confirmation screen |
| 429 | any | "Too many submissions… wait a few minutes" |
| 413 | any | "Attachments are too large… remove a file" |
| other 4xx/5xx | `{ "error": "visitor-safe message" }` | Shows that message |
| other 4xx/5xx | no/invalid body | Generic error |

Only return an `error` string when it is safe for a member of the public to
read. Never leak database or validation internals — the client will display
whatever you put there.

The stored option values (`government_buyer`, `sba_8a`, `1m_5m`, and so on) are
the strings written to the database. Changing one after submissions exist needs
a data migration, so treat them as fixed.

---

## Still blocking launch

**`public/tx4-logo.PNG` is still missing from the project.** The header, mobile
nav, footer, and Organization structured data all reference it. Every page is
currently rendering a broken logo. This has now been outstanding since Phase 2.

---

## What I need from you

1. **A Cloudflare account for Turnstile**, or a decision to use something else.
   Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Netlify; the secret key goes in the
   Supabase edge function environment in Phase 5, never in the site build.
2. **The notification inbox** — which address should receive new submission
   alerts. Goes in `companyData.notificationEmail`.
3. **Confirm the response window.** The confirmation screen currently promises
   one to two business days. If that is not realistic, tell me what is.
4. **Confirm the retention period** for submissions and attachments, so the
   privacy policy can state it before launch.
