/**
 * Insights (articles) content model.
 *
 * /insights and /insights/[slug] render entirely from this file. Nothing is
 * published yet: the single entry below is a working template so the layout
 * can be reviewed. Set `published: true` only after TX4 has confirmed the
 * author, the claims, and the review date.
 *
 * Author and review dates feed the Article structured data, so keep them
 * accurate rather than approximate.
 */

export interface InsightSection {
  heading: string;
  /** Each string renders as its own paragraph */
  body: string[];
  /** Optional bulleted list rendered after the paragraphs */
  bullets?: string[];
}

export interface Insight {
  slug: string;
  title: string;
  /** Listing card copy and meta description fallback */
  summary: string;
  category: string;
  author: string;
  authorTitle: string;
  /** ISO date, YYYY-MM-DD */
  publishDate: string;
  /** ISO date of the most recent content review, YYYY-MM-DD */
  reviewDate: string;
  readingTimeMinutes: number;
  /** Answer-first opening paragraph shown above the body */
  keyAnswer: string;
  sections: InsightSection[];
  /** Capability slugs referenced by the article, for internal linking */
  relatedCapabilities: string[];
  published: boolean;
}

export const insights: Insight[] = [
  {
    slug: 'what-agencies-should-expect-from-a-general-contractor',
    title:
      'What Government Agencies Should Expect From a General Contractor',
    summary:
      'Coordination, documentation, and communication standards a public-sector buyer should be able to expect on a construction project.',
    category: 'Project Delivery',
    author: '',
    authorTitle: '',
    publishDate: '',
    reviewDate: '',
    readingTimeMinutes: 4,
    keyAnswer:
      'A government agency should expect a general contractor to provide a single accountable point of contact, a documented schedule, verified safety coordination, and a complete project record at closeout.',
    sections: [
      {
        heading: 'One Point of Accountability',
        body: [
          'The clearest signal of a well-run project is that the agency has one contact who can answer for the whole scope. When responsibility is split across vendors, schedule and quality questions take longer to resolve because nobody owns the full picture.',
        ],
      },
      {
        heading: 'A Schedule That Is Maintained, Not Just Submitted',
        body: [
          'A schedule submitted once at award and never updated is a formality. A maintained schedule shows sequence, dependencies, and the current status of each activity, and it gets revised when conditions change.',
        ],
      },
      {
        heading: 'Documentation Built During the Work',
        body: [
          'Daily reports, submittals, inspection records, and photographs assembled as the work happens produce a defensible project file. Assembled afterward, they produce gaps.',
        ],
        bullets: [
          'Daily reports covering labor, activities, and conditions',
          'Submittals tracked against the specification',
          'Inspection and test records filed as they are completed',
          'Photographic record of concealed and completed work',
        ],
      },
    ],
    relatedCapabilities: ['general-construction'],
    published: false,
  },
];

export function getPublishedInsights(): Insight[] {
  return insights
    .filter((i) => i.published)
    .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1));
}

export function getInsightBySlug(slug: string): Insight | null {
  return insights.find((i) => i.slug === slug && i.published) ?? null;
}

export function getInsightCategories(): string[] {
  return Array.from(
    new Set(getPublishedInsights().map((i) => i.category))
  ).sort((a, b) => a.localeCompare(b));
}

export function getRelatedInsights(insight: Insight, limit = 3): Insight[] {
  return getPublishedInsights()
    .filter((i) => i.slug !== insight.slug)
    .filter(
      (i) =>
        i.category === insight.category ||
        i.relatedCapabilities.some((c) =>
          insight.relatedCapabilities.includes(c)
        )
    )
    .slice(0, limit);
}

export function getInsightsForCapability(
  capabilitySlug: string,
  limit = 3
): Insight[] {
  return getPublishedInsights()
    .filter((i) => i.relatedCapabilities.includes(capabilitySlug))
    .slice(0, limit);
}

export function formatArticleDate(date: string): string {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
