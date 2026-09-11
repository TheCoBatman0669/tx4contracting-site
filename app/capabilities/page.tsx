import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Icon } from '@/components/icon';
import { PageHero } from '@/components/page-hero';
import { SectionCta } from '@/components/section-cta';
import { getPublishedCapabilities } from '@/lib/capabilities-data';
import { companyData } from '@/lib/company-data';
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
} from '@/lib/structured-data';

const published = getPublishedCapabilities();

export const metadata: Metadata = {
  title: 'Capabilities',
  description:
    'TX4 Contracting provides coordinated construction services for government agencies and prime contractors. Review published capabilities and how each is delivered.',
  alternates: {
    canonical: `${companyData.website}/capabilities`,
  },
  openGraph: {
    title: 'Capabilities | TX4 Contracting',
    description:
      'Coordinated construction services for government agencies and prime contractors.',
    url: `${companyData.website}/capabilities`,
  },
};

export default function CapabilitiesPage() {
  const capabilities = getPublishedCapabilities();

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: companyData.website },
    { name: 'Capabilities', url: `${companyData.website}/capabilities` },
  ]);

  const collectionSchema = getCollectionPageSchema({
    name: 'Capabilities',
    description:
      'Construction and project delivery capabilities offered by TX4 Contracting.',
    url: `${companyData.website}/capabilities`,
    items: capabilities.map((c) => ({
      name: c.title,
      url: `${companyData.website}/capabilities/${c.slug}`,
    })),
  });

  // Single capability reads better in one wide column; several read better as a grid.
  const gridClass =
    capabilities.length === 1
      ? 'max-w-2xl mx-auto'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, collectionSchema]),
        }}
      />

      <PageHero
        title="Capabilities"
        description="TX4 Contracting delivers government construction work through clear accountability, organized execution, dependable communication, and performance to project requirements."
        breadcrumbs={[{ label: 'Capabilities', href: '/capabilities' }]}
      />

      {/* Approach */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-6">
              One Team, Coordinated Delivery
            </h2>
            <div className="space-y-4 text-steel-700 leading-relaxed">
              <p>
                Government construction projects require organized coordination
                across trades, schedules, safety requirements, and documentation
                standards. TX4 Contracting manages this coordination through a
                single point of accountability, ensuring that every phase of the
                project is planned, communicated, and executed to specification.
              </p>
              <p>
                Rather than leaving agencies or prime contractors to manage
                multiple independent vendors, TX4 provides one responsible team
                that organizes the resources, communication, and oversight a
                project requires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capability Cards */}
      <section className="py-16 sm:py-20 bg-steel-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
              Published Capabilities
            </h2>
            <p className="mt-3 text-steel-600">
              Current service areas available for government project
              requirements.
            </p>
          </div>

          {capabilities.length > 0 ? (
            <div className={gridClass}>
              {capabilities.map((cap) => (
                <Link
                  key={cap.slug}
                  href={`/capabilities/${cap.slug}`}
                  className="group flex flex-col bg-white border border-steel-200 rounded-xl p-8 hover:border-navy-300 hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 focus-visible:ring-offset-2"
                >
                  <div className="text-navy-700 mb-5">
                    <Icon name={cap.icon} className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-3 group-hover:text-navy-700 transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-steel-600 leading-relaxed mb-4 flex-1">
                    {cap.shortDescription}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 group-hover:text-navy-500 transition-colors">
                    View details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-steel-600 max-w-lg mx-auto">
              Capability details are being finalized. Contact TX4 Contracting to
              discuss a specific project requirement.
            </p>
          )}
        </div>
      </section>

      <SectionCta
        title="Discuss Your Project"
        description="Contact TX4 Contracting to discuss solicitation requirements, statements of work, or upcoming government construction opportunities."
        primaryLabel="Start a Project"
        primaryHref="/contact"
        secondaryLabel="Government Contracting Info"
        secondaryHref="/government-contracting"
        variant="light"
      />
    </>
  );
}
