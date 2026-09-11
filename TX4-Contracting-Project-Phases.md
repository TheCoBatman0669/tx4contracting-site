# TX4 Contracting — Government Contracting Website Project Phases

## Current Project State

The project is a blank Next.js starter with Tailwind CSS and the shadcn/ui component library already installed. The homepage is empty placeholder text. Supabase connection details are present, but no database has been created yet. The site is configured to deploy on Netlify. Everything needs to be built from scratch.

---

## Phase 1: Brand System and Core Layout

**Purpose:** Establish the TX4 visual identity and the reusable shell every page will share.

- Remap the color palette throughout the design system to the TX4 navy (`#031C36`), secondary navy (`#092746`), white, light background (`#F1F5F8`), and a muted steel blue for secondary text and borders, removing all default gray theming.
- Set up a centralized company-data configuration file where all business facts—name, phone, email, address, SAM status, UEI, CAGE code, NAICS codes, certifications, and service area—live in one place so the entire site reads from it. Empty fields are hidden automatically.
- Place the TX4 Contracting logo in optimized formats for the header and hero, include it in the footer, and generate a favicon from the TX4 mark.
- Build a sticky site header that starts full-size and shrinks after scrolling, containing the logo, navigation links (Capabilities, Projects, Government Contracting, Teaming, About, and Contact), and a prominent “Start a Project” button.
- Build a site footer with the logo, legal business name, contact information, verified procurement identifiers, page links, privacy and accessibility links, and social profiles—all reading from the central configuration.
- Choose a professional, highly readable font pairing appropriate for a government-services website.

**Completion criteria:** Every page inherits the TX4 branding, header, and footer. Changing a phone number or CAGE code in one place updates it everywhere.

---

## Phase 2: Homepage

**Purpose:** Give visitors an immediate understanding of TX4 within roughly 30 seconds, with clear paths to take action.

- **Hero section:** Government-focused headline, supporting paragraph, “View Capabilities” and “Start a Project” buttons, an optional “Download Capability Statement” text link, and a strong background image area (placeholder until real photography is provided).
- **Procurement credibility bar:** A compact horizontal strip showing SAM status, UEI, CAGE code, primary NAICS, business classifications, and service area—all conditionally hidden if not yet verified.
- **Capabilities preview:** Four to six outcome-focused cards, rather than trade names, linking to full capability pages.
- **Why TX4 section:** Differentiators such as single-point accountability, coordinated delivery, rapid mobilization, safety, and quality controls—marked as draft until confirmed.
- **Past performance preview:** Two to four representative project cards showing project type, customer category, location, scope, role, and outcome.
- **Markets served:** A visual grid of served markets, such as Federal, State, County/Municipal, Prime Contractors, Public Infrastructure, and Emergency Response.
- **Teaming call to action:** An invitation for primes, subcontractors, suppliers, and specialty firms to partner.
- **Final inquiry section:** A short, motivating statement with a button leading to the contact form.

**Completion criteria:** The homepage is fully responsive, all sections render from centralized data, and placeholder content is clearly labeled as draft.

---

## Phase 3: Public Content Pages

**Purpose:** Build out every route in the site map with proper content structure and navigation.

- `/capabilities` — Overview page with all capability cards in a grid, each linking to its detail page.
- `/capabilities/[slug]` — Individual capability pages built from a data-driven template: what TX4 provides, who benefits, where it applies, types of projects, how safety and quality are managed, and a call to action. Only pages for confirmed services will be published.
- `/government-contracting` — Procurement-focused page displaying verified identifiers, business classifications, contract vehicles, NAICS/PSC codes, bonding and insurance information, and a capability-statement download.
- `/projects` — Grid or list of representative projects with filtering by type, market, and location.
- `/projects/[slug]` — Individual project case studies with scope, role, location, outcome, and any available photography.
- `/teaming` — Page explaining partnership opportunities for primes, subcontractors, suppliers, and vendors, with a direct link to the “Team With TX4” form.
- `/about` — Company overview, mission, leadership (when confirmed), and a brief history.
- `/insights` — Article listing page with date, title, summary, and category.
- `/insights/[slug]` — Full article pages with author, publication date, review date, and proper heading structure.
- `/contact` — Houses the Project Inquiry form as the primary experience.
- `/privacy` — Privacy policy page.
- `/accessibility` — Accessibility commitment page.
- Custom 404 page with helpful navigation links.

**Completion criteria:** Every route loads with the correct layout, breadcrumbs, and navigation. Capability and project pages are generated from structured data so new entries do not require layout changes.

---

## Phase 4: Submission Forms

**Purpose:** Give government buyers, prime contractors, and potential partners a clear way to reach TX4—securely and accessibly.

