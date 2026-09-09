import { getPublishedCapabilities } from '@/lib/capabilities-data';

/**
 * Option lists shared by the submission forms. Values are the stable strings
 * written to the database; labels are what the visitor sees. Do not change a
 * value once submissions exist against it without a matching data migration.
 */

export interface Option {
  value: string;
  label: string;
}

export const INQUIRY_TYPES = [
  {
    value: 'government_buyer',
    label: 'Government buyer or contracting officer',
    description:
      'A federal, state, county, or municipal agency with a project requirement.',
  },
  {
    value: 'prime_contractor',
    label: 'Prime contractor',
    description:
      'A prime seeking a subcontractor or teaming partner on a solicitation.',
  },
  {
    value: 'other',
    label: 'Something else',
    description: 'Any other project or contract-related inquiry.',
  },
] as const;

export type InquiryTypeValue = (typeof INQUIRY_TYPES)[number]['value'];

export const AGENCY_LEVELS: Option[] = [
  { value: 'federal', label: 'Federal' },
  { value: 'state', label: 'State' },
  { value: 'county', label: 'County' },
  { value: 'municipal', label: 'Municipal or city' },
  { value: 'special_district', label: 'Special district or authority' },
  { value: 'other', label: 'Other public entity' },
];

export const VALUE_RANGES: Option[] = [
  { value: 'under_100k', label: 'Under $100,000' },
  { value: '100k_500k', label: '$100,000 - $500,000' },
  { value: '500k_1m', label: '$500,000 - $1 million' },
  { value: '1m_5m', label: '$1 million - $5 million' },
  { value: 'over_5m', label: 'Over $5 million' },
  { value: 'undetermined', label: 'Not yet determined' },
];

export const PARTNER_TYPES: Option[] = [
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'specialty_contractor', label: 'Specialty trade contractor' },
  { value: 'supplier', label: 'Material supplier' },
  { value: 'equipment_vendor', label: 'Equipment vendor' },
  { value: 'prime_contractor', label: 'Prime contractor seeking a teaming partner' },
  { value: 'professional_services', label: 'Professional or technical services' },
];

export const CERTIFICATIONS: Option[] = [
  { value: 'sba_8a', label: 'SBA 8(a)' },
  { value: 'hubzone', label: 'HUBZone' },
  { value: 'sdvosb', label: 'SDVOSB / VOSB' },
  { value: 'wosb', label: 'WOSB / EDWOSB' },
  { value: 'sdb', label: 'Small Disadvantaged Business' },
  { value: 'small_business', label: 'Small Business (SBA size standard)' },
  { value: 'tx_hub', label: 'Texas HUB' },
  { value: 'mbe_wbe', label: 'MBE / WBE' },
  { value: 'none', label: 'None currently held' },
];

export const BONDING_CAPACITY: Option[] = [
  { value: 'none', label: 'Not currently bonded' },
  { value: 'under_500k', label: 'Up to $500,000' },
  { value: '500k_1m', label: '$500,000 - $1 million' },
  { value: '1m_5m', label: '$1 million - $5 million' },
  { value: 'over_5m', label: 'Over $5 million' },
];

/**
 * Capability choices are derived from published capabilities so the form never
 * offers a service TX4 has not confirmed it performs.
 */
export function getCapabilityOptions(): Option[] {
  const options: Option[] = getPublishedCapabilities().map((c) => ({
    value: c.slug,
    label: c.title,
  }));
  options.push({
    value: 'not_sure',
    label: 'Not sure / multiple capabilities',
  });
  return options;
}
