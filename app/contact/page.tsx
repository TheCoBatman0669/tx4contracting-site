import type { Metadata } from 'next';
import Link from 'next/link';
import { Handshake, ArrowRight, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { ProjectInquiryForm } from '@/components/forms/project-inquiry-form';
import { companyData } from '@/lib/company-data';
import { getBreadcrumbSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Submit a project or contract inquiry to TX4 Contracting. For government buyers, contracting officers, and prime contractors with construction requirements.',
  alternates: { canonical: `${companyData.website}/contact` },
  openGraph: {
    title: 'Contact | TX4 Contracting',
    description:
      'Submit a project or contract inquiry to TX4 Contracting.',
    url: `${companyData.website}/contact`,
  },
};

export default function ContactPage() {
  const { contact } = companyData;
  const hasContact = contact.phone || contact.email;
  const hasAddress = contact.address.city && contact.address.state;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: companyData.website },
    { name: 'Contact', url: `${companyData.website}/contact` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHero
        title="Start a Project"
        description="Tell us about the requirement and we will respond with next steps. Government buyers, contracting officers, and prime contractors are all welcome here."
        breadcrumbs={[{ label: 'Contact', href: '/contact' }]}
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-3">
              Project or contract inquiry
            </h2>
            <p className="text-steel-600 leading-relaxed mb-10">
              The form adapts to who you are, so you are only asked what is
              relevant. Nothing here is a commitment on either side.
            </p>

            <ProjectInquiryForm />
          </div>
        </div>
      </section>

      {/* Teaming path */}
      <section className="py-16 sm:py-20 bg-steel-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-6 rounded-xl border border-steel-200 bg-white p-8">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-navy-900 text-white flex items-center justify-center">
                <Handshake className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-2">
                  Are you a subcontractor, supplier, or specialty firm?
                </h2>
                <p className="text-steel-600 leading-relaxed mb-5">
                  That is a different conversation with different questions. Use
                  the partner form instead so we capture your trades, territory,
                  and certifications properly.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="border-navy-300 text-navy-900 hover:bg-navy-50 font-semibold"
                >
                  <Link href="/teaming/apply">
                    Team With TX4
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct contact details */}
      {hasContact && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-navy-900 rounded-xl p-8 sm:p-10">
                <h2 className="text-xl font-bold text-white mb-2 text-center">
                  Prefer to reach us directly?
                </h2>
                <p className="text-sm text-steel-300 text-center mb-8 flex items-center justify-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  Inquiries are typically answered within one to two business
                  days.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-3 text-steel-200 hover:text-white transition-colors"
                    >
                      <span className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <Phone className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-medium">
                        {contact.phone}
                      </span>
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-3 text-steel-200 hover:text-white transition-colors"
                    >
                      <span className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <Mail className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-medium">
                        {contact.email}
                      </span>
                    </a>
                  )}
                  {hasAddress && (
                    <p className="flex items-center gap-3 text-steel-200">
                      <span className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-medium">
                        {contact.address.city}, {contact.address.state}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
