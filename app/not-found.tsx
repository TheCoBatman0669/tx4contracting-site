import Link from 'next/link';
import { ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section className="relative bg-navy-900 pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-32 min-h-[70vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-7xl sm:text-8xl font-bold text-white/20 mb-4">
          404
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-steel-300 max-w-md mx-auto mb-8">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-white text-navy-900 hover:bg-steel-100 font-semibold"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-steel-500 text-white hover:bg-white/10 font-semibold"
          >
            <Link href="/contact">
              Contact TX4
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
