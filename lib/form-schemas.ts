import { z } from 'zod';

/**
 * Validation schemas for the public submission forms.
 *
 * These run in the browser for fast feedback. Phase 5 re-validates every field
 * server-side inside the Supabase edge function — the browser copy is a
 * convenience, never the enforcement point.
 *
 * File attachments are deliberately NOT modelled here. Referencing the `File`
 * global at module scope breaks server rendering, so attachments are validated
 * separately in lib/file-validation.ts.
 */

const requiredText = (label: string, max = 200) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const optionalText = (max = 200) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer.`).optional().or(z.literal(''));

const emailField = z
  .string()
  .trim()
  .min(1, 'Email address is required.')
  .max(254, 'Email address is too long.')
  .email('Enter a valid email address.');

// Deliberately permissive: international and extension formats vary too much
// for a strict pattern to be worth the false rejections.
const phoneField = z
  .string()
  .trim()
  .max(40, 'Phone number is too long.')
  .refine((v) => v === '' || /[0-9]/.test(v), {
    message: 'Enter a valid phone number.',
  })
  .optional()
  .or(z.literal(''));

const consentField = z.literal(true, {
  errorMap: () => ({
    message: 'You must agree before this can be submitted.',
  }),
});

/** Bot traps. Both must stay empty and are never shown to a real visitor. */
const honeypotFields = {
  companyFax: z.string().max(0).optional().or(z.literal('')),
  formRenderedAt: z.number().optional(),
};

/* ------------------------------------------------------------------ *
 * Form A: Project or Contract Inquiry
 * ------------------------------------------------------------------ */

export const projectInquirySchema = z
  .object({
    inquiryType: z.enum(['government_buyer', 'prime_contractor', 'other'], {
      errorMap: () => ({ message: 'Select the option that best describes you.' }),
    }),

    firstName: requiredText('First name', 80),
    lastName: requiredText('Last name', 80),
    email: emailField,
    phone: phoneField,
    jobTitle: optionalText(120),
    organization: requiredText('Organization', 160),

    // Shown only for government buyers
    agencyLevel: z.string().optional().or(z.literal('')),

    // Shown for government buyers and prime contractors
    solicitationNumber: optionalText(120),
    contractVehicle: optionalText(160),

    // Shown only when "Something else" is selected
    relationshipDescription: z
      .string()
      .trim()
      .max(300, 'Must be 300 characters or fewer.')
      .optional()
      .or(z.literal('')),

    capability: requiredText('Capability', 80),
    projectLocation: requiredText('Project location', 160),
    responseDeadline: z.string().optional().or(z.literal('')),
    estimatedValueRange: z.string().optional().or(z.literal('')),

    scopeSummary: z
      .string()
      .trim()
      .min(30, 'Please provide at least a short description of the scope (30 characters).')
      .max(4000, 'Scope summary must be 4,000 characters or fewer.'),

    consent: consentField,
    ...honeypotFields,
  })
  .superRefine((data, ctx) => {
    if (data.inquiryType === 'government_buyer' && !data.agencyLevel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['agencyLevel'],
        message: 'Select the level of government.',
      });
    }

    if (
      data.inquiryType === 'other' &&
      (!data.relationshipDescription || data.relationshipDescription.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['relationshipDescription'],
        message: 'Tell us briefly how you are involved with the project.',
      });
    }

    if (data.responseDeadline) {
      const deadline = new Date(`${data.responseDeadline}T00:00:00`);
      if (Number.isNaN(deadline.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responseDeadline'],
          message: 'Enter a valid date.',
        });
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadline < today) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['responseDeadline'],
            message: 'The deadline is in the past. Confirm the date is correct.',
          });
        }
      }
    }
  });

export type ProjectInquiryValues = z.infer<typeof projectInquirySchema>;

export const projectInquiryDefaults: Partial<ProjectInquiryValues> = {
  inquiryType: undefined,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  organization: '',
  agencyLevel: '',
  solicitationNumber: '',
  contractVehicle: '',
  relationshipDescription: '',
  capability: '',
  projectLocation: '',
  responseDeadline: '',
  estimatedValueRange: '',
  scopeSummary: '',
  companyFax: '',
};

/* ------------------------------------------------------------------ *
 * Form B: Team With TX4
 * ------------------------------------------------------------------ */

export const teamingSchema = z.object({
  companyName: requiredText('Company name', 160),
  firstName: requiredText('First name', 80),
  lastName: requiredText('Last name', 80),
  email: emailField,
  phone: phoneField,
  companyWebsite: z
    .string()
    .trim()
    .max(200, 'Website URL is too long.')
    .optional()
    .or(z.literal('')),

  partnerTypes: z
    .array(z.string())
    .min(1, 'Select at least one option that describes your company.'),

  capabilitiesProvided: z
    .string()
    .trim()
    .min(10, 'Describe the work your company performs.')
    .max(1500, 'Must be 1,500 characters or fewer.'),

  serviceTerritory: requiredText('Service territory', 300),
  naicsCodes: optionalText(300),
  certifications: z.array(z.string()).optional(),
  bondingCapacity: z.string().optional().or(z.literal('')),
  yearsInBusiness: z
    .string()
    .trim()
    .max(3, 'Enter a number.')
    .refine((v) => v === '' || /^\d{1,3}$/.test(v), {
      message: 'Enter a whole number of years.',
    })
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .trim()
    .min(30, 'Please tell us a little more about your company (30 characters).')
    .max(3000, 'Must be 3,000 characters or fewer.'),

  consent: consentField,
  ...honeypotFields,
});

export type TeamingValues = z.infer<typeof teamingSchema>;

export const teamingDefaults: Partial<TeamingValues> = {
  companyName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyWebsite: '',
  partnerTypes: [],
  capabilitiesProvided: '',
  serviceTerritory: '',
  naicsCodes: '',
  certifications: [],
  bondingCapacity: '',
  yearsInBusiness: '',
  description: '',
  companyFax: '',
};
