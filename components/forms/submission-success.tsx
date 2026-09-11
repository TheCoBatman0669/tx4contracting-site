'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { companyData } from '@/lib/company-data';

interface SubmissionSuccessProps {
  referenceNumber: string;
  title: string;
  /** What the visitor should expect next, in order. */
  nextSteps: string[];
  summary?: { label: string; value: string }[];
  onReset?: () => void;
  resetLabel?: string;
  /** True when the confirmation came from the local dev preview path. */
  preview?: boolean;
}

export function SubmissionSuccess({
  referenceNumber,
  title,
  nextSteps,
  summary = [],
  onReset,
  resetLabel = 'Submit another inquiry',
  preview = false,
}: SubmissionSuccessProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation so keyboard and screen-reader users are not
  // left at the bottom of a form that no longer exists.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const copyReference = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referenceNumber).catch(() => {
        // Clipboard access can be denied. The number is on screen regardless.
      });
    }
  };

  return (
    <div
      className="rounded-xl border border-steel-200 bg-white p-8 sm:p-10"
      role="status"
      aria-live="polite"
    >
      {preview && (
        <div className="mb-6 flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-warning"
            aria-hidden="true"
          />
          <p className="text-sm text-navy-900">
            <strong>Development preview.</strong> Nothing was saved. The
            submission endpoint is built in Phase 5; this screen exists so the
            form flow can be reviewed now.
          </p>
        </div>
      )}

      <div className="w-14 h-14 rounded-xl bg-success/10 text-success flex items-center justify-center mb-5">
        <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-3 focus:outline-none"
      >
        {title}
      </h2>

      <p className="text-steel-700 leading-relaxed mb-6">
        Your inquiry has been received. Keep the reference number below for any
        follow-up correspondence.
      </p>

      <div className="rounded-lg bg-navy-900 px-6 py-5 mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-steel-400 mb-1">
          Reference number
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xl font-mono font-semibold text-white break-all">
            {referenceNumber}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyReference}
            className="text-steel-300 hover:text-white hover:bg-white/10"
          >
            <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Copy
          </Button>
        </div>
      </div>

      {summary.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-steel-500 mb-3">
            Submission summary
          </h3>
          <dl className="divide-y divide-steel-200 border-t border-b border-steel-200">
            {summary.map((item) => (
              <div key={item.label} className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm text-steel-500">{item.label}</dt>
                <dd className="mt-0.5 sm:mt-0 sm:col-span-2 text-sm text-navy-900">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-steel-500 mb-3">
          What happens next
        </h3>
        <ol className="space-y-3">
          {nextSteps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-steel-100 text-navy-800 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <span className="text-sm text-steel-700 leading-relaxed pt-0.5">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {onReset && (
          <Button
            type="button"
            onClick={onReset}
            variant="outline"
            className="border-navy-300 text-navy-900 hover:bg-navy-50"
          >
            {resetLabel}
          </Button>
        )}
        <Button
          asChild
          variant="ghost"
          className="text-navy-700 hover:text-navy-900"
        >
          <Link href="/">Return to homepage</Link>
        </Button>
      </div>

      {companyData.contact.email && (
        <p className="mt-6 pt-6 border-t border-steel-200 text-sm text-steel-600">
          Need to add something? Reply to the confirmation email or contact us at{' '}
          <a
            href={`mailto:${companyData.contact.email}`}
            className="text-navy-700 underline underline-offset-2 hover:text-navy-900"
          >
            {companyData.contact.email}
          </a>
          , quoting your reference number.
        </p>
      )}
    </div>
  );
}
