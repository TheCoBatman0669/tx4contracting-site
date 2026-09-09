'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMainNavItems } from '@/lib/navigation';
import { MobileNav } from '@/components/mobile-nav';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-navy-900/98 backdrop-blur-sm shadow-lg py-3'
          : 'bg-navy-900 py-5'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/tx4-logo.PNG"
            alt="TX4 Contracting"
            width={scrolled ? 140 : 160}
            height={scrolled ? 47 : 54}
            className="transition-all duration-300 w-auto"
            style={{ height: scrolled ? 47 : 54 }}
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {getMainNavItems().map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-steel-200 hover:text-white transition-colors rounded-md hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            asChild
            size={scrolled ? 'sm' : 'default'}
            className="hidden sm:inline-flex bg-white text-navy-900 hover:bg-steel-100 font-semibold transition-all duration-300"
          >
            <Link href="/contact">
              Start a Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
