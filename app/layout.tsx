import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SiteChrome } from '@/components/site-chrome';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'TX4 Contracting | Government Projects. One Accountable Team.',
    template: '%s | TX4 Contracting',
  },
  description:
    'TX4 Contracting coordinates dependable project solutions for government agencies and prime contractors\u2014delivered safely, efficiently, and to specification.',
  metadataBase: new URL('https://tx4contracting.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'TX4 Contracting',
    title: 'TX4 Contracting | Government Projects. One Accountable Team.',
    description:
      'TX4 Contracting coordinates dependable project solutions for government agencies and prime contractors\u2014delivered safely, efficiently, and to specification.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TX4 Contracting | Government Projects. One Accountable Team.',
    description:
      'TX4 Contracting coordinates dependable project solutions for government agencies and prime contractors\u2014delivered safely, efficiently, and to specification.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
