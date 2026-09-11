/**
 * Attribution capture.
 *
 * Collected in the browser and sent with the submission so the admin queue can
 * report on lead source. Read from window rather than useSearchParams so that
 * statically rendered pages do not need a Suspense boundary.
 *
 * Nothing here is personal data. Do not add anything that identifies the
 * visitor.
 */

export interface Attribution {
  sourcePage: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
}

const EMPTY_ATTRIBUTION: Attribution = {
  sourcePage: '',
  referrer: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmTerm: '',
  utmContent: '',
};

const STORAGE_KEY = 'tx4:attribution';

function readParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    utmSource: params.get('utm_source') ?? '',
    utmMedium: params.get('utm_medium') ?? '',
    utmCampaign: params.get('utm_campaign') ?? '',
    utmTerm: params.get('utm_term') ?? '',
    utmContent: params.get('utm_content') ?? '',
  };
}

/**
 * Captures attribution for the current page view. UTM values are persisted for
 * the session, so a visitor who lands on a campaign URL and navigates to the
 * form still carries the original source.
 */
export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return EMPTY_ATTRIBUTION;

  const current = readParams(window.location.search);
  const hasCurrentUtm = Object.values(current).some(Boolean);

  let stored: Partial<Attribution> = {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Partial<Attribution>;
  } catch {
    // sessionStorage can be unavailable in private modes. Attribution is
    // optional, so failing here must never block a submission.
  }

  const utm = hasCurrentUtm
    ? current
    : {
        utmSource: stored.utmSource ?? '',
        utmMedium: stored.utmMedium ?? '',
        utmCampaign: stored.utmCampaign ?? '',
        utmTerm: stored.utmTerm ?? '',
        utmContent: stored.utmContent ?? '',
      };

  const attribution: Attribution = {
    sourcePage: window.location.pathname,
    // Only keep the referring origin + path, never its query string.
    referrer: stripQuery(document.referrer),
    ...utm,
  };

  if (hasCurrentUtm) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
    } catch {
      // Non-fatal, see above.
    }
  }

  return attribution;
}

function stripQuery(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return '';
  }
}
