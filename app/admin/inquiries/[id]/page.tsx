import { InquiryDetail } from '@/components/admin/inquiry-detail';

// Submissions are fetched in the browser with the administrator's own session,
// so this route must never be prerendered or cached at build time.
export const dynamic = 'force-dynamic';

export default function AdminInquiryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <InquiryDetail inquiryId={params.id} />;
}
