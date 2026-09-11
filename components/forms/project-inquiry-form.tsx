'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { FormSection, FormRow, RequiredMark } from '@/components/forms/form-section';
import { HoneypotField } from '@/components/forms/honeypot-field';
import { FileAttachmentsField } from '@/components/forms/file-attachments-field';
import { FormErrorSummary } from '@/components/forms/form-error-summary';
import { SubmissionSuccess } from '@/components/forms/submission-success';
import { TurnstileWidget } from '@/components/turnstile-widget';
import {
  projectInquirySchema,
  projectInquiryDefaults,
  type ProjectInquiryValues,
} from '@/lib/form-schemas';
import {
  INQUIRY_TYPES,
  AGENCY_LEVELS,
  VALUE_RANGES,
  getCapabilityOptions,
} from '@/lib/form-options';
import { captureAttribution } from '@/lib/attribution';
import {
  submitInquiry,
  createIdempotencyKey,
} from '@/lib/submission-client';
import { isTurnstileEnforced } from '@/lib/turnstile';
import { cn } from '@/lib/utils';

const NEXT_STEPS = [
  'A confirmation email is sent to the address you provided.',
  'TX4 reviews the requirement against current capability and capacity, usually within one to two business days.',
  'If the requirement is a fit, a member of the team contacts you to confirm scope, schedule, and any documentation needed.',
  'If it is not a fit, you receive a direct response so you can plan accordingly.',
];

