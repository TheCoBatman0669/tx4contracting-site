'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Search,
  Download,
  RefreshCw,
  ArrowUpDown,
  X,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdmin } from '@/components/admin/admin-provider';
import { getCapabilityOptions } from '@/lib/form-options';
import {
  type InquiryRow,
  type InquiryStats,
  type AdminUserRow,
  type InquiryStatus,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_STYLES,
  KIND_LABELS,
  displayName,
  displayOrganization,
  formatDateTime,
  inquiriesToCsv,
  downloadCsv,
} from '@/lib/admin/types';
import { cn } from '@/lib/utils';

type SortKey = 'created_at' | 'status' | 'organization';

const ALL = 'all';

export function InquiryQueue() {
  const { supabase, userId } = useAdmin();

  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [admins, setAdmins] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<string>(ALL);
  const [kind, setKind] = useState<string>(ALL);
  const [capability, setCapability] = useState<string>(ALL);
  const [assignee, setAssignee] = useState<string>(ALL);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  const capabilityOptions = useMemo(() => getCapabilityOptions(), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [inquiryResult, statsResult, adminResult] = await Promise.all([
      supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000),
      supabase.rpc('admin_inquiry_stats'),
      supabase
        .from('admin_users')
        .select('user_id, email, full_name, is_active')
        .eq('is_active', true),
    ]);

    if (inquiryResult.error) {
      setError('Could not load the inquiry queue. Try refreshing.');
      setLoading(false);
      return;
    }

    setRows((inquiryResult.data ?? []) as InquiryRow[]);
    if (!statsResult.error) setStats(statsResult.data as InquiryStats);
    if (!adminResult.error) setAdmins((adminResult.data ?? []) as AdminUserRow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

    const result = rows.filter((row) => {
      // Spam is hidden unless explicitly asked for, so a flood of it never
      // buries real submissions.
      if (status === ALL ? row.status === 'spam' : row.status !== status) {
        return false;
      }
      if (kind !== ALL && row.submission_kind !== kind) return false;
      if (capability !== ALL && row.capability !== capability) return false;
      if (assignee === 'unassigned' && row.assigned_to) return false;
      if (assignee === 'mine' && row.assigned_to !== userId) return false;
      if (
        assignee !== ALL &&
        assignee !== 'unassigned' &&
        assignee !== 'mine' &&
        row.assigned_to !== assignee
      ) {
        return false;
      }

      const created = new Date(row.created_at);
      if (from && created < from) return false;
      if (to && created > to) return false;

      if (term) {
        const haystack = [
          row.reference_number,
          row.organization,
          row.company_name,
          row.first_name,
          row.last_name,
          row.email,
          row.solicitation_number,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      let compare = 0;
      if (sortKey === 'created_at') {
        compare = a.created_at.localeCompare(b.created_at);
      } else if (sortKey === 'status') {
        compare =
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      } else {
        compare = displayOrganization(a).localeCompare(displayOrganization(b));
      }
      return sortAsc ? compare : -compare;
    });

    return result;
  }, [
    rows,
    status,
    kind,
    capability,
    assignee,
    fromDate,
    toDate,
    search,
    sortKey,
    sortAsc,
    userId,
  ]);

  const hasFilters =
    status !== ALL ||
    kind !== ALL ||
    capability !== ALL ||
    assignee !== ALL ||
    Boolean(fromDate) ||
    Boolean(toDate) ||
    Boolean(search.trim());

  const clearFilters = () => {
    setStatus(ALL);
    setKind(ALL);
    setCapability(ALL);
    setAssignee(ALL);
    setFromDate('');
    setToDate('');
    setSearch('');
  };

  const exportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`tx4-inquiries-${stamp}.csv`, inquiriesToCsv(filtered));
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const adminEmail = (id: string | null) =>
    id ? admins.find((a) => a.user_id === id)?.email ?? 'Unknown' : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Inquiries
          </h1>
          <p className="mt-1 text-sm text-steel-600">
            Every submission from the project inquiry and teaming forms.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            className="border-steel-300 text-navy-900 hover:bg-white"
          >
            <RefreshCw
              className={cn('mr-1.5 h-4 w-4', loading && 'animate-spin')}
              aria-hidden="true"
            />
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="bg-navy-900 text-white hover:bg-navy-800"
          >
            <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="New" value={stats.new} emphasis />
          <StatCard label="Unassigned new" value={stats.unassigned_new} />
          <StatCard label="Assigned to me" value={stats.mine} />
          <StatCard label="Last 7 days" value={stats.last_7_days} />
          <StatCard label="Spam caught" value={stats.spam} muted />
        </div>
      )}

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

      {/* Filters */}
      <div className="rounded-xl border border-steel-200 bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="queue-search">Search</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400"
                aria-hidden="true"
              />
              <Input
                id="queue-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Reference, organization, name, email"
                className="pl-9"
              />
            </div>
          </div>

          <FilterSelect
            id="queue-status"
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: ALL, label: 'All except spam' },
              ...STATUS_ORDER.map((s) => ({
                value: s,
                label: STATUS_LABELS[s],
              })),
            ]}
          />

          <FilterSelect
            id="queue-kind"
            label="Form"
            value={kind}
            onChange={setKind}
            options={[
              { value: ALL, label: 'Both forms' },
              { value: 'project_inquiry', label: 'Project inquiry' },
              { value: 'teaming', label: 'Teaming' },
            ]}
          />

          <FilterSelect
            id="queue-assignee"
            label="Assignment"
            value={assignee}
            onChange={setAssignee}
            options={[
              { value: ALL, label: 'Anyone' },
              { value: 'mine', label: 'Assigned to me' },
              { value: 'unassigned', label: 'Unassigned' },
              ...admins.map((a) => ({ value: a.user_id, label: a.email })),
            ]}
          />

          <FilterSelect
            id="queue-capability"
            label="Capability"
            value={capability}
            onChange={setCapability}
            options={[
              { value: ALL, label: 'Any capability' },
              ...capabilityOptions,
            ]}
          />

          <div className="space-y-1.5">
            <Label htmlFor="queue-from">Submitted from</Label>
            <Input
              id="queue-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="queue-to">Submitted to</Label>
            <Input
              id="queue-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-sm text-steel-600" aria-live="polite">
            {loading
              ? 'Loading…'
              : `${filtered.length} of ${rows.length} submissions`}
          </p>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-navy-700 hover:text-navy-900"
            >
              <X className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2
            className="h-6 w-6 animate-spin text-navy-700"
            aria-hidden="true"
          />
          <span className="sr-only">Loading inquiries</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-steel-300 bg-white py-16 text-center">
          <Inbox
            className="mx-auto h-8 w-8 text-steel-400 mb-3"
            aria-hidden="true"
          />
          <p className="text-steel-600">
            {rows.length === 0
              ? 'No submissions yet.'
              : 'No submissions match these filters.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-steel-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Submitted inquiries, sortable by date, status, and organization
              </caption>
              <thead className="bg-steel-50 border-b border-steel-200">
                <tr>
                  <SortHeader
                    label="Submitted"
                    active={sortKey === 'created_at'}
                    asc={sortAsc}
                    onClick={() => toggleSort('created_at')}
                  />
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-900">
                    Reference
                  </th>
                  <SortHeader
                    label="Organization"
                    active={sortKey === 'organization'}
                    asc={sortAsc}
                    onClick={() => toggleSort('organization')}
                  />
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-900">
                    Contact
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-900">
                    Form
                  </th>
                  <SortHeader
                    label="Status"
                    active={sortKey === 'status'}
                    asc={sortAsc}
                    onClick={() => toggleSort('status')}
                  />
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-navy-900">
                    Assigned
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-steel-50 transition-colors">
                    <td className="px-4 py-3 text-steel-600 whitespace-nowrap">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/inquiries/${row.id}`}
                        className="font-mono font-medium text-navy-700 underline underline-offset-2 hover:text-navy-900"
                      >
                        {row.reference_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900 max-w-[220px] truncate">
                      {displayOrganization(row)}
                    </td>
                    <td className="px-4 py-3 text-steel-600 max-w-[200px] truncate">
                      {displayName(row)}
                    </td>
                    <td className="px-4 py-3 text-steel-600 whitespace-nowrap">
                      {KIND_LABELS[row.submission_kind]}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-steel-600 max-w-[180px] truncate">
                      {adminEmail(row.assigned_to) ?? (
                        <span className="text-steel-400">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ pieces ------------------------------ */

function StatCard({
  label,
  value,
  emphasis = false,
  muted = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        emphasis
          ? 'border-navy-900 bg-navy-900'
          : muted
            ? 'border-steel-200 bg-steel-50'
            : 'border-steel-200 bg-white'
      )}
    >
      <p
        className={cn(
          'text-xs font-semibold uppercase tracking-wider',
          emphasis ? 'text-steel-300' : 'text-steel-500'
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-2xl font-bold',
          emphasis ? 'text-white' : 'text-navy-900'
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function SortHeader({
  label,
  active,
  asc,
  onClick,
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
}) {
  return (
    <th
      scope="col"
      className="px-4 py-3 text-left font-semibold text-navy-900"
      aria-sort={active ? (asc ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 hover:text-navy-700"
      >
        {label}
        <ArrowUpDown
          className={cn('h-3.5 w-3.5', active ? 'text-navy-700' : 'text-steel-400')}
          aria-hidden="true"
        />
      </button>
    </th>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
