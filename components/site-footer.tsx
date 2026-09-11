import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import { companyData, getVerifiedProcurement } from '@/lib/company-data';
import { getMainNavItems } from '@/lib/navigation';

export function SiteFooter() {
  const procurement = getVerifiedProcurement();
  const { contact } = companyData;
  const hasContact = contact.phone || contact.email;
  const hasAddress =
    contact.address.city && contact.address.state;

  return (
    <footer className="bg-navy-950 text-steel-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Image
              src="/tx4-logo.PNG"
              alt="TX4 Contracting"
              width={160}
              height={54}
              className="w-auto h-12 mb-4"
            />
            <p className="text-sm leading-relaxed text-steel-400 max-w-xs">
              {companyData.description}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {getMainNavItems().map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-steel-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {hasContact && (
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Contact
              </h3>
              <ul className="space-y-3">
                {contact.phone && (
                  <li>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 text-sm text-steel-400 hover:text-white transition-colors"
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-sm text-steel-400 hover:text-white transition-colors"
                    >
                      <Mail className="h-4 w-4 shrink-0" />
                      {contact.email}
                    </a>
                  </li>
                )}
                {hasAddress && (
                  <li className="flex items-start gap-2 text-sm text-steel-400">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      {contact.address.city}, {contact.address.state}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {procurement.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Procurement
              </h3>
              <dl className="space-y-2.5">
                {procurement.map((item) => (
                  <div key={item.label} className="text-sm">
                    <dt className="text-steel-500 text-xs uppercase tracking-wider">
                      {item.label}
                    </dt>
                    <dd className="text-steel-300">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="border-t border-navy-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-steel-500">
            &copy; {new Date().getFullYear()}{' '}
            {companyData.legalName || companyData.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-steel-500 hover:text-steel-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/accessibility"
              className="text-xs text-steel-500 hover:text-steel-300 transition-colors"
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
