import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Download,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { PageHero } from '@/components/page-hero';
import { SectionCta } from '@/components/section-cta';
import { companyData, getVerifiedProcurement } from '@/lib/company-data';
import { getPublishedCapabilities } from '@/lib/capabilities-data';
import { getBreadcrumbSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Government Contracting',
  description:
    'TX4 Contracting procurement information for government contracting officers and prime contractors. View capabilities, company information, and engagement details.',
  openGraph: {
    title: 'Government Contracting | TX4 Contracting',
    description:
      'Procurement information for government contracting officers and prime contractors.',
  },
};

const buyerTypes = [
  {
    icon: <Building2 className="h-5 w-5" />,
    label: 'Federal Agencies',
    description: 'Federal government departments, agencies, and installations.',
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    label: 'State Agencies',
    description:
      'State departments and agencies requiring construction services.',
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    label: 'County & Municipal Government',
    description: 'Local government construction and facility requirements.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    label: 'Prime Contractors',
    description:
      'General and prime contractors seeking teaming partners or subcontractors.',
  },
];

export default function GovernmentContractingPage() {
  const procurement = getVerifiedProcurement();
  const capabilities = getPublishedCapabilities();
  const p = companyData.procurement;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: companyData.website },
    {
      name: 'Government Contracting',
      url: `${companyData.website}/government-contracting`,
    },
  ]);

  const hasDetailedProcurement =
    p.samRegistered ||
    p.uei ||
    p.cageCode ||
    p.primaryNaics ||
    p.naicsCodes.length > 0 ||
    p.pscCodes.length > 0 ||
    p.certifications.length > 0 ||
    p.bondingCapacity ||
    companyData.legalName;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHero
        title="Government Contracting"
        description="TX4 Contracting serves government agencies and prime contractors with coordinated general construction services. This page provides procurement and company information for contracting officers and teaming partners."
        breadcrumbs={[
          { label: 'Government Contracting', href: '/government-contracting' },
        ]}
      />

      {/* Core Capability */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-6">
              Core Capability
            </h2>
            <p className="text-steel-700 leading-relaxed mb-8">
              TX4 Contracting provides coordinated general construction services
              for government and public-sector projects. We manage trades,
              schedules, safety, quality, and documentation through one
              accountable team.
            </p>
            <div className="space-y-3">
              {capabilities.map((cap) => (
                <Link
                  key={cap.slug}
                  href={`/capabilities/${cap.slug}`}
                  className="group flex items-center gap-4 bg-steel-50 border border-steel-200 rounded-lg p-5 hover:border-navy-300 hover:shadow-sm transition-all"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center">
                    <Icon name={cap.icon} className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy-900 group-hover:text-navy-700 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-sm text-steel-600 mt-0.5">
                      {cap.shortDescription}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-steel-400 group-hover:text-navy-700 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Buyers Served */}
      <section className="py-16 sm:py-20 bg-steel-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-8">
              Buyers and Partners We Serve
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {buyerTypes.map((bt) => (
                <div
                  key={bt.label}
                  className="bg-white border border-steel-200 rounded-lg p-6"
                >
                  <div className="w-9 h-9 rounded-lg bg-navy-900 text-white flex items-center justify-center mb-3">
                    {bt.icon}
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-1">
                    {bt.label}
                  </h3>
                  <p className="text-sm text-steel-600 leading-relaxed">
                    {bt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Procurement Information */}
      {hasDetailedProcurement && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-8">
                Procurement Information
              </h2>
              <div className="bg-steel-50 border border-steel-200 rounded-xl overflow-hidden">
                <dl className="divide-y divide-steel-200">
                  {companyData.legalName && (
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-steel-500">
                        Legal Business Name
                      </dt>
                      <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-navy-900 font-medium">
                        {companyData.legalName}
                      </dd>
                    </div>
                  )}
                  {p.samRegistered && (
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-steel-500">
                        SAM Registration
                      </dt>
                      <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-navy-900 font-medium flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        Active
                      </dd>
                    </div>
                  )}
                  {p.uei && (
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-steel-500">
                        UEI
                      </dt>
                      <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-navy-900 font-mono">
                        {p.uei}
                      </dd>
                    </div>
                  )}
                  {p.cageCode && (
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-steel-500">
                        CAGE Code
                      </dt>
                      <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-navy-900 font-mono">
                        {p.cageCode}
                      </dd>
                    </div>
                  )}
                  {p.primaryNaics && (
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-steel-500">
                        Primary NAICS
                      </dt>
                      <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-navy-900 font-mono">
                        {p.primaryNaics}
                      </dd>
                    </div>
                  )}
                  {p.naicsCodes.length > 0 && (
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-steel-500">
                        NAICS Codes
                      </dt>
                      <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-navy-900 font-mono">
                        {p.naicsCodes.join(', ')}
                      </dd>
                    </div>
                  )}
                  {p.pscCodes.length > 0 && (
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-steel-500">
                        PSC Codes
                      </dt>
                      <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-navy-900 font-mono">
                        {p.pscCodes.join(', ')}
                      </dd>
                    </div>
                  )}
                  {p.certifications.length > 0 && (
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-steel-500">
                        Certifications
                      </dt>
                      <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-navy-900">
                        {p.certifications.join(', ')}
                      </dd>
                    </div>
                  )}
                  {p.bondingCapacity && (
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-steel-500">
                        Bonding Capacity
                      </dt>
                      <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-navy-900">
                        {p.bondingCapacity}
                      </dd>
                    </div>
                  )}
                  {companyData.serviceArea && (
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-steel-500">
                        Service Area
                      </dt>
                      <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-navy-900">
                        {companyData.serviceArea}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Capability Statement */}
      {companyData.capabilityStatementUrl && (
        <section className="py-16 sm:py-20 bg-steel-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-14 h-14 rounded-xl bg-navy-900 text-white flex items-center justify-center mx-auto mb-5">
                <FileText className="h-7 w-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-3">
                Capability Statement
              </h2>
              <p className="text-steel-600 mb-6 max-w-lg mx-auto">
                Download our capability statement for a summary of TX4
                Contracting&apos;s qualifications, services, and procurement
                information.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-navy-900 text-white hover:bg-navy-800 font-semibold"
              >
                <a
                  href={companyData.capabilityStatementUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Capability Statement
                </a>
              </Button>
            </div>
          </div>
        </section>
      )}

      <SectionCta
        title="Ready to Engage?"
        description="Contact TX4 Contracting to discuss your project requirements, or explore teaming opportunities with our network of qualified partners."
        primaryLabel="Start a Project"
        primaryHref="/contact"
        secondaryLabel="Explore Teaming"
        secondaryHref="/teaming"
        variant="navy"
      />
    </>
  );
}