- **Form A: Project or Contract Inquiry:** Conditional fields based on inquiry type (government buyer, prime contractor, or other). Fields include contact details, organization, solicitation/contract number, relevant capability, project location, deadline, estimated value range (optional), scope summary, file attachments, and consent.
- **Form B: Team With TX4:** Fields for company information, partner type, capabilities, territory, NAICS codes, certifications, bonding capacity, description, capability-statement upload, and consent.
- Both forms will include Cloudflare Turnstile for bot protection using an invisible challenge.
- Add a honeypot field to both forms as an additional spam layer.
- Provide client-side validation with clear, accessible error messages and proper form labels.
- Use mobile-friendly, logical field grouping with conditional sections that hide irrelevant questions.
- After successful submission, show a confirmation screen with a reference number and a summary of what to expect next.

**Completion criteria:** Both forms work on all screen sizes, validate correctly, show clear errors, and prevent submission without consent. Turnstile and honeypot protection are in place.

---

## Phase 5: Database, Security, and Server-Side Submission Handling

**Purpose:** Store inquiries safely, keep attachments private, and prevent abuse—all enforced on the server without relying on the browser alone.

### Supabase Database

Create the following tables:

- `inquiries` — UUID, inquiry type, status (`New`, `Reviewing`, `Qualified`, `Responded`, `Closed`, or `Spam`), contact and organization fields, capability selections, deadline, summary, consent timestamp, source page, referrer, UTM values, created and reviewed timestamps, and assigned administrator.
- `inquiry_files` — Linked inquiry ID, private storage path, original filename, MIME type, file size, and creation timestamp.
- `inquiry_events` — Audit trail for submission receipt, status changes, assignments, file actions, and administrator notes.

### Security and Processing

- Apply row-level security to every table. Anonymous users cannot `SELECT`, `UPDATE`, or `DELETE` submissions. Public submissions will not use direct database inserts from the browser.
- Build a Supabase Edge Function for submission processing that:
  - Revalidates every field.
  - Verifies Cloudflare Turnstile server-side.
  - Checks the production hostname.
  - Enforces rate limiting and payload-size limits.
  - Checks the honeypot.
  - Generates a reference number.
  - Inserts the inquiry and logs the submission event.
  - Handles file uploads to a **private** Supabase Storage bucket with restricted file types, size limits, and sanitized filenames.
  - Sends a confirmation email to the submitter.
  - Sends a notification email to the designated TX4 inbox.
  - Returns a generic error message on failure without exposing database details.
- Enforce column-level security so status, assignment, and audit columns are not writable by the public or authenticated non-administrator users.
- Use a private storage bucket. Attachments are served only through short-lived signed URLs for authorized administrator downloads.
- Add idempotency protection to prevent duplicate submissions caused by double-clicks or retries.

**Completion criteria:** Submissions are securely stored, attachments are private, the public cannot read or modify submissions, and all validation happens server-side. RLS tests confirm deny-by-default behavior.

---

## Phase 6: Protected Admin Queue

**Purpose:** Give authorized TX4 administrators a simple internal tool to manage incoming inquiries.

- Use Supabase email/password authentication for administrator access only.
- Create an `/admin/inquiries` page behind a login wall.
- Build a dashboard showing the new-submission count and a sortable, filterable list of all inquiries.
- Add filters for inquiry type, status, capability, and date range.
- Add search by organization name, contact name, or reference number.
- Create a detail view showing the complete submission, file attachments downloadable through signed URLs, and the complete event history.
- Allow administrators to change status, assign an inquiry to an administrator, and add private internal notes.
- Add CSV export for selected or filtered submissions.
- Record every administrator action in the audit trail.

**Completion criteria:** An authorized administrator can log in, view and manage every submission, download attachments securely, and export data. No administrator features are accessible to unauthenticated visitors.

---

## Phase 7: SEO, GEO, and Search Optimization

**Purpose:** Make the site highly visible to both traditional search engines and AI-powered search tools.

- **Per-page metadata:** Unique title, meta description, canonical URL, Open Graph tags, and social-sharing image for every public page.
- **Heading structure:** One clear H1 per page with a logical H2/H3 hierarchy throughout.
- **Structured data (JSON-LD):**
  - `Organization` on the homepage and About page, using the verified name, logo, phone, email, address, service area, and social profiles.
  - `Service` on each capability page.
  - `BreadcrumbList` on all interior pages.
  - `Article` with author and dates on insight pages.
  - A `LocalBusiness` subtype only if TX4 has a confirmed, eligible physical location.
