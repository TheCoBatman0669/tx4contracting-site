import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Handshake,
  HardHat,
  Truck,
  Wrench,
  Building2,
  FileText,
  MapPin,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { SectionCta } from '@/components/section-cta';
import { companyData } from '@/lib/company-data';
import { getBreadcrumbSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Team With TX4',
  description:
    'Partner with TX4 Contracting as a subcontractor, supplier, vendor, or teaming partner on government construction projects.',
  openGraph: {
    title: 'Team With TX4 | TX4 Contracting',
    description:
      'Partner with TX4 Contracting on government construction projects.',
  },
};

const partnerTypes = [
  {
    icon: <HardHat className="h-5 w-5" />,
    title: 'Subcontractors',
    description:
      'Trade contractors and specialty subcontractors with government project experience or interest.',
  },
  {
    icon: <Wrench className="h-5 w-5" />,
    title: 'Specialty Contractors',
    description:
      'Firms providing specialized construction services such as electrical, mechanical, environmental, or demolition.',
  },
  {
    icon: <Truck className="h-5 w-5" />,
    title: 'Suppliers & Vendors',
    description:
      'Material suppliers and equipment vendors supporting construction project requirements.',
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: 'Prime Contractors',
    description:
      'General and prime contractors exploring teaming arrangements for government solicitations.',
  },
];

const expectations = [
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: 'Company Information',
    description:
      'Company name, contact details, website, and a brief description of your firm and its experience.',
  },
  {
    icon: <Wrench className="h-5 w-5" />,
    title: 'Capabilities & Trades',
    description:
      'The types of work your company performs, including any specialty services or equipment capabilities.',
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Service Territory',
    description:
      'Geographic areas where your company can perform work or deliver materials.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Certifications & NAICS',
    description:
      'Relevant NAICS codes, small-business certifications, and any government registrations your firm holds.',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Capability Statement',
    description:
      'A current capability statement or company profile document summarizing your qualifications.',
  },
];

export default function TeamingPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: companyData.website },
    { name: 'Teaming', url: `${companyData.website}/teaming` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHero
        title="Team With TX4"
        description="TX4 Contracting builds relationships with qualified subcontractors, suppliers, vendors, and teaming partners to strengthen government-project delivery."
        breadcrumbs={[{ label: 'Teaming', href: '/teaming' }]}
      />

      {/* Introduction */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-6">
              Stronger Together
            </h2>
            <div className="space-y-4 text-steel-700 leading-relaxed">
              <p>
                Government construction projects require coordination across
                multiple trades, materials, and specialties. TX4 Contracting
                partners with qualified firms that share a commitment to
                organized execution, clear communication, and dependable
                project delivery.
              </p>
              <p>
                We are interested in connecting with companies that can
                contribute to government project requirements through quality
                workmanship, reliable scheduling, and professional
                documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Connect */}
      <section className="py-16 sm:py-20 bg-steel-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-8">
              Who Should Connect
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {partnerTypes.map((pt) => (
                <div
                  key={pt.title}
                  className="bg-white border border-steel-200 rounded-lg p-6"
                >
                  <div className="w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center mb-3">
                    {pt.icon}
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-1">
                    {pt.title}
                  </h3>
                  <p className="text-sm text-steel-600 leading-relaxed">
                    {pt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Look For */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-3">
              What to Share
            </h2>
            <p className="text-steel-600 mb-8">
              When reaching out, the following information helps TX4 understand
              how we might work together on government projects.
            </p>
            <div className="space-y-5">
              {expectations.map((exp) => (
                <div key={exp.title} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-steel-100 text-navy-700 flex items-center justify-center">
                    {exp.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-0.5">
                      {exp.title}
                    </h3>
                    <p className="text-sm text-steel-600 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionCta
        title="Connect With TX4"
        description="Share your capabilities, territory, and capability statement so we can contact you when a matching scope comes up."
        primaryLabel="Team With TX4"
        primaryHref="/teaming/apply"
        secondaryLabel="View Capabilities"
        secondaryHref="/capabilities"
        variant="navy"
      />
    </>
  );
}
