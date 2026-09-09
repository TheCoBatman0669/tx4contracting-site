import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { PageHero } from '@/components/page-hero';
import { SectionCta } from '@/components/section-cta';
import {
  getCapabilityBySlug,
  getPublishedCapabilities,
  getRelatedCapabilities,
} from '@/lib/capabilities-data';
import { getProjectsForCapability } from '@/lib/projects-data';
import { getInsightsForCapability } from '@/lib/insights-data';
import { companyData } from '@/lib/company-data';
import {
  getServiceSchema,
  getBreadcrumbSchema,
  getFaqSchema,
} from '@/lib/structured-data';

export function generateStaticParams() {
  return getPublishedCapabilities().map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const cap = getCapabilityBySlug(params.slug);
  if (!cap) {
    return { title: 'Capability Not Found', robots: { index: false, follow: true } };
  }

  const url = `${companyData.website}/capabilities/${cap.slug}`;

  return {
    title: cap.metaTitle || cap.title,
    description: cap.metaDescription || cap.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${cap.title} | TX4 Contracting`,
      description: cap.metaDescription || cap.shortDescription,
      url,
    },
  };
}

export default function CapabilityPage({
  params,
}: {
  params: { slug: string };
}) {
  const cap = getCapabilityBySlug(params.slug);
  if (!cap) notFound();

  const url = `${companyData.website}/capabilities/${cap.slug}`;
  const related = getRelatedCapabilities(cap);
  const relatedProjects = getProjectsForCapability(cap.slug);
  const relatedInsights = getInsightsForCapability(cap.slug);

  const schemas: Record<string, unknown>[] = [
    getServiceSchema(
      `${cap.title} - ${companyData.name}`,
      cap.shortDescription,
      url
    ),
    getBreadcrumbSchema([
      { name: 'Home', url: companyData.website },
      { name: 'Capabilities', url: `${companyData.website}/capabilities` },
      { name: cap.title, url },
    ]),
  ];

  if (cap.faqs.length > 0) {
    schemas.push(getFaqSchema(cap.faqs));
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      <PageHero
        title={cap.heroTitle}
        description={cap.heroDescription}
        breadcrumbs={[
          { label: 'Capabilities', href: '/capabilities' },
          { label: cap.title, href: `/capabilities/${cap.slug}` },
        ]}
      >
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Button
            asChild
            size="lg"
            className="bg-white text-navy-900 hover:bg-steel-100 font-semibold text-base px-8 h-12"
          >
            <Link href="/contact">
              Start a Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-steel-500 text-white hover:bg-white/10 font-semibold text-base px-8 h-12"
          >
            <Link href="/government-contracting">
              Government Contracting Info
            </Link>
          </Button>
        </div>
      </PageHero>

      {/* What TX4 provides */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-6">
              {cap.overviewHeading}
            </h2>
            <div className="space-y-4 text-steel-700 leading-relaxed">
              {cap.overview.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it is delivered */}
      {cap.deliveryAreas.length > 0 && (
        <section className="py-16 sm:py-20 bg-steel-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-4">
                {cap.deliveryHeading}
              </h2>
              <p className="text-steel-600">{cap.deliveryIntro}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {cap.deliveryAreas.map((area) => (
                <div
                  key={area.title}
                  className="flex gap-4 bg-white rounded-lg border border-steel-100 p-6"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center">
                    <Icon name={area.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">
                      {area.title}
                    </h3>
                    <p className="text-sm text-steel-600 leading-relaxed">
                      {area.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Where it applies */}
      {cap.projectTypes.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-3">
                {cap.projectTypesHeading}
              </h2>
              <p className="text-steel-600 mb-8">{cap.projectTypesIntro}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {cap.projectTypes.map((type) => (
                  <li key={type} className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-navy-900 text-white flex items-center justify-center">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span className="text-steel-700">{type}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Who benefits */}
      {cap.audiences.length > 0 && (
        <section className="py-16 sm:py-20 bg-steel-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-8">
                Who TX4 Serves
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {cap.audiences.map((aud) => (
                  <div
                    key={aud.label}
                    className="bg-white border border-steel-200 rounded-lg p-6"
                  >
                    <h3 className="font-semibold text-navy-900 mb-2">
                      {aud.label}
                    </h3>
                    <p className="text-sm text-steel-600 leading-relaxed">
                      {aud.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Safety and quality */}
      {cap.safetyQuality.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-3">
                How Safety and Quality Are Managed
              </h2>
              <p className="text-steel-600 mb-8">
                Safety and quality are handled as ongoing coordination
                activities, not a closeout checklist.
              </p>
              <div className="space-y-5">
                {cap.safetyQuality.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-steel-100 text-navy-700 flex items-center justify-center">
                      <Icon name={item.icon} className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-0.5">
                        {item.title}
                      </h3>
                      <p className="text-sm text-steel-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Engagement process */}
      {cap.processSteps.length > 0 && (
        <section className="py-16 sm:py-20 bg-steel-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-8">
                How Engagement Works
              </h2>
              <ol className="space-y-6">
                {cap.processSteps.map((step) => (
                  <li key={step.step} className="flex gap-5">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <div className="pt-1.5">
                      <h3 className="font-semibold text-navy-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-steel-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* Answer-first FAQ */}
      {cap.faqs.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-8">
                Common Questions
              </h2>
              <dl className="divide-y divide-steel-200 border-t border-b border-steel-200">
                {cap.faqs.map((faq) => (
                  <div key={faq.question} className="py-6">
                    <dt className="font-semibold text-navy-900 mb-2">
                      {faq.question}
                    </dt>
                    <dd className="text-steel-700 leading-relaxed">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}

      {/* Internal linking */}
      {(related.length > 0 ||
        relatedProjects.length > 0 ||
        relatedInsights.length > 0) && (
        <section className="py-16 sm:py-20 bg-steel-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-10">
              {related.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 tracking-tight mb-5">
                    Related Capabilities
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {related.map((rel) => (
                      <Link
                        key={rel.slug}
                        href={`/capabilities/${rel.slug}`}
                        className="group flex items-center gap-4 bg-white border border-steel-200 rounded-lg p-5 hover:border-navy-300 hover:shadow-sm transition-all"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center">
                          <Icon name={rel.icon} className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-navy-900 group-hover:text-navy-700 transition-colors">
                          {rel.title}
                        </span>
                        <ArrowRight className="ml-auto h-4 w-4 text-steel-400 group-hover:text-navy-700 transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedProjects.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 tracking-tight mb-5">
                    Related Past Performance
                  </h2>
                  <ul className="space-y-3">
                    {relatedProjects.map((project) => (
                      <li key={project.slug}>
                        <Link
                          href={`/projects/${project.slug}`}
                          className="group flex items-center justify-between gap-4 bg-white border border-steel-200 rounded-lg p-5 hover:border-navy-300 hover:shadow-sm transition-all"
                        >
                          <span>
                            <span className="block font-semibold text-navy-900 group-hover:text-navy-700 transition-colors">
                              {project.name}
                            </span>
                            <span className="block text-sm text-steel-600">
                              {project.market} &middot; {project.location}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-steel-400 group-hover:text-navy-700 transition-colors shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {relatedInsights.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 tracking-tight mb-5">
                    Related Insights
                  </h2>
                  <ul className="space-y-3">
                    {relatedInsights.map((insight) => (
                      <li key={insight.slug}>
                        <Link
                          href={`/insights/${insight.slug}`}
                          className="group flex items-center justify-between gap-4 bg-white border border-steel-200 rounded-lg p-5 hover:border-navy-300 hover:shadow-sm transition-all"
                        >
                          <span className="font-medium text-navy-900 group-hover:text-navy-700 transition-colors">
                            {insight.title}
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

      <SectionCta
        title="Discuss Your Project"
        description="Contact TX4 to discuss solicitation requirements, statements of work, construction opportunities, prime-contractor teaming, or upcoming public-sector projects."
        primaryLabel="Start a Project"
        primaryHref="/contact"
        secondaryLabel="Explore Teaming"
        secondaryHref="/teaming"
        variant="navy"
      />
    </>
  );
}
