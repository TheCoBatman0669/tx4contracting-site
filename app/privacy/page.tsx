import type { Metadata } from 'next';
import { PageHero } from '@/components/page-hero';
import { companyData } from '@/lib/company-data';
import { getBreadcrumbSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy for ${companyData.name}. Learn how we collect, use, and protect your information.`,
  openGraph: {
    title: `Privacy Policy | ${companyData.name}`,
    description: `How ${companyData.name} collects, uses, and protects your information.`,
  },
};

const effectiveDate = 'September 2026';

export default function PrivacyPage() {
  const { contact } = companyData;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: companyData.website },
    { name: 'Privacy Policy', url: `${companyData.website}/privacy` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHero
        title="Privacy Policy"
        description={`Effective: ${effectiveDate}`}
        breadcrumbs={[{ label: 'Privacy Policy', href: '/privacy' }]}
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <article className="max-w-3xl mx-auto prose-navy">
            <div className="space-y-10">
              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-3">
                  Information We May Collect
                </h2>
                <p className="text-steel-700 leading-relaxed">
                  When you submit an inquiry or teaming interest form on this
                  website, we may collect your name, email address, phone
                  number, organization name, job title, project details, and
                  any files or documents you choose to upload. We also collect
                  basic technical information such as the page you submitted
                  from and the date and time of your inquiry.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-3">
                  How We Use Your Information
                </h2>
                <p className="text-steel-700 leading-relaxed">
                  We use the information you provide to respond to your
                  inquiry, evaluate project opportunities, manage teaming
                  relationships, and communicate about relevant government
                  contracting matters. Your information helps us understand
                  your requirements and determine how TX4 Contracting may be
                  able to assist.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-3">
                  Uploaded Documents
                </h2>
                <p className="text-steel-700 leading-relaxed">
                  Documents you submit through our forms, such as solicitation
                  materials, statements of work, capability statements, or
                  project specifications, may contain confidential or
                  sensitive project information. We store uploaded documents
                  securely and limit access to authorized personnel who need
                  the information to evaluate your inquiry.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-3">
                  Information Security
                </h2>
                <p className="text-steel-700 leading-relaxed">
                  {companyData.name} uses reasonable security controls to
                  protect the information you provide, including encrypted
                  connections, secure storage, and access controls. While no
                  system can guarantee absolute security, we take appropriate
                  measures to safeguard your data.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-3">
                  Information Sharing
                </h2>
                <p className="text-steel-700 leading-relaxed">
                  We do not sell, rent, or share your personal information
                  with third parties for their marketing purposes. We may
                  share information with service providers who help us operate
                  this website and manage inquiries, subject to appropriate
                  confidentiality requirements.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-3">
                  Your Rights
                </h2>
                <p className="text-steel-700 leading-relaxed">
                  You may request access to, correction of, or deletion of
                  the personal information we hold about you. To make such a
                  request, please contact us using the information below. We
                  will respond to your request in a reasonable timeframe.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-3">
                  Changes to This Policy
                </h2>
                <p className="text-steel-700 leading-relaxed">
                  We may update this privacy policy from time to time. Any
                  changes will be reflected on this page with an updated
                  effective date.
                </p>
              </div>

              {(contact.email || contact.phone) && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-3">
                    Contact Us
                  </h2>
                  <p className="text-steel-700 leading-relaxed">
                    If you have questions about this privacy policy or wish to
                    exercise your rights regarding your personal information,
                    please contact us:
                  </p>
                  <div className="mt-3 space-y-1 text-steel-700">
                    {contact.email && (
                      <p>
                        Email:{' '}
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-navy-700 underline underline-offset-2 hover:text-navy-500"
                        >
                          {contact.email}
                        </a>
                      </p>
                    )}
                    {contact.phone && (
                      <p>
                        Phone:{' '}
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-navy-700 underline underline-offset-2 hover:text-navy-500"
                        >
                          {contact.phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
