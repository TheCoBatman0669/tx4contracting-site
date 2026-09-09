import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { SectionCta } from '@/components/section-cta';
import {
  getPublishedInsights,
  formatArticleDate,
} from '@/lib/insights-data';
import { companyData } from '@/lib/company-data';
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
} from '@/lib/structured-data';

const hasInsights = getPublishedInsights().length > 0;

export const metadata: Metadata = {
  title: 'Insights',
  description:
    'Articles from TX4 Contracting on government construction delivery, procurement, and project coordination.',
  alternates: { canonical: `${companyData.website}/insights` },
  // Keep the empty listing out of the index until articles are published.
  robots: hasInsights
    ? { index: true, follow: true }
    : { index: false, follow: true },
  openGraph: {
    title: 'Insights | TX4 Contracting',
    description:
      'Articles on government construction delivery, procurement, and project coordination.',
    url: `${companyData.website}/insights`,
  },
};

export default function InsightsPage() {
  const articles = getPublishedInsights();

  const schemas: Record<string, unknown>[] = [
    getBreadcrumbSchema([
      { name: 'Home', url: companyData.website },
      { name: 'Insights', url: `${companyData.website}/insights` },
    ]),
  ];

  if (articles.length > 0) {
    schemas.push(
      getCollectionPageSchema({
        name: 'Insights',
        description:
          'Articles from TX4 Contracting on government construction delivery and procurement.',
        url: `${companyData.website}/insights`,
        items: articles.map((a) => ({
          name: a.title,
          url: `${companyData.website}/insights/${a.slug}`,
        })),
      })
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      <PageHero
        title="Insights"
        description="Practical notes on government construction delivery, procurement expectations, and how projects stay coordinated."
        breadcrumbs={[{ label: 'Insights', href: '/insights' }]}
      />

      {articles.length > 0 ? (
        <>
          <section className="py-16 sm:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="sr-only">All articles</h2>
                <ul className="divide-y divide-steel-200 border-t border-b border-steel-200">
                  {articles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/insights/${article.slug}`}
                        className="group block py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 focus-visible:ring-offset-2 rounded-sm"
                      >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-sm">
                          <span className="inline-flex items-center rounded-full bg-navy-50 text-navy-800 px-2.5 py-0.5 text-xs font-semibold">
                            {article.category}
                          </span>
                          {article.publishDate && (
                            <time
                              dateTime={article.publishDate}
                              className="text-steel-500"
                            >
                              {formatArticleDate(article.publishDate)}
                            </time>
                          )}
                          {article.readingTimeMinutes > 0 && (
                            <span className="text-steel-500">
                              {article.readingTimeMinutes} min read
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2 group-hover:text-navy-700 transition-colors text-balance">
                          {article.title}
                        </h3>
                        <p className="text-steel-600 leading-relaxed mb-3">
                          {article.summary}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 group-hover:text-navy-500 transition-colors">
                          Read article
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <SectionCta
            title="Have a Project to Discuss?"
            description="Contact TX4 Contracting about a solicitation, statement of work, or upcoming government construction requirement."
            primaryLabel="Start a Project"
            primaryHref="/contact"
            secondaryLabel="View Capabilities"
            secondaryHref="/capabilities"
            variant="light"
          />
        </>
      ) : (
        <section className="py-20 sm:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 rounded-xl bg-steel-100 text-steel-500 flex items-center justify-center mx-auto mb-6">
                <Newspaper className="h-8 w-8" aria-hidden="true" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-4">
                Articles Coming Soon
              </h2>
              <p className="text-steel-600 leading-relaxed mb-8 max-w-lg mx-auto">
                TX4 Contracting is preparing articles on government construction
                delivery and procurement. In the meantime, our capability pages
                cover how projects are coordinated and documented.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-navy-900 text-white hover:bg-navy-800 font-semibold text-base px-8 h-12"
              >
                <Link href="/capabilities">
                  View Capabilities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
