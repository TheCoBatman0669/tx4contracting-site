import type { Metadata } from 'next';
import { PageHero } from '@/components/page-hero';
import { companyData } from '@/lib/company-data';
import { getBreadcrumbSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Accessibility',
  description: `${companyData.name} is committed to making our website accessible to all visitors, including those using assistive technologies.`,
  openGraph: {
    title: `Accessibility | ${companyData.name}`,
    description: `${companyData.name} accessibility commitment and statement.`,
  },
};

export default function AccessibilityPage() {
  const { contact } = companyData;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: companyData.website },
    {
      name: 'Accessibility',
      url: `${companyData.website}/accessibility`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHero
        title="Accessibility"
        description={`${companyData.name} is committed to providing a website that is accessible to the widest possible audience.`}
        breadcrumbs={[{ label: 'Accessibility', href: '/accessibility' }]}
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <article className="max-w-3xl mx-auto">
            <div className="space-y-10">
              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-3">
                  Our Commitment
                </h2>
                <p className="text-steel-700 leading-relaxed">
                  {companyData.name} strives to ensure that our website is
                  accessible to people of all abilities. We are committed to
                  providing a positive experience for all visitors, including
                  those who use screen readers, keyboard navigation, and other
                  assistive technologies.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-3">
                  Accessibility Features
                </h2>
                <p className="text-steel-700 leading-relaxed mb-4">
                  We work to maintain the following accessibility standards
                  throughout our website:
                </p>
                <ul className="space-y-2 text-steel-700">
                  <li className="flex items-start gap-2">
                    <span className="text-navy-700 mt-0.5 font-bold">
                      &#8226;
                    </span>
                    Keyboard navigation for all interactive elements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-navy-700 mt-0.5 font-bold">
                      &#8226;
                    </span>
                    Descriptive text for images and visual content
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-navy-700 mt-0.5 font-bold">
                      &#8226;
                    </span>
                    Sufficient color contrast for readability
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-navy-700 mt-0.5 font-bold">
                      &#8226;
                    </span>
                    Clear heading structure for screen readers
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-navy-700 mt-0.5 font-bold">
                      &#8226;
                    </span>
                    Properly labeled form fields and controls
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-navy-700 mt-0.5 font-bold">
                      &#8226;
                    </span>
                    Support for reduced-motion preferences
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-navy-700 mt-0.5 font-bold">
                      &#8226;
                    </span>
                    Responsive design for all screen sizes
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-3">
                  Ongoing Improvements
                </h2>
                <p className="text-steel-700 leading-relaxed">
                  Accessibility is an ongoing effort. We regularly review our
                  website against current best practices and work to address
                  any barriers that may prevent full access to our content and
                  services.
                </p>
              </div>

              {(contact.email || contact.phone) && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-3">
                    Report an Issue
                  </h2>
                  <p className="text-steel-700 leading-relaxed">
                    If you experience difficulty accessing any part of our
                    website, please let us know. We take accessibility feedback
                    seriously and will work to address reported issues
                    promptly.
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
