import { cn } from '@/lib/utils';

interface FormSectionProps {
  /** Rendered as the fieldset legend, so screen readers announce it with each field. */
  legend: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  legend,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <fieldset className={cn('border-0 p-0 m-0 min-w-0', className)}>
      <legend className="text-lg font-bold text-navy-900 mb-1">{legend}</legend>
      {description && (
        <p className="text-sm text-steel-600 mb-5 max-w-prose">{description}</p>
      )}
      <div className={cn('grid grid-cols-1 gap-5', !description && 'mt-5')}>
        {children}
      </div>
    </fieldset>
  );
}

/** Two-column row that collapses to one column on small screens. */
export function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
  );
}

/** Marks a field as required for both sighted and screen-reader users. */
export function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-destructive ml-0.5">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}
