'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorSummaryProps {
  /** Field-level messages, in the order the fields appear on the form. */
  fieldErrors?: { name: string; message: string }[];
  /** A single submission-level failure, e.g. the server rejected the request. */
  submitError?: string | null;
}

/**
 * Announces validation problems in one place. WCAG 3.3.1 asks that errors be
 * identified in text; a summary at the top of the form means keyboard users do
 * not have to hunt down the page to find what failed.
 */
export function FormErrorSummary({
  fieldErrors = [],
  submitError,
}: FormErrorSummaryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasErrors = fieldErrors.length > 0 || Boolean(submitError);

  useEffect(() => {
    if (hasErrors) {
      containerRef.current?.focus();
      containerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [hasErrors, submitError, fieldErrors.length]);

  if (!hasErrors) return null;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="alert"
      className="rounded-lg border border-destructive/40 bg-destructive/5 p-5 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
    >
      <div className="flex gap-3">
        <AlertCircle
          className="h-5 w-5 shrink-0 text-destructive mt-0.5"
          aria-hidden="true"
        />
        <div className="min-w-0">
          {submitError && (
            <p className="text-sm font-medium text-navy-900">{submitError}</p>
          )}

          {fieldErrors.length > 0 && (
            <>
              <p className="text-sm font-semibold text-navy-900">
                {fieldErrors.length === 1
                  ? 'There is a problem with one field:'
                  : `There are problems with ${fieldErrors.length} fields:`}
              </p>
              <ul className="mt-2 space-y-1 list-disc pl-5">
                {fieldErrors.map((error) => (
                  <li key={error.name} className="text-sm text-destructive">
                    {error.message}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
