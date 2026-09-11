'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  FormSection,
  FormRow,
  RequiredMark,
} from '@/components/forms/form-section';
import { HoneypotField } from '@/components/forms/honeypot-field';
import { FileAttachmentsField } from '@/components/forms/file-attachments-field';
import { FormErrorSummary } from '@/components/forms/form-error-summary';
import { SubmissionSuccess } from '@/components/forms/submission-success';
import { TurnstileWidget } from '@/components/turnstile-widget';
import {
  teamingSchema,
  teamingDefaults,
  type TeamingValues,
} from '@/lib/form-schemas';
import {
  PARTNER_TYPES,
  CERTIFICATIONS,
  BONDING_CAPACITY,
} from '@/lib/form-options';
import { captureAttribution } from '@/lib/attribution';
import { submitInquiry, createIdempotencyKey } from '@/lib/submission-client';
import { isTurnstileEnforced } from '@/lib/turnstile';
import { cn } from '@/lib/utils';

const NEXT_STEPS = [
  'A confirmation email is sent to the address you provided.',
  'TX4 adds your company to its partner list and reviews the capabilities and territory you described.',
  'You are contacted when a project or solicitation matches what your company does. This may not be immediate.',
  'Keep your capability statement current by resubmitting this form whenever it changes.',
];

