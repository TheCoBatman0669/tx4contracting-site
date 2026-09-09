'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { getMainNavItems } from '@/lib/navigation';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-80 bg-navy-900 border-navy-800 p-0"
      >
        <SheetHeader className="p-6 pb-4 border-b border-navy-800">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Image
            src="/tx4-logo.PNG"
            alt="TX4 Contracting"
            width={140}
            height={47}
            className="w-auto h-10"
          />
        </SheetHeader>

        <nav className="flex flex-col p-4 gap-1">
          {getMainNavItems().map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-base font-medium text-steel-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-navy-800">
          <Button
            asChild
            className="w-full bg-white text-navy-900 hover:bg-steel-100 font-semibold"
          >
            <Link href="/contact" onClick={() => setOpen(false)}>
              Start a Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
