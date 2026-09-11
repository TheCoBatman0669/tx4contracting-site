import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionCtaProps {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  variant?: 'navy' | 'light';
}

export function SectionCta({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  variant = 'navy',
}: SectionCtaProps) {
  if (variant === 'navy') {
    return (
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-900 rounded-2xl px-8 py-14 sm:px-14 sm:py-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {title}
            </h2>
            <p className="mt-4 text-lg text-steel-300 max-w-2xl mx-auto">
              {description}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-navy-900 hover:bg-steel-100 font-semibold text-base px-8 h-12"
              >
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {secondaryLabel && secondaryHref && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-steel-500 text-white hover:bg-white/10 font-semibold text-base px-8 h-12"
                >
                  <Link href={secondaryHref}>{secondaryLabel}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-24 bg-steel-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
          {title}
        </h2>
        <p className="mt-4 text-lg text-steel-600 max-w-xl mx-auto">
          {description}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-navy-900 text-white hover:bg-navy-800 font-semibold text-base px-10 h-12"
          >
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          {secondaryLabel && secondaryHref && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-navy-300 text-navy-900 hover:bg-navy-50 font-semibold text-base px-8 h-12"
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
