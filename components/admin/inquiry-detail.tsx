'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Download,
  FileText,
  AlertCircle,
  Clock,
  ShieldAlert,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdmin } from '@/components/admin/admin-provider';
import { StatusBadge } from '@/components/admin/inquiry-queue';
import { getCapabilityOptions } from '@/lib/form-options';
import {
  type InquiryRow,
  type InquiryFileRow,
  type InquiryEventRow,
  type AdminUserRow,
  type InquiryStatus,
  STATUS_LABELS,
  STATUS_ORDER,
  KIND_LABELS,
  INQUIRY_TYPE_LABELS,
  EVENT_LABELS,
  displayName,
  displayOrganization,
  formatBytes,
  formatDate,
  formatDateTime,
} from '@/lib/admin/types';

const UNASSIGNED = 'unassigned';

export function InquiryDetail({ inquiryId }: { inquiryId: string }) {
  const { supabase, userId } = useAdmin();

  const [inquiry, setInquiry] = useState<InquiryRow | null>(null);
  const [files, setFiles] = useState<InquiryFileRow[]>([]);
  const [events, setEvents] = useState<InquiryEventRow[]>([]);
  const [admins, setAdmins] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setError(null);

    const [inquiryResult, fileResult, eventResult, adminResult] =
      await Promise.all([
        supabase.from('inquiries').select('*').eq('id', inquiryId).maybeSingle(),
        supabase
          .from('inquiry_files')
          .select('*')
          .eq('inquiry_id', inquiryId)
          .order('created_at'),
        supabase
          .from('inquiry_events')
          .select('*')
          .eq('inquiry_id', inquiryId)
          .order('created_at', { ascending: false }),
        supabase
          .from('admin_users')
          .select('user_id, email, full_name, is_active')
          .eq('is_active', true),
      ]);

    if (inquiryResult.error || !inquiryResult.data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setInquiry(inquiryResult.data as InquiryRow);
    setFiles((fileResult.data ?? []) as InquiryFileRow[]);
    setEvents((eventResult.data ?? []) as InquiryEventRow[]);
    setAdmins((adminResult.data ?? []) as AdminUserRow[]);
    setLoading(false);
  }, [supabase, inquiryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (
    action: () => Promise<{ error: unknown }>,
    failureMessage: string
  ) => {
    setBusy(true);
    setError(null);
    const { error: actionError } = await action();
    setBusy(false);
    if (actionError) {
      setError(failureMessage);
      return false;
    }
    await load();
    return true;
  };

  const changeStatus = (next: InquiryStatus) =>
    runAction(
      () =>
        supabase.rpc('admin_set_inquiry_status', {
          p_inquiry_id: inquiryId,
          p_status: next,
        }),
      'The status could not be updated.'
    );

  const changeAssignee = (value: string) =>
    runAction(
      () =>
        supabase.rpc('admin_assign_inquiry', {
          p_inquiry_id: inquiryId,
          p_assignee: value === UNASSIGNED ? null : value,
        }),
      'The assignment could not be updated.'
    );

  const toggleBecameWork = (value: boolean) =>
    runAction(
      () =>
        supabase.rpc('admin_set_became_work', {
          p_inquiry_id: inquiryId,
          p_value: value,
        }),
      'That change could not be saved.'
    );

  const addNote = async () => {
    if (!note.trim()) return;
    const ok = await runAction(
      () =>
        supabase.rpc('admin_add_note', {
          p_inquiry_id: inquiryId,
          p_note: note.trim(),
        }),
      'The note could not be saved.'
    );
    if (ok) setNote('');
  };

  /**
   * Attachments live in a private bucket. Nothing here is a public URL: we
   * mint a two-minute signed link at click time, record who asked for it, then
   * open it. The link expires long before it could usefully be shared.
   */
  const downloadFile = async (file: InquiryFileRow) => {
    setBusy(true);
    setError(null);

    await supabase.rpc('admin_log_file_download', {
      p_inquiry_id: inquiryId,
      p_file_id: file.id,
    });

    const { data, error: signError } = await supabase.storage
      .from('inquiry-attachments')
      .createSignedUrl(file.storage_path, 120, {
        download: file.original_filename,
      });

    setBusy(false);

    if (signError || !data?.signedUrl) {
      setError('That attachment could not be opened. It may have been purged.');
      return;
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    void load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-navy-700" aria-hidden="true" />
        <span className="sr-only">Loading inquiry</span>
      </div>
    );
  }

  if (notFound || !inquiry) {
    return (
      <div className="rounded-xl border border-steel-200 bg-white p-10 text-center">
        <h1 className="text-xl font-bold text-navy-900 mb-2">
          Inquiry not found
        </h1>
        <p className="text-sm text-steel-600 mb-6">
          It may have been purged under the retention schedule.
        </p>
        <Button asChild variant="outline" className="border-navy-300 text-navy-900">
          <Link href="/admin/inquiries">Back to the queue</Link>
        </Button>
      </div>
    );
  }

  const isProject = inquiry.submission_kind === 'project_inquiry';
  const capabilityLabel =
    getCapabilityOptions().find((c) => c.value === inquiry.capability)?.label ??
    inquiry.capability;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inquiries"
        className="inline-flex items-center gap-1.5 text-sm text-navy-700 hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to the queue
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-steel-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <StatusBadge status={inquiry.status} />
              <span className="text-xs font-semibold uppercase tracking-wider text-steel-500">
                {KIND_LABELS[inquiry.submission_kind]}
              </span>
              {inquiry.became_work && (
                <span className="inline-flex items-center rounded-full bg-success/15 text-success border border-success/40 px-2.5 py-0.5 text-xs font-semibold">
                  Became work
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
              {displayOrganization(inquiry)}
            </h1>
            <p className="mt-1 font-mono text-sm text-steel-600">
              {inquiry.reference_number}
            </p>
          </div>
          <div className="text-sm text-steel-600 text-right">
            <p className="flex items-center gap-1.5 justify-end">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {formatDateTime(inquiry.created_at)}
            </p>
          </div>
        </div>

        {inquiry.spam_reasons.length > 0 && (
          <div className="mt-5 flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
            <ShieldAlert
              className="h-5 w-5 shrink-0 text-warning mt-0.5"
              aria-hidden="true"
            />
            <div className="text-sm text-navy-900">
              <p className="font-medium">
                Flagged automatically: {inquiry.spam_reasons.join(', ')}
              </p>
              <p className="mt-0.5 text-steel-600">
                Spam flags are heuristics and can be wrong. Read it before
                deciding, and set the status to New if it is legitimate.
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4"
        >
          <AlertCircle
            className="h-5 w-5 shrink-0 text-destructive mt-0.5"
            aria-hidden="true"
          />
          <p className="text-sm text-navy-900">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: submission content */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Contact">
            <FieldGrid
              fields={[
                { label: 'Name', value: displayName(inquiry) },
                { label: 'Job title', value: inquiry.job_title },
                {
                  label: 'Email',
                  value: inquiry.email,
                  href: `mailto:${inquiry.email}`,
                  icon: <Mail className="h-3.5 w-3.5" aria-hidden="true" />,
                },
                {
                  label: 'Phone',
                  value: inquiry.phone,
                  href: inquiry.phone ? `tel:${inquiry.phone}` : undefined,
                  icon: <Phone className="h-3.5 w-3.5" aria-hidden="true" />,
                },
              ]}
            />
          </Panel>

          {isProject ? (
            <>
              <Panel title="Procurement">
                <FieldGrid
                  fields={[
                    {
                      label: 'Inquiry type',
                      value:
                        INQUIRY_TYPE_LABELS[inquiry.inquiry_type ?? ''] ??
                        inquiry.inquiry_type,
                    },
                    { label: 'Agency level', value: inquiry.agency_level },
                    {
                      label: 'Solicitation',
                      value: inquiry.solicitation_number,
                    },
                    { label: 'Contract vehicle', value: inquiry.contract_vehicle },
                    {
                      label: 'How involved',
                      value: inquiry.relationship_description,
                    },
                  ]}
                />
              </Panel>

              <Panel title="Project">
                <FieldGrid
                  fields={[
                    { label: 'Capability', value: capabilityLabel },
                    { label: 'Location', value: inquiry.project_location },
                    {
                      label: 'Response deadline',
                      value: formatDate(inquiry.response_deadline),
                    },
                    {
                      label: 'Estimated value',
                      value: inquiry.estimated_value_range,
                    },
                  ]}
                />
                <LongText label="Scope summary" value={inquiry.scope_summary} />
              </Panel>
            </>
          ) : (
            <Panel title="Company">
              <FieldGrid
                fields={[
                  { label: 'Company', value: inquiry.company_name },
                  {
                    label: 'Website',
                    value: inquiry.company_website,
                    // rel prevents the target page reading window.opener.
                    href: inquiry.company_website
                      ? normaliseUrl(inquiry.company_website)
                      : undefined,
                  },
                  {
                    label: 'Years in business',
                    value: inquiry.years_in_business?.toString(),
                  },
                  {
                    label: 'Partner types',
                    value: inquiry.partner_types?.join(', '),
                  },
                  { label: 'Service territory', value: inquiry.service_territory },
                  { label: 'NAICS codes', value: inquiry.naics_codes },
                  {
                    label: 'Certifications',
                    value: inquiry.certifications?.join(', '),
                  },
                  { label: 'Bonding capacity', value: inquiry.bonding_capacity },
                ]}
              />
              <LongText
                label="Capabilities provided"
                value={inquiry.capabilities_provided}
              />
              <LongText label="About the company" value={inquiry.description} />
            </Panel>
          )}

          <Panel title={`Attachments (${files.length})`}>
            {files.length === 0 ? (
              <p className="text-sm text-steel-500">No attachments.</p>
            ) : (
              <ul className="space-y-2">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg border border-steel-200 bg-steel-50 px-4 py-3"
                  >
                    <FileText
                      className="h-4 w-4 shrink-0 text-steel-500"
                      aria-hidden="true"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-sm font-medium text-navy-900">
                        {file.original_filename}
                      </span>
                      <span className="block text-xs text-steel-500">
                        {formatBytes(file.file_size)}
                        {file.purged_at ? ' · purged' : ''}
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy || Boolean(file.purged_at)}
                      onClick={() => void downloadFile(file)}
                      className="shrink-0 border-steel-300 text-navy-900 hover:bg-white"
                    >
                      <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Download
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-steel-500">
              Downloads use links that expire after two minutes and are recorded
              in the history below.
            </p>
          </Panel>

          <Panel title="Source">
            <FieldGrid
              fields={[
                { label: 'Submitted from', value: inquiry.source_page },
                { label: 'Referrer', value: inquiry.referrer },
                { label: 'UTM source', value: inquiry.utm_source },
                { label: 'UTM medium', value: inquiry.utm_medium },
                { label: 'UTM campaign', value: inquiry.utm_campaign },
                {
                  label: 'Consent given',
                  value: formatDateTime(inquiry.consent_at),
                },
              ]}
            />
          </Panel>
        </div>

        {/* Right: workflow */}
        <div className="space-y-6">
          <Panel title="Workflow">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="detail-status">Status</Label>
                <Select
                  value={inquiry.status}
                  onValueChange={(v) => void changeStatus(v as InquiryStatus)}
                >
                  <SelectTrigger id="detail-status" disabled={busy}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="detail-assignee">Assigned to</Label>
                <Select
                  value={inquiry.assigned_to ?? UNASSIGNED}
                  onValueChange={(v) => void changeAssignee(v)}
                >
                  <SelectTrigger id="detail-assignee" disabled={busy}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                    {admins.map((a) => (
                      <SelectItem key={a.user_id} value={a.user_id}>
                        {a.email}
                        {a.user_id === userId ? ' (you)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 rounded-lg border border-steel-200 bg-steel-50 p-3">
                <Checkbox
                  id="detail-became-work"
                  checked={inquiry.became_work}
                  disabled={busy}
                  onCheckedChange={(v) => void toggleBecameWork(v === true)}
                  className="mt-0.5"
                />
                <div>
                  <Label
                    htmlFor="detail-became-work"
                    className="text-sm font-medium text-navy-900"
                  >
                    This became work
                  </Label>
                  <p className="mt-0.5 text-xs text-steel-600">
                    Keeps the record for 7 years as a contract record instead of
                    the usual 24 months.
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Add an internal note">
            <div className="space-y-3">
              <Label htmlFor="detail-note" className="sr-only">
                Internal note
              </Label>
              <Textarea
                id="detail-note"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Visible to administrators only."
              />
              <Button
                type="button"
                size="sm"
                disabled={busy || !note.trim()}
                onClick={() => void addNote()}
                className="bg-navy-900 text-white hover:bg-navy-800"
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                Save note
              </Button>
            </div>
          </Panel>

          <Panel title="History">
            <ol className="space-y-4">
              {events.map((event) => (
                <li key={event.id} className="text-sm">
                  <p className="font-medium text-navy-900">
                    {EVENT_LABELS[event.event_type]}
                  </p>
                  <p className="text-xs text-steel-500">
                    {event.actor_label} · {formatDateTime(event.created_at)}
                  </p>
                  <EventDetail event={event} />
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ pieces ------------------------------ */

function normaliseUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-steel-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-steel-500 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FieldGrid({
  fields,
}: {
  fields: {
    label: string;
    value?: string | null;
    href?: string;
    icon?: React.ReactNode;
  }[];
}) {
  const present = fields.filter((f) => f.value && f.value !== '—');
  if (present.length === 0) {
    return <p className="text-sm text-steel-500">Nothing provided.</p>;
  }

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
      {present.map((field) => (
        <div key={field.label}>
          <dt className="text-xs font-medium text-steel-500">{field.label}</dt>
          <dd className="mt-0.5 text-sm text-navy-900 break-words">
            {field.href ? (
              <a
                href={field.href}
                target={field.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-navy-700 underline underline-offset-2 hover:text-navy-900"
              >
                {field.icon}
                {field.value}
              </a>
            ) : (
              field.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function LongText({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="mt-5 pt-5 border-t border-steel-100">
      <p className="text-xs font-medium text-steel-500 mb-1.5">{label}</p>
      <p className="text-sm text-navy-900 whitespace-pre-wrap leading-relaxed">
        {value}
      </p>
    </div>
  );
}

function EventDetail({ event }: { event: InquiryEventRow }) {
  const detail = event.detail ?? {};

  if (event.event_type === 'note_added' && typeof detail.note === 'string') {
    return (
      <p className="mt-1.5 rounded-md bg-steel-50 border border-steel-200 p-3 text-sm text-navy-900 whitespace-pre-wrap">
        {detail.note}
      </p>
    );
  }

  if (event.event_type === 'status_changed') {
    return (
      <p className="mt-0.5 text-xs text-steel-600">
        {String(detail.from ?? '?')} → {String(detail.to ?? '?')}
      </p>
    );
  }

  if (event.event_type === 'assigned') {
    return (
      <p className="mt-0.5 text-xs text-steel-600">
        {detail.assignee_email
          ? `Assigned to ${String(detail.assignee_email)}`
          : 'Unassigned'}
      </p>
    );
  }

  if (event.event_type === 'file_downloaded' && detail.filename) {
    return (
      <p className="mt-0.5 text-xs text-steel-600">
        {String(detail.filename)}
      </p>
    );
  }

  if (event.event_type === 'submission_received') {
    return (
      <p className="mt-0.5 text-xs text-steel-600">
        {Number(detail.attachment_count ?? 0)} attachment
        {Number(detail.attachment_count ?? 0) === 1 ? '' : 's'}
      </p>
    );
  }

  return null;
}
