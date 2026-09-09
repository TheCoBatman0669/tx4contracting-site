# TX4 Contracting — Phase 3 (Public Content Pages)

## How to apply

Drop the contents of `phase3/` into the project root, preserving folder paths.
Every file either replaces an existing one or creates a new route. No package
installs, no config changes, no database changes.

---

## What Phase 2 left behind

Phase 2 delivered the brand system, layout shell, and homepage:

- `tailwind.config.ts` — navy/steel palette, Inter type scale
- `app/globals.css` — HSL design tokens
- `lib/company-data.ts` — central company facts (all procurement fields still empty)
- `components/site-header.tsx` — sticky header that shrinks on scroll
- `components/mobile-nav.tsx` — sheet-based mobile menu
- `components/site-footer.tsx` — conditional contact/procurement columns
- `components/page-hero.tsx`, `components/section-cta.tsx` — shared page furniture
- `components/turnstile-widget.tsx` — built early, unused until Phase 4
- `app/page.tsx` — hero, procurement bar, capabilities, Why TX4, teaming CTA, final CTA

It also created early drafts of most Phase 3 routes: `/capabilities`,
`/capabilities/[slug]`, `/projects`, `/government-contracting`, `/teaming`,
`/about`, `/privacy`, `/accessibility`, and a custom 404.

Two homepage sections from the plan were never built: **Markets Served** and the
**past-performance preview**. Both are now in place.

---

## What Phase 3 adds

### 1. Capability pages are now genuinely data-driven

`app/capabilities/[slug]/page.tsx` previously hardcoded the General Construction
copy. Adding a second capability would have rendered the wrong page body under
the right title. The template now reads every section from
`lib/capabilities-data.ts`:

what TX4 provides → how it is delivered → where it applies → who benefits →
how safety and quality are managed → how engagement works → FAQ → related links

`lib/capabilities-data.ts` also holds **five complete draft capabilities**
(`published: false`): Civil & Sitework, Facility Repair & Maintenance, Logistics
& Procurement, Emergency Response Support, Specialty Support Services. Flip
`published: true` on any of them once TX4 confirms the service is actually
performed, and the card, detail page, sitemap entry, and static params appear
automatically. Until then their URLs return 404.

### 2. `/projects` and `/projects/[slug]`

- Filtering by project type, market, and location, derived from the data rather
  than hardcoded. Filter chips are real buttons with `aria-pressed` and a live
  result count.
- When no projects are published, the page falls back to the
  "available upon request" state and sets `robots: noindex, follow`, and the
  Projects link stays hidden from nav.
- `/projects/[slug]` renders a case study: facts table, featured image, scope,
  highlights, outcome, photo gallery, capabilities demonstrated, related projects.

`lib/projects-data.ts` is deliberately still an empty array. Nothing gets
published until TX4 confirms the facts and has permission to name the customer,
location, and scope. `confidential: true` covers work that can only be discussed
in a qualification conversation.

### 3. `/insights` and `/insights/[slug]`

- Listing with category, publish date, reading time, and summary.
- Article template with answer-first opening, section headings, author,
  publish date, and a visible "last reviewed" date.
- `Article` JSON-LD carrying author and both dates.
- One unpublished draft article sits in `lib/insights-data.ts` as a working
  template. Same noindex + hidden-nav treatment as Projects while empty.

### 4. SEO groundwork (seeded early, completed in Phase 7)

- `getFaqSchema`, `getArticleSchema`, `getCollectionPageSchema` added to
  `lib/structured-data.ts`.
- Canonical URLs on every new/updated page.
- FAQ schema is only emitted when the same Q&A is visible on the page, which is
  what Google's structured-data policy requires.

### 5. Internal linking

Capability ↔ project ↔ insight links are generated from `relatedCapabilities`
arrays. They render only when the target is published, so no dead links appear
while content is still being collected.

### 6. Smaller fixes

- `components/icon.tsx` replaces the three duplicated local icon maps, so data
  files stay serialisable and unknown icon names fall back gracefully.
- `/government-contracting` now shows each capability's own icon instead of
  Building2 for everything.
- Homepage: Markets Served grid (`lib/markets-data.ts`) and a past-performance
  preview that appears only once projects exist.
- `/contact` placeholder labels corrected from "Phase 3" to "Phase 4" to match
  the plan's numbering.

---

## Database

**No database work is required for Phase 3.** Projects, capabilities, insights,
and markets are file-based content. Nothing on these routes reads from or writes
to Supabase, so there is no schema, RLS policy, or edge function to change yet.

Keeping this content in files rather than Supabase is deliberate: it stays in
version control, it is reviewable in a diff before it goes live, it needs no
RLS policy, and it renders statically. The Supabase work starts in Phase 5 and
should cover **inquiry submissions only** — `inquiries`, `inquiry_files`,
`inquiry_events`. The Phase 6 admin queue manages submissions, not site content.

---

## Blocking issue

`public/tx4-logo.PNG` is **not present in the project export**, but the header,
mobile nav, footer, and Organization/Article structured data all reference it.
If it is genuinely missing rather than just excluded from the export, every page
is currently rendering a broken logo. See `public/README.md` for the full list
of assets still needed.

---

## Content still needed before these pages can be published

- Which of the five draft capabilities TX4 actually performs, and which are
  self-performed vs. subcontracted
- Two to four representative projects with written permission to publish the
  customer category, location, scope, and outcome
- Project photography TX4 owns or is licensed to use
- Author name and title for any insight article, plus a review date
- Confirmed service territory (currently the generic "Texas")
