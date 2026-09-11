import type { Metadata } from 'next';
import { AdminProvider } from '@/components/admin/admin-provider';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: 'Inquiry Queue',
  // Belt and braces alongside robots.txt: nothing under /admin should ever
  // appear in a search index, and the pages are behind auth regardless.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
