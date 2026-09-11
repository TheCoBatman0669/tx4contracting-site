import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { SectionCta } from '@/components/section-cta';
import {
  getInsightBySlug,
  getPublishedInsights,
  getRelatedInsights,
  formatArticleDate,
} from '@/lib/insights-data';
import type { Capability } from '@/lib/capabilities-data';
import { getCapabilityBySlug } from '@/lib/capabilities-data';
import { companyData } from '@/lib/company-data';
import {
  getArticleSchema,
  getBreadcrumbSchema,
} from '@/lib/structured-data';

export function generateStaticParams() {
  return getPublishedInsights().map((i) => ({ slug: i.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const article = getInsightBySlug(params.slug);
  if (!article) {
    return { title: 'Article Not Found', robots: { index: false, follow: true } };
  }

  const url = `${companyData.website}/insights/${article.slug}`;

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.summary,
      url,
      type: 'article',
      publishedTime: article.publishDate || undefined,
      modifiedTime: article.reviewDate || undefined,
    },
  };
}

export default function InsightPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = getInsightBySlug(params.slug);
  if (!article) notFound();

  const url = `${companyData.website}/insights/${article.slug}`;
  const related = getRelatedInsights(article);
  const capabilities = article.relatedCapabilities
    .map((slug) => getCapabilityBySlug(slug))
    .filter((c): c is Capability => c !== null);

  const schemas = [
    getArticleSchema({
      headline: article.title,
      description: article.summary,
      url,
      author: article.author,
      publishDate: article.publishDate,
      reviewDate: article.reviewDate,
      section: article.category,
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: companyData.website },
      { name: 'Insights', url: `${companyData.website}/insights` },
      { name: article.title, url },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      <PageHero
        title={article.title}
        breadcrumbs={[
          { label: 'Insights', href: '/insights' },
          { label: article.category, href: '/insights' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-steel-300">
          <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
            {article.category}
          </span>
          {article.author && (
            <span>
              By {article.author}
              {article.authorTitle ? `, ${article.authorTitle}` : ''}
            </span>
          )}
          {article.publishDate && (
            <time dateTime={article.publishDate}>
              Published {formatArticleDate(article.publishDate)}
            </time>
          )}
          {article.readingTimeMinutes > 0 && (
            <span>{article.readingTimeMinutes} min read</span>
          )}
        </div>
      </PageHero>

      <article className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Answer-first summary */}
            {article.keyAnswer && (
              <p className="text-lg sm:text-xl text-navy-900 font-medium leading-relaxed border-l-4 border-navy-900 pl-5 mb-12">
                {article.keyAnswer}
              </p>
            )}

            <div className="space-y-12">
              {article.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-bold text-navy-900 tracking-tight mb-4">
                    {section.heading}
                  </h2>
                  <div className="space-y-4 text-steel-700 leading-relaxed">
                    {section.body.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-3 text-steel-700"
                        >
                          <span
                            className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-navy-700"
                            aria-hidden="true"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {article.reviewDate && (
              <p className="mt-14 pt-6 border-t border-steel-200 text-sm text-steel-500">
                Last reviewed{' '}
                <time dateTime={article.reviewDate}>
                  {formatArticleDate(article.reviewDate)}
                </time>
                .
              </p>
            )}
          </div>
        </div>
      </article>

      {/* Internal linking */}
      {(capabilities.length > 0 || related.length > 0) && (
        <section className="py-16 sm:py-20 bg-steel-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-10">
              {capabilities.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 tracking-tight mb-5">
                    Related Capabilities
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {capabilities.map((cap) => (
                      <Link
                        key={cap.slug}
                        href={`/capabilities/${cap.slug}`}
                        className="group flex items-center justify-between gap-4 bg-white border border-steel-200 rounded-lg p-5 hover:border-navy-300 hover:shadow-sm transition-all"
                      >
                        <span className="font-semibold text-navy-900 group-hover:text-navy-700 transition-colors">
                          {cap.title}
                        </span>
                        <ArrowRight className="h-4 w-4 text-steel-400 group-hover:text-navy-700 transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {related.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 tracking-tight mb-5">
                    More Insights
                  </h2>
                  <ul className="space-y-3">
                    {related.map((rel) => (
                      <li key={rel.slug}>
                        <Link
                          href={`/insights/${rel.slug}`}
                          className="group flex items-center justify-between gap-4 bg-white border border-steel-200 rounded-lg p-5 hover:border-navy-300 hover:shadow-sm transition-all"
                        >
                          <span className="font-medium text-navy-900 group-hover:text-navy-700 transition-colors">
                            {rel.title}
                          </span>
                          <ArrowRight className="h-4 w-4 text-steel-400 group-hover:text-navy-700 transition-colors shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="bg-white pt-16 sm:pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Button
              asChild
              variant="outline"
              className="border-navy-300 text-navy-900 hover:bg-navy-50"
            >
              <Link href="/insights">Back to all insights</Link>
            </Button>
          </div>
        </div>
      </div>

      <SectionCta
        title="Discuss Your Project"
        description="Contact TX4 Contracting about a solicitation, statement of work, or upcoming government construction requirement."
        primaryLabel="Start a Project"
        primaryHref="/contact"
        secondaryLabel="Explore Teaming"
        secondaryHref="/teaming"
        variant="navy"
      />
    </>
  );
}
