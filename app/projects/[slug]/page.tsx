import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { SectionCta } from '@/components/section-cta';
import {
  getProjectBySlug,
  getPublishedProjects,
  getRelatedProjects,
  formatCompletionDate,
} from '@/lib/projects-data';
import type { Capability } from '@/lib/capabilities-data';
import { getCapabilityBySlug } from '@/lib/capabilities-data';
import { companyData } from '@/lib/company-data';
import { getBreadcrumbSchema } from '@/lib/structured-data';

export function generateStaticParams() {
  return getPublishedProjects().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    return { title: 'Project Not Found', robots: { index: false, follow: true } };
  }

  const url = `${companyData.website}/projects/${project.slug}`;

  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      title: `${project.name} | TX4 Contracting`,
      description: project.summary,
      url,
      type: 'article',
      images: project.featuredImage
        ? [{ url: project.featuredImage, alt: project.featuredImageAlt }]
        : undefined,
    },
  };
}

export default function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  const url = `${companyData.website}/projects/${project.slug}`;
  const related = getRelatedProjects(project);
  const capabilities = project.relatedCapabilities
    .map((slug) => getCapabilityBySlug(slug))
    .filter((c): c is Capability => c !== null);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: companyData.website },
    { name: 'Projects', url: `${companyData.website}/projects` },
    { name: project.name, url },
  ]);

  const facts: { label: string; value: string }[] = [
    { label: 'Project Type', value: project.projectType },
    { label: 'Market', value: project.market },
    { label: 'Customer', value: project.customerCategory },
    { label: 'Location', value: project.location },
    { label: 'TX4 Role', value: project.role },
    { label: 'Completed', value: formatCompletionDate(project.completionDate) },
  ].filter((f) => Boolean(f.value));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHero
        title={project.name}
        description={project.summary}
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project.name, href: `/projects/${project.slug}` },
        ]}
      />

      {/* Project facts */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="sr-only">Project details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-steel-200 border border-steel-200 rounded-xl overflow-hidden">
              {facts.map((fact) => (
                <div key={fact.label} className="bg-white p-5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-steel-500 mb-1">
                    {fact.label}
                  </dt>
                  <dd className="text-navy-900 font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Featured image */}
      {project.featuredImage && (
        <section className="pb-12 sm:pb-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto relative aspect-[16/9] rounded-xl overflow-hidden bg-steel-100">
              <Image
                src={project.featuredImage}
                alt={project.featuredImageAlt || project.name}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* Scope and outcome */}
      <section className="py-16 sm:py-20 bg-steel-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-4">
                Scope of Work
              </h2>
              <p className="text-steel-700 leading-relaxed">{project.scope}</p>
            </div>

            {project.highlights.length > 0 && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-4">
                  Project Highlights
                </h2>
                <ul className="space-y-3">
                  {project.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3">
                      <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-navy-900 text-white flex items-center justify-center">
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                      <span className="text-steel-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-4">
                Outcome
              </h2>
              <p className="text-steel-700 leading-relaxed">
                {project.outcome}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {project.gallery.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-8">
                Project Photography
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {project.gallery.map((image) => (
                  <figure key={image.src}>
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-steel-100">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                    {image.caption && (
                      <figcaption className="mt-2 text-sm text-steel-600">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Internal linking */}
      {(capabilities.length > 0 || related.length > 0) && (
        <section className="py-16 sm:py-20 bg-steel-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-10">
              {capabilities.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 tracking-tight mb-5">
                    Capabilities Demonstrated
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
                    Related Projects
                  </h2>
                  <ul className="space-y-3">
                    {related.map((rel) => (
                      <li key={rel.slug}>
                        <Link
                          href={`/projects/${rel.slug}`}
                          className="group flex items-center justify-between gap-4 bg-white border border-steel-200 rounded-lg p-5 hover:border-navy-300 hover:shadow-sm transition-all"
                        >
                          <span>
                            <span className="block font-semibold text-navy-900 group-hover:text-navy-700 transition-colors">
                              {rel.name}
                            </span>
                            <span className="block text-sm text-steel-600">
                              {rel.market} &middot; {rel.location}
                            </span>
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
              <Link href="/projects">Back to all projects</Link>
            </Button>
          </div>
        </div>
      </div>

      <SectionCta
        title="Discuss a Similar Project"
        description="Contact TX4 Contracting to discuss how this experience applies to your solicitation, statement of work, or upcoming requirement."
        primaryLabel="Start a Project"
        primaryHref="/contact"
        secondaryLabel="View Capabilities"
        secondaryHref="/capabilities"
        variant="navy"
      />
    </>
  );
}
