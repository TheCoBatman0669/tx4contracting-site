import type { Metadata } from 'next';
import {
  Shield,
  Users,
  ClipboardList,
  MessageSquare,
  Target,
  Building2,
} from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { SectionCta } from '@/components/section-cta';
import { companyData } from '@/lib/company-data';
import { getOrganizationSchema, getBreadcrumbSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'About',
  description:
    'TX4 Contracting is a government contracting firm providing coordinated general construction services for federal, state, and local agencies.',
  openGraph: {
    title: 'About | TX4 Contracting',
    description:
      'Government contracting firm providing coordinated general construction services.',
  },
};

const principles = [
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Single-Point Accountability',
    description:
      'One team takes responsibility for organizing and delivering the entire scope of work.',
  },
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: 'Organized Execution',
    description:
      'Structured planning, scheduling, and coordination across every project phase.',
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: 'Clear Communication',
    description:
      'Consistent, proactive communication with clients, partners, and project stakeholders.',
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: 'Work to Specification',
    description:
      'Delivering to project requirements, safety standards, and documentation expectations.',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Qualified Partnerships',
    description:
      'Building relationships with dependable trades, suppliers, and specialty firms.',
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: 'Government Focus',
    description:
      'Understanding the procurement, compliance, and documentation standards government work demands.',
  },
];

export default function AboutPage() {
  const orgSchema = getOrganizationSchema();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: companyData.website },
    { name: 'About', url: `${companyData.website}/about` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([orgSchema, breadcrumbSchema]),
        }}
      />

      <PageHero
        title="About TX4 Contracting"
        description="A government contracting firm built around one principle: clear accountability produces dependable results."
        breadcrumbs={[{ label: 'About', href: '/about' }]}
      />

      {/* Who We Are */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-6">
              Who We Are
            </h2>
            <div className="space-y-4 text-steel-700 leading-relaxed">
              <p>
                TX4 Contracting provides coordinated general construction
                services for government agencies and prime contractors. We serve
                as a single point of accountability for projects that require
                organized execution across multiple trades, schedules, safety
                requirements, and documentation standards.
              </p>
              <p>
                Our focus is on government and public-sector work, where clear
                communication, reliable scheduling, and thorough documentation
                are requirements rather than preferences. We coordinate the
                resources, trades, and oversight each project demands, so our
                clients receive organized delivery rather than fragmented vendor
                management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 sm:py-20 bg-steel-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-3">
              Our Approach
            </h2>
            <p className="text-steel-600 mb-10">
              Every project we take on follows the same principles.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {principles.map((p) => (
                <div key={p.title} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center">
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">
                      {p.title}
                    </h3>
                    <p className="text-sm text-steel-600 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capability */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-6">
              What We Do
            </h2>
            <div className="space-y-4 text-steel-700 leading-relaxed">
              <p>
                TX4 Contracting&apos;s core capability is general construction
                for government projects. We coordinate project planning, trade
                management, field execution, safety, quality documentation, and
                closeout requirements through one accountable team.
              </p>
              <p>
                We work with federal, state, county, and municipal government
                agencies, as well as prime contractors who need a capable
                teaming partner or subcontractor for government solicitations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionCta
        title="Work With TX4"
        description="Whether you represent a government agency, a prime contractor, or a qualified trade partner, we are ready to discuss how TX4 can support your project."
        primaryLabel="Start a Project"
        primaryHref="/contact"
        secondaryLabel="View Capabilities"
        secondaryHref="/capabilities"
        variant="light"
      />
    </>
  );
}
