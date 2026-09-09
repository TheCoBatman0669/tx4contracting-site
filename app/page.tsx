import Link from 'next/link';
import { ArrowRight, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { companyData, getVerifiedProcurement } from '@/lib/company-data';
import { getPublishedCapabilities } from '@/lib/capabilities-data';
import { getPublishedProjects } from '@/lib/projects-data';
import { markets } from '@/lib/markets-data';
import { getOrganizationSchema } from '@/lib/structured-data';

const differentiators = [
  {
    icon: 'Shield',
    title: 'One Point of Accountability',
    description: 'A single responsible team manages every aspect of your project from mobilization through closeout.',
  },
  {
    icon: 'Users',
    title: 'Coordinated Delivery',
    description: 'We organize qualified trades, suppliers, and specialty partners so the project runs on schedule.',
  },
  {
    icon: 'Clock',
    title: 'Rapid Mobilization',
    description: 'Ready to deploy resources quickly when timelines demand urgency and efficiency.',
  },
  {
    icon: 'FileCheck',
    title: 'Documentation & Compliance',
    description: 'Thorough project documentation, safety controls, and quality assurance at every phase.',
  },
];

export default function HomePage() {
  const capabilities = getPublishedCapabilities();
  const procurement = getVerifiedProcurement();
  const featuredProjects = getPublishedProjects().slice(0, 3);

  const orgSchema = getOrganizationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-navy-900 pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-steel-800/20 via-transparent to-transparent" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] text-balance">
              Government Projects.{' '}
              <span className="text-steel-300">One Accountable Team.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-steel-300 max-w-2xl leading-relaxed">
              {companyData.description}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-navy-900 hover:bg-steel-100 font-semibold text-base px-8 h-12"
              >
                <Link href="/capabilities">
                  View Capabilities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-steel-500 text-white hover:bg-white/10 font-semibold text-base px-8 h-12"
              >
                <Link href="/contact">Start a Project</Link>
              </Button>
            </div>
            {companyData.capabilityStatementUrl && (
              <Link
                href={companyData.capabilityStatementUrl}
                className="inline-flex items-center gap-1.5 mt-6 text-sm text-steel-400 hover:text-white transition-colors underline underline-offset-4"
              >
                Download Capability Statement
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Procurement Credibility Bar */}
      {procurement.length > 0 && (
        <section className="bg-navy-800 border-y border-navy-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {procurement.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <span className="text-steel-400 font-medium">{item.label}:</span>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Capabilities */}
      {capabilities.length > 0 && (
        <section className="py-20 sm:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
                What We Deliver
              </h2>
              <p className="mt-4 text-lg text-steel-600">
                Dependable project execution for government agencies and prime contractors.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {capabilities.map((cap) => (
                <Link
                  key={cap.slug}
                  href={`/capabilities/${cap.slug}`}
                  className="group relative bg-steel-50 border border-steel-100 rounded-lg p-8 hover:border-navy-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="text-navy-700 mb-4">
                    <Icon name={cap.icon} className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy-900 mb-3 group-hover:text-navy-700 transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-steel-600 text-sm leading-relaxed">
                    {cap.shortDescription}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-navy-700 group-hover:text-navy-500 transition-colors">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why TX4 */}
      <section className="py-20 sm:py-24 bg-steel-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
              Why TX4
            </h2>
            <p className="mt-4 text-lg text-steel-600">
              A dependable contracting partner built for government project demands.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {differentiators.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-navy-900 text-white flex items-center justify-center">
                  <Icon name={item.icon} className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-1">
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
      </section>

      {/* Past Performance Preview - renders only once real projects are published */}
      {featuredProjects.length > 0 && (
        <section className="py-20 sm:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
                Representative Projects
              </h2>
              <p className="mt-4 text-lg text-steel-600">
                A sample of the work TX4 has coordinated for public-sector
                clients and prime contractors.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {featuredProjects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group flex flex-col bg-steel-50 border border-steel-100 rounded-lg p-8 hover:border-navy-200 hover:shadow-md transition-all duration-200"
                >
                  <span className="inline-flex self-start items-center rounded-full bg-white text-navy-800 px-2.5 py-1 text-xs font-semibold mb-3">
                    {project.market}
                  </span>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2 group-hover:text-navy-700 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-steel-600 leading-relaxed mb-4 flex-1">
                    {project.summary}
                  </p>
                  <dl className="space-y-1.5 text-sm text-steel-600 mb-4">
                    <div className="flex items-center gap-2">
                      <dt className="sr-only">Project type</dt>
                      <Briefcase
                        className="h-4 w-4 shrink-0 text-steel-400"
                        aria-hidden="true"
                      />
                      <dd>{project.projectType}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <dt className="sr-only">Location</dt>
                      <MapPin
                        className="h-4 w-4 shrink-0 text-steel-400"
                        aria-hidden="true"
                      />
                      <dd>{project.location}</dd>
                    </div>
                  </dl>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 group-hover:text-navy-500 transition-colors">
                    View project
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-navy-300 text-navy-900 hover:bg-navy-50 font-semibold"
              >
                <Link href="/projects">
                  View All Projects
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Markets Served */}
      <section
        className={`py-20 sm:py-24 ${
          featuredProjects.length > 0 ? 'bg-steel-50' : 'bg-white'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
              Markets Served
            </h2>
            <p className="mt-4 text-lg text-steel-600">
              TX4 works with public-sector buyers and the contractors who
              support them.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {markets.map((market) => (
              <div
                key={market.label}
                className="bg-white border border-steel-200 rounded-lg p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center mb-4">
                  <Icon name={market.icon} className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-navy-900 mb-1.5">
                  {market.label}
                </h3>
                <p className="text-sm text-steel-600 leading-relaxed">
                  {market.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaming CTA */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-900 rounded-2xl px-8 py-14 sm:px-14 sm:py-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Team With TX4
            </h2>
            <p className="mt-4 text-lg text-steel-300 max-w-2xl mx-auto">
              We partner with qualified subcontractors, suppliers, and specialty firms to deliver coordinated results on government projects.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-navy-900 hover:bg-steel-100 font-semibold text-base px-8 h-12"
              >
                <Link href="/teaming">
                  Explore Teaming
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-steel-500 text-white hover:bg-white/10 font-semibold text-base px-8 h-12"
              >
                <Link href="/contact">Start a Project</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24 bg-steel-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
            Ready to Start Your Project?
          </h2>
          <p className="mt-4 text-lg text-steel-600 max-w-xl mx-auto">
            Whether you need a general contractor for a government project or a capable teaming partner, TX4 is ready to deliver.
          </p>
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="bg-navy-900 text-white hover:bg-navy-800 font-semibold text-base px-10 h-12"
            >
              <Link href="/contact">
                Contact TX4
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
