'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/components/admin/admin-provider';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { email, signOut } = useAdmin();

  return (
    <div className="min-h-screen bg-steel-50 flex flex-col">
      <header className="bg-navy-900 border-b border-navy-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-6 min-w-0">
              <Link href="/admin/inquiries" className="shrink-0">
                <Image
                  src="/tx4-logo.PNG"
                  alt="TX4 Contracting"
                  width={110}
                  height={34}
                  className="h-8 w-auto brightness-0 invert"
                />
              </Link>
              <span
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-steel-300"
                aria-hidden="true"
              >
                <Inbox className="h-4 w-4" />
                Inquiry queue
              </span>
            </div>

            <div className="flex items-center gap-3 min-w-0">
              <span className="hidden md:block text-sm text-steel-300 truncate max-w-[220px]">
                {email}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void signOut()}
                className="text-steel-300 hover:text-white hover:bg-white/10 shrink-0"
              >
                <LogOut className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="border-t border-steel-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-steel-500">
            Internal tool. Submissions may contain sensitive procurement
            information — handle and share accordingly. All actions here are
            recorded in the audit trail.
          </p>
        </div>
      </footer>
    </div>
  );
}
