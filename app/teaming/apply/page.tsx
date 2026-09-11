import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { TeamingForm } from '@/components/forms/teaming-form';
import { companyData } from '@/lib/company-data';
import { getBreadcrumbSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Team With TX4',
  description:
    'Register your company with TX4 Contracting as a subcontractor, specialty contractor, supplier, or teaming partner on government construction projects.',
  alternates: { canonical: `${companyData.website}/teaming/apply` },
  openGraph: {
    title: 'Team With TX4 | TX4 Contracting',
    description:
      'Register your company as a subcontractor, supplier, or teaming partner.',
    url: `${companyData.website}/teaming/apply`,
  },
};

export default function TeamingApplyPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: companyData.website },
    { name: 'Teaming', url: `${companyData.website}/teaming` },
    { name: 'Team With TX4', url: `${companyData.website}/teaming/apply` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHero
        title="Team With TX4"
        description="Tell us what your company does, where it works, and what it is qualified for. We contact partners when a scope matches."
        breadcrumbs={[
          { label: 'Teaming', href: '/teaming' },
          { label: 'Team With TX4', href: '/teaming/apply' },
        ]}
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-steel-600 leading-relaxed mb-10">
              Submitting this form adds your company to the TX4 partner list. It
              is not a bid, a teaming agreement, or a commitment to award work by
              either party. If your inquiry is about a specific project TX4 is
              already pursuing,{' '}
              <Link
                href="/contact"
                className="text-navy-700 underline underline-offset-2 hover:text-navy-900"
              >
                use the project inquiry form
              </Link>{' '}
              instead.
            </p>

            <TeamingForm />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-steel-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl font-bold text-navy-900 mb-3">
              Not sure this is the right form?
            </h2>
            <p className="text-steel-600 mb-6">
              The teaming overview explains what TX4 looks for in a partner and
              how coordination works on a government project.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-navy-300 text-navy-900 hover:bg-navy-50 font-semibold"
            >
              <Link href="/teaming">
                Read the teaming overview
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
