import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { SectionCta } from '@/components/section-cta';
import { ProjectsFilter } from '@/components/projects-filter';
import {
  getPublishedProjects,
  getProjectFilterOptions,
} from '@/lib/projects-data';
import { companyData } from '@/lib/company-data';
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
} from '@/lib/structured-data';

const hasProjects = getPublishedProjects().length > 0;

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Representative past performance for TX4 Contracting government construction services, filterable by project type, market, and location.',
  alternates: { canonical: `${companyData.website}/projects` },
  // Keep the empty listing out of the index until real projects are published.
  robots: hasProjects
    ? { index: true, follow: true }
    : { index: false, follow: true },
  openGraph: {
    title: 'Projects | TX4 Contracting',
    description:
      'Representative past performance for TX4 Contracting government construction services.',
    url: `${companyData.website}/projects`,
  },
};

export default function ProjectsPage() {
  const projects = getPublishedProjects();
  const options = getProjectFilterOptions();

  const schemas: Record<string, unknown>[] = [
    getBreadcrumbSchema([
      { name: 'Home', url: companyData.website },
      { name: 'Projects', url: `${companyData.website}/projects` },
    ]),
  ];

  if (projects.length > 0) {
    schemas.push(
      getCollectionPageSchema({
        name: 'Past Performance',
        description:
          'Representative projects delivered by TX4 Contracting for government agencies and prime contractors.',
        url: `${companyData.website}/projects`,
        items: projects.map((p) => ({
          name: p.name,
          url: `${companyData.website}/projects/${p.slug}`,
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
        title="Past Performance"
        description="TX4 Contracting maintains a record of representative project experience for government agencies and prime contractors."
        breadcrumbs={[{ label: 'Projects', href: '/projects' }]}
      />

      {projects.length > 0 ? (
        <>
          <section className="py-16 sm:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <h2 className="sr-only">Representative projects</h2>
                <ProjectsFilter projects={projects} options={options} />
              </div>
            </div>
          </section>

          <SectionCta
            title="Discuss a Similar Requirement"
            description="Contact TX4 Contracting to discuss how this experience applies to your solicitation or project scope."
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
                <FolderOpen className="h-8 w-8" aria-hidden="true" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-4">
                Project Information Available Upon Request
              </h2>
              <p className="text-steel-600 leading-relaxed mb-8 max-w-lg mx-auto">
                Representative project details, past performance summaries, and
                relevant experience information are available during
                qualification discussions with government agencies and prime
                contractors.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-navy-900 text-white hover:bg-navy-800 font-semibold text-base px-8 h-12"
              >
                <Link href="/contact">
                  Discuss a Project
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
