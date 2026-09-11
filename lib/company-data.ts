export const companyData = {
  name: 'TX4 Contracting',
  legalName: '',
  tagline: 'Government Projects. One Accountable Team.',
  description:
    'TX4 Contracting coordinates dependable project solutions for government agencies and prime contractors\u2014delivered safely, efficiently, and to specification.',
  website: 'https://tx4contracting.com',

  contact: {
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: 'TX',
      zip: '',
      country: 'US',
    },
  },

  serviceArea: 'Texas',

  procurement: {
    samRegistered: false,
    uei: '',
    cageCode: '',
    primaryNaics: '',
    naicsCodes: [] as string[],
    pscCodes: [] as string[],
    certifications: [] as string[],
    bondingCapacity: '',
    insuranceInfo: '',
  },

  social: {
    linkedin: '',
    facebook: '',
  },

  capabilityStatementUrl: '',
  notificationEmail: '',
  foundingYear: '',
} as const;

export type CompanyData = typeof companyData;

export function getVerifiedProcurement() {
  const p = companyData.procurement;
  const items: { label: string; value: string }[] = [];

  if (p.samRegistered) items.push({ label: 'SAM', value: 'Registered' });
  if (p.uei) items.push({ label: 'UEI', value: p.uei });
  if (p.cageCode) items.push({ label: 'CAGE', value: p.cageCode });
  if (p.primaryNaics) items.push({ label: 'NAICS', value: p.primaryNaics });
  if (p.certifications.length > 0)
    items.push({ label: 'Certifications', value: p.certifications.join(', ') });
  if (companyData.serviceArea)
    items.push({ label: 'Service Area', value: companyData.serviceArea });

  return items;
}