export function ProjectInquiryForm() {
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
  const capabilityOptions = useMemo(() => getCapabilityOptions(), []);

  const form = useForm<ProjectInquiryValues>({
    resolver: zodResolver(projectInquirySchema),
    defaultValues: projectInquiryDefaults as ProjectInquiryValues,
    mode: 'onBlur',
  });

  // Timing check: submissions completed implausibly fast are almost always bots.
  useEffect(() => {
    form.setValue('formRenderedAt', Date.now());
  }, [form]);

  const inquiryType = form.watch('inquiryType');
  const isGovernmentBuyer = inquiryType === 'government_buyer';
  const isPrime = inquiryType === 'prime_contractor';
  const isOther = inquiryType === 'other';

  const fieldErrors = Object.entries(form.formState.errors)
    .filter(([, error]) => Boolean(error?.message))
    .map(([name, error]) => ({
      name,
      message: String(error?.message),
    }));

  const turnstileRequired = isTurnstileEnforced();
  const canSubmit = !turnstileRequired || Boolean(turnstileToken);

  const onSubmit = async (values: ProjectInquiryValues) => {
    setSubmitError(null);

    if (turnstileRequired && !turnstileToken) {
      setSubmitError(
        'Please complete the verification check before submitting.'
      );
      return;
    }

    const payload = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      payload.append(key, String(value));
    });

    const attribution = captureAttribution();
    Object.entries(attribution).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });

    payload.append('turnstileToken', turnstileToken);
    files.forEach((file) => payload.append('attachments', file, file.name));

    const response = await submitInquiry(
      'project_inquiry',
      payload,
      idempotencyKey.current
    );

    if (!response.ok || !response.referenceNumber) {
      setSubmitError(response.error ?? 'Something went wrong. Please try again.');
      // A new key on the next attempt, so a genuine retry is not deduplicated.
      idempotencyKey.current = createIdempotencyKey();
      setTurnstileToken('');
      return;
    }

    const capabilityLabel =
      capabilityOptions.find((o) => o.value === values.capability)?.label ??
      values.capability;

    setResult({
      referenceNumber: response.referenceNumber,
      preview: response.preview,
      summary: [
        { label: 'Organization', value: values.organization },
        { label: 'Capability', value: capabilityLabel },
        { label: 'Project location', value: values.projectLocation },
        ...(values.solicitationNumber
          ? [{ label: 'Solicitation', value: values.solicitationNumber }]
          : []),
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
    form.reset(projectInquiryDefaults as ProjectInquiryValues);
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
        title="Inquiry received"
        referenceNumber={result.referenceNumber}
        preview={result.preview}
        summary={result.summary}
        nextSteps={NEXT_STEPS}
        onReset={resetForm}
        resetLabel="Submit another inquiry"
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

        {/* Inquiry type drives which sections appear below */}
        <FormSection
          legend="About your inquiry"
          description="This determines which questions we ask next, so we only request what is relevant."
        >
          <FormField
            control={form.control}
            name="inquiryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Which best describes you?
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    className="gap-3 pt-1"
                  >
                    {INQUIRY_TYPES.map((type) => (
                      <label
                        key={type.value}
                        htmlFor={`inquiry-type-${type.value}`}
                        className={cn(
                          'flex gap-3 rounded-lg border bg-white p-4 cursor-pointer transition-colors',
                          field.value === type.value
                            ? 'border-navy-700 bg-navy-50 ring-1 ring-navy-700'
                            : 'border-steel-200 hover:border-navy-300'
                        )}
                      >
                        <RadioGroupItem
                          value={type.value}
                          id={`inquiry-type-${type.value}`}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="block text-sm font-medium text-navy-900">
                            {type.label}
                          </span>
                          <span className="block text-sm text-steel-600 mt-0.5">
                            {type.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        {/* Contact details */}
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

          <FormRow>
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isGovernmentBuyer ? 'Agency or department' : 'Organization'}
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input autoComplete="organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job title</FormLabel>
                  <FormControl>
                    <Input autoComplete="organization-title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormRow>

          {isOther && (
            <FormField
              control={form.control}
              name="relationshipDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    How are you involved with this project?
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. architect of record, program manager, property owner"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </FormSection>

        {/* Procurement context, only where it applies */}
        {(isGovernmentBuyer || isPrime) && (
          <FormSection
            legend="Procurement details"
            description="Optional, but it helps us respond with the right information the first time."
          >
            {isGovernmentBuyer && (
              <FormField
                control={form.control}
                name="agencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Level of government
                      <RequiredMark />
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AGENCY_LEVELS.map((option) => (
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
            )}

            <FormRow>
              <FormField
                control={form.control}
                name="solicitationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isPrime
                        ? 'Solicitation or prime contract number'
                        : 'Solicitation or contract number'}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank if the requirement has not been posted yet.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contractVehicle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract vehicle</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. IDIQ, BPA, GSA schedule, open market"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormRow>
          </FormSection>
        )}

        {/* Project */}
        <FormSection legend="Project details">
          <FormRow>
            <FormField
              control={form.control}
              name="capability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Capability needed
                    <RequiredMark />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a capability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {capabilityOptions.map((option) => (
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
            <FormField
              control={form.control}
              name="projectLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Project location
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="City, State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormRow>

          <FormRow>
            <FormField
              control={form.control}
              name="responseDeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response deadline</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    If there is a hard due date, we will prioritise accordingly.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedValueRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated value range</FormLabel>
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
                      {VALUE_RANGES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Optional. A rough band is enough.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormRow>

          <FormField
            control={form.control}
            name="scopeSummary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Scope summary
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={6}
                    placeholder="Describe the work, the facility or site, and anything that affects how it has to be delivered."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length ?? 0} / 4,000 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FileAttachmentsField
            label="Attachments"
            description="Statement of work, drawings, specifications, or the solicitation itself."
            files={files}
            onChange={setFiles}
            disabled={form.formState.isSubmitting}
          />
        </FormSection>

        {/* Consent and verification */}
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
                      I agree that TX4 Contracting may store this inquiry and any
                      attachments in order to respond to it.
                      <RequiredMark />
                    </FormLabel>
                    <FormDescription className="text-xs">
                      See our{' '}
                      <a
                        href="/privacy"
                        className="underline underline-offset-2 hover:text-navy-900"
                      >
                        privacy policy
                      </a>{' '}
                      for how submissions are handled and retained.
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
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                Submitting
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" aria-hidden="true" />
                Submit inquiry
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