- **Sitemap and robots:** Auto-generated `sitemap.xml` and `robots.txt` allowing all major search and AI bots, including Googlebot, Bingbot, PerplexityBot, ChatGPT-User, ClaudeBot, and GPTBot.
- **GEO content optimization:** Each capability page uses an answer-first format with clear questions and direct answers, includes relevant government-contracting terminology, and avoids keyword stuffing.
- **Image optimization:** Descriptive alt text on all images, WebP/AVIF formats where supported, and properly sized assets.
- **Internal linking:** Every capability, project, and insight page links to related content.
- **Redirect plan:** Prepare for future URL changes.
- Make the site verification-ready for Google Search Console and Bing Webmaster Tools after deployment.

**Completion criteria:** Every public page passes structured-data validation, has complete metadata, and is fully crawlable. AI bots are not blocked.

---

## Phase 8: Analytics

**Purpose:** Track visitor engagement without compromising privacy.

- Use privacy-conscious analytics to track:
  - “Start a Project” button clicks.
  - Capability page visits.
  - Capability-statement downloads.
  - Form starts for project inquiries and teaming.
  - Successful submissions, tracked only after server confirmation.
  - Phone and email link clicks.
- Never send personal information—such as names, emails, phone numbers, scope details, or filenames—to analytics.
- Capture UTM parameters on form submissions for lead-source reporting.

**Completion criteria:** Key conversion events are tracked accurately, and no personal data leaks into analytics.

---

## Phase 9: Accessibility, Performance, and Cross-Device Testing

**Purpose:** Ensure the site is fast, usable by everyone, and works on all devices.

- **Accessibility:** Use semantic HTML, keyboard navigation for all interactive elements, visible focus states, proper form labels and error announcements, WCAG AA color contrast, and reduced-motion support for users who prefer it.
- **Performance targets:** Largest Contentful Paint under 2.5 seconds, Cumulative Layout Shift under 0.1, Interaction to Next Paint under 200 milliseconds, and Lighthouse scores near 90–95 or higher.
- **Image handling:** Lazy-load below-the-fold images, never lazy-load the hero or primary content, and serve optimized formats.
- **Responsive testing:** Verify all pages and forms on phones, tablets, and desktops.
- **No unnecessary weight:** Avoid third-party scripts, autoplay video, excessive animations, or JavaScript that blocks content rendering.

**Completion criteria:** Lighthouse audits pass with high scores across performance, accessibility, best practices, and SEO. All pages are usable on mobile devices.

---

## Phase 10: Production-Readiness Checklist

**Purpose:** Conduct the final review before the site goes live.

- [ ] All placeholder and draft content is replaced with confirmed facts or hidden.
- [ ] No “TBD” procurement identifiers are visible.
- [ ] No unverified services, certifications, statistics, or customer names are published.
- [ ] No government seals or implied government endorsement are used.
- [ ] The privacy policy and accessibility statement are in place.
- [ ] Supabase RLS policies are tested and deny-by-default behavior is confirmed.
- [ ] The Edge Function submission endpoint is secured and rate-limited.
- [ ] Cloudflare Turnstile is active on both forms.
- [ ] Administrator login works and the inquiry queue is functional.
- [ ] The favicon and social-sharing images are correct.
- [ ] DNS and the `tx4contracting.com` domain are configured.
- [ ] The Netlify deployment builds and runs without errors.
- [ ] Google Search Console and Bing Webmaster Tools verification tags are added.

**Completion criteria:** The site is safe to make public. Every claim is verified, every submission path is secure, and the administrator team can manage inquiries from day one.

---

## Content Required Before Launch

TX4 must confirm and provide the following before the site goes live:

- Legal company name.
- Public phone number and email address.
- Physical or mailing address.
- Confirmed service territory.
- Confirmed list of services, including which are self-performed and which are subcontracted.
- Leadership names and titles.
- Real project photographs.
- Representative past-performance projects with permission to publish.
- SAM registration status, UEI, and CAGE code.
- NAICS and PSC codes.
- Certifications and business classifications.
- Bonding and insurance information.
- Safety program details.
- Capability statement document for download.
- Internal email address for submission notifications.
- List of authorized site administrators with their email addresses for login.

---

## Questions Before Starting

1. **Is the TX4 Contracting logo file available?** The actual image file is needed to extract exact colors and place the logo throughout the site. Without it, use the approximate navy palette above and a text-based placeholder.
2. **Which capabilities should be published at launch?** The plan identifies six possible categories: general construction, civil/sitework, facility repair, logistics/procurement, emergency response, and specialty support. Confirm which services TX4 performs and whether any categories should be added or renamed.
3. **Is a Cloudflare account available for Turnstile?** If not, plan for an alternative bot-protection approach.

---

This ten-phase plan covers every page, form, database table, security layer, search-optimization step, and accessibility requirement described in the project brief. The website will be sleek and professional, business claims will be verified before publication, submissions will be securely stored and manageable by the administrator team, and the content will be structured for visibility in both traditional and AI-powered search.
