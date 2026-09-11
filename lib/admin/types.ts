/**
 * Types and display helpers for the admin queue.
 *
 * Column names mirror the database exactly (snake_case) so there is no mapping
 * layer to drift out of sync when the schema changes.
 */

export type InquiryStatus =
  | 'new'
  | 'reviewing'
  | 'qualified'
  | 'responded'
  | 'closed'
  | 'spam';

export type SubmissionKind = 'project_inquiry' | 'teaming';

export type InquiryEventType =
  | 'submission_received'
  | 'status_changed'
  | 'assigned'
  | 'file_downloaded'
  | 'note_added'
  | 'purged';

export interface InquiryRow {
  id: string;
  reference_number: string;
  submission_kind: SubmissionKind;
  status: InquiryStatus;

  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;

  inquiry_type: string | null;
  job_title: string | null;
  organization: string | null;
  agency_level: string | null;
  solicitation_number: string | null;
  contract_vehicle: string | null;
  relationship_description: string | null;
  capability: string | null;
  project_location: string | null;
  response_deadline: string | null;
  estimated_value_range: string | null;
  scope_summary: string | null;

  company_name: string | null;
  company_website: string | null;
  years_in_business: number | null;
  partner_types: string[] | null;
  capabilities_provided: string | null;
  service_territory: string | null;
  naics_codes: string | null;
  certifications: string[] | null;
  bonding_capacity: string | null;
  description: string | null;

  consent_at: string;
  source_page: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;

  spam_reasons: string[];
  assigned_to: string | null;
  reviewed_at: string | null;
  became_work: boolean;
  created_at: string;
  updated_at: string;
}

export interface InquiryFileRow {
  id: string;
  inquiry_id: string;
  storage_path: string;
  original_filename: string;
  sanitized_filename: string;
  mime_type: string;
  file_size: number;
  purged_at: string | null;
  created_at: string;
}

export interface InquiryEventRow {
  id: string;
  inquiry_id: string;
  event_type: InquiryEventType;
  actor_id: string | null;
  actor_label: string;
  detail: Record<string, unknown>;
  created_at: string;
}

export interface AdminUserRow {
  user_id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
}

export interface InquiryStats {
  total: number;
  new: number;
  reviewing: number;
  qualified: number;
  responded: number;
  closed: number;
  spam: number;
  unassigned_new: number;
  last_7_days: number;
  mine: number;
}

/* ----------------------------- display ----------------------------- */

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  qualified: 'Qualified',
  responded: 'Responded',
  closed: 'Closed',
  spam: 'Spam',
};

export const STATUS_ORDER: InquiryStatus[] = [
  'new',
  'reviewing',
  'qualified',
  'responded',
  'closed',
  'spam',
];

export const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: 'bg-navy-900 text-white',
  reviewing: 'bg-warning/15 text-warning-foreground border border-warning/40',
  qualified: 'bg-success/15 text-success border border-success/40',
  responded: 'bg-steel-200 text-navy-900',
  closed: 'bg-steel-100 text-steel-600',
  spam: 'bg-destructive/10 text-destructive border border-destructive/30',
};

export const KIND_LABELS: Record<SubmissionKind, string> = {
  project_inquiry: 'Project inquiry',
  teaming: 'Teaming',
};

export const INQUIRY_TYPE_LABELS: Record<string, string> = {
  government_buyer: 'Government buyer',
  prime_contractor: 'Prime contractor',
  other: 'Other',
};

export const EVENT_LABELS: Record<InquiryEventType, string> = {
  submission_received: 'Submission received',
  status_changed: 'Status changed',
  assigned: 'Assignment changed',
  file_downloaded: 'Attachment downloaded',
  note_added: 'Note added',
  purged: 'Data purged',
};

/** The name to show for a submission, whichever form it came from. */
export function displayOrganization(row: InquiryRow): string {
  return row.organization || row.company_name || '—';
}

export function displayName(row: InquiryRow): string {
  return `${row.first_name} ${row.last_name}`.trim();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDateTime(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/* ------------------------------- CSV ------------------------------- */

const CSV_COLUMNS: { key: keyof InquiryRow; label: string }[] = [
  { key: 'reference_number', label: 'Reference' },
  { key: 'created_at', label: 'Submitted' },
  { key: 'submission_kind', label: 'Form' },
  { key: 'status', label: 'Status' },
  { key: 'inquiry_type', label: 'Inquiry type' },
  { key: 'first_name', label: 'First name' },
  { key: 'last_name', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'job_title', label: 'Job title' },
  { key: 'organization', label: 'Organization' },
  { key: 'company_name', label: 'Company' },
  { key: 'agency_level', label: 'Agency level' },
  { key: 'solicitation_number', label: 'Solicitation' },
  { key: 'contract_vehicle', label: 'Contract vehicle' },
  { key: 'capability', label: 'Capability' },
  { key: 'project_location', label: 'Location' },
  { key: 'response_deadline', label: 'Deadline' },
  { key: 'estimated_value_range', label: 'Value range' },
  { key: 'scope_summary', label: 'Scope summary' },
  { key: 'partner_types', label: 'Partner types' },
  { key: 'capabilities_provided', label: 'Capabilities provided' },
  { key: 'service_territory', label: 'Service territory' },
  { key: 'naics_codes', label: 'NAICS' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'bonding_capacity', label: 'Bonding capacity' },
  { key: 'years_in_business', label: 'Years in business' },
  { key: 'description', label: 'Description' },
  { key: 'utm_source', label: 'UTM source' },
  { key: 'utm_medium', label: 'UTM medium' },
  { key: 'utm_campaign', label: 'UTM campaign' },
  { key: 'source_page', label: 'Source page' },
  { key: 'became_work', label: 'Became work' },
];

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const raw = Array.isArray(value) ? value.join('; ') : String(value);

  // Neutralise spreadsheet formula injection: a cell starting with one of
  // these is executed by Excel and Sheets when the file is opened.
  const guarded = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;

  return `"${guarded.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

export function inquiriesToCsv(rows: InquiryRow[]): string {
  const header = CSV_COLUMNS.map((c) => escapeCsv(c.label)).join(',');
  const body = rows
    .map((row) => CSV_COLUMNS.map((c) => escapeCsv(row[c.key])).join(','))
    .join('\n');
  return `${header}\n${body}`;
}

export function downloadCsv(filename: string, csv: string): void {
  // BOM so Excel opens UTF-8 correctly.
  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