export function TeamingForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    referenceNumber: string;
    preview?: boolean;
    summary: { label: string; value: string }[];
  } | null>(null);

  const idempotencyKey = useRef(createIdempotencyKey());

  const form = useForm<TeamingValues>({
    resolver: zodResolver(teamingSchema),
    defaultValues: teamingDefaults as TeamingValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    form.setValue('formRenderedAt', Date.now());
  }, [form]);

  const fieldErrors = Object.entries(form.formState.errors)
    .filter(([, error]) => Boolean(error?.message))
    .map(([name, error]) => ({ name, message: String(error?.message) }));

  const turnstileRequired = isTurnstileEnforced();
  const canSubmit = !turnstileRequired || Boolean(turnstileToken);

  const onSubmit = async (values: TeamingValues) => {
    setSubmitError(null);

    if (turnstileRequired && !turnstileToken) {
      setSubmitError('Please complete the verification check before submitting.');
      return;
    }

    const payload = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        // Repeated keys so the server receives a real list, not a joined string.
        value.forEach((entry) => payload.append(key, String(entry)));
        return;
      }
      payload.append(key, String(value));
    });

    const attribution = captureAttribution();
    Object.entries(attribution).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });

    payload.append('turnstileToken', turnstileToken);
    files.forEach((file) => payload.append('attachments', file, file.name));

    const response = await submitInquiry(
      'teaming',
      payload,
      idempotencyKey.current
    );

    if (!response.ok || !response.referenceNumber) {
      setSubmitError(response.error ?? 'Something went wrong. Please try again.');
      idempotencyKey.current = createIdempotencyKey();
      setTurnstileToken('');
      return;
    }

    const partnerLabels = (values.partnerTypes ?? [])
      .map((v) => PARTNER_TYPES.find((p) => p.value === v)?.label ?? v)
      .join(', ');

    setResult({
      referenceNumber: response.referenceNumber,
      preview: response.preview,
      summary: [
        { label: 'Company', value: values.companyName },
        { label: 'Partner type', value: partnerLabels },
        { label: 'Service territory', value: values.serviceTerritory },
        ...(files.length
          ? [
              {
                label: 'Attachments',
                value: `${files.length} file${files.length === 1 ? '' : 's'}`,
              },
            ]
          : []),
      ],
    });
  };

  const resetForm = () => {
    form.reset(teamingDefaults as TeamingValues);
    form.setValue('formRenderedAt', Date.now());
    setFiles([]);
    setTurnstileToken('');
    setSubmitError(null);
    setResult(null);
    idempotencyKey.current = createIdempotencyKey();
  };

  if (result) {
    return (
      <SubmissionSuccess
        title="Thank you for reaching out"
        referenceNumber={result.referenceNumber}
        preview={result.preview}
        summary={result.summary}
        nextSteps={NEXT_STEPS}
        onReset={resetForm}
        resetLabel="Submit another company"
      />
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-10"
      >
        <FormErrorSummary
          fieldErrors={form.formState.isSubmitted ? fieldErrors : []}
          submitError={submitError}
        />

        <HoneypotField field={form.register('companyFax')} />

        <FormSection legend="Your company">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Company name
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input autoComplete="organization" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormRow>
            <FormField
              control={form.control}
              name="companyWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="url"
                      placeholder="example.com"
                      autoComplete="url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearsInBusiness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years in business</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" maxLength={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection legend="Your details">
          <FormRow>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First name
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last name
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormRow>

          <FormRow>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email address
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection
          legend="What your company does"
          description="The more specific this is, the more likely we are to contact you about a matching scope."
        >
          <FormField
            control={form.control}
            name="partnerTypes"
            render={() => (
              <FormItem>
                <FormLabel>
                  Which describes your company?
                  <RequiredMark />
                </FormLabel>
                <FormDescription>Select all that apply.</FormDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {PARTNER_TYPES.map((option) => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name="partnerTypes"
                      render={({ field }) => {
                        const checked = field.value?.includes(option.value);
                        return (
                          <FormItem className="space-y-0">
                            <label
                              htmlFor={`partner-${option.value}`}
                              className={cn(
                                'flex items-center gap-3 rounded-lg border bg-white p-3.5 cursor-pointer transition-colors',
                                checked
                                  ? 'border-navy-700 bg-navy-50'
                                  : 'border-steel-200 hover:border-navy-300'
                              )}
                            >
                              <FormControl>
                                <Checkbox
                                  id={`partner-${option.value}`}
                                  checked={checked}
                                  onCheckedChange={(isChecked) => {
                                    const current = field.value ?? [];
                                    field.onChange(
                                      isChecked
                                        ? [...current, option.value]
                                        : current.filter(
                                            (v) => v !== option.value
                                          )
                                    );
                                  }}
                                />
                              </FormControl>
                              <span className="text-sm font-medium text-navy-900">
                                {option.label}
                              </span>
                            </label>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capabilitiesProvided"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Trades, services, or materials you provide
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="e.g. electrical rough-in and finish, structural concrete, aggregate supply"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceTerritory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Service territory
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Central Texas, statewide, within 200 miles of Houston"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection
          legend="Qualifications"
          description="All optional. Provide what applies to your company today."
        >
          <FormField
            control={form.control}
            name="naicsCodes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NAICS codes</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 236220, 238210" {...field} />
                </FormControl>
                <FormDescription>Separate multiple codes with commas.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="certifications"
            render={() => (
              <FormItem>
                <FormLabel>Certifications and classifications</FormLabel>
                <FormDescription>Select all that apply.</FormDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {CERTIFICATIONS.map((option) => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name="certifications"
                      render={({ field }) => {
                        const checked = field.value?.includes(option.value);
                        return (
                          <FormItem className="space-y-0">
                            <label
                              htmlFor={`cert-${option.value}`}
                              className={cn(
                                'flex items-center gap-3 rounded-lg border bg-white p-3 cursor-pointer transition-colors',
                                checked
                                  ? 'border-navy-700 bg-navy-50'
                                  : 'border-steel-200 hover:border-navy-300'
                              )}
                            >
                              <FormControl>
                                <Checkbox
                                  id={`cert-${option.value}`}
                                  checked={checked}
                                  onCheckedChange={(isChecked) => {
                                    const current = field.value ?? [];
                                    field.onChange(
                                      isChecked
                                        ? [...current, option.value]
                                        : current.filter(
                                            (v) => v !== option.value
                                          )
                                    );
                                  }}
                                />
                              </FormControl>
                              <span className="text-sm text-navy-900">
                                {option.label}
                              </span>
                            </label>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bondingCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bonding capacity</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BONDING_CAPACITY.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection legend="About your company">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tell us about your company
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Relevant experience, crew size or capacity, equipment, and any public-sector work you have performed."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length ?? 0} / 3,000 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FileAttachmentsField
            label="Capability statement"
            description="Attach your current capability statement or company profile."
            files={files}
            onChange={setFiles}
            maxFiles={2}
            disabled={form.formState.isSubmitting}
          />
        </FormSection>

        <FormSection legend="Consent">
          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-3 rounded-lg border border-steel-200 bg-steel-50 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium text-navy-900 leading-relaxed">
                      I agree that TX4 Contracting may store this information and
                      contact my company about potential work.
                      <RequiredMark />
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Submitting this form does not create a contract, teaming
                      agreement, or commitment to award work. See our{' '}
                      <a
                        href="/privacy"
                        className="underline underline-offset-2 hover:text-navy-900"
                      >
                        privacy policy
                      </a>
                      .
                    </FormDescription>
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
            )}
          />

          <div>
            <TurnstileWidget
              onVerify={(token) => {
                setTurnstileToken(token);
                setTurnstileError(false);
              }}
              onExpire={() => setTurnstileToken('')}
              onError={() => {
                setTurnstileToken('');
                setTurnstileError(true);
              }}
            />
            {turnstileError && (
              <p className="text-sm text-destructive" role="alert">
                The verification check could not load. Refresh the page and try
                again.
              </p>
            )}
          </div>
        </FormSection>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting || !canSubmit}
            className="bg-navy-900 text-white hover:bg-navy-800 font-semibold text-base px-8 h-12"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2
                  className="mr-2 h-5 w-5 animate-spin"
                  aria-hidden="true"
                />
                Submitting
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" aria-hidden="true" />
                Submit
              </>
            )}
          </Button>
          <p className="text-sm text-steel-600">
            Fields marked <span aria-hidden="true">*</span> are required.
          </p>
        </div>
      </form>
    </Form>
  );
}
