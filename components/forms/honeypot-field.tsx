import type { UseFormRegisterReturn } from 'react-hook-form';

/**
 * Spam trap. Hidden from sighted users with CSS and from assistive technology
 * with aria-hidden, so only a script filling every field will populate it.
 * The server rejects any submission where this arrives non-empty.
 *
 * Uses an off-screen wrapper rather than `display: none` because some bots skip
 * fields that are not rendered at all.
 */
export function HoneypotField({
  field,
}: {
  field: UseFormRegisterReturn;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden"
    >
      <label htmlFor="company-fax-number">
        Company fax number (leave this field empty)
      </label>
      <input
        {...field}
        id="company-fax-number"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
