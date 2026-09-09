/**
 * Markets TX4 is positioned to serve. Used on the homepage grid and available
 * to any other page that needs the same list.
 *
 * These describe who TX4 sells to, not past performance. They imply no
 * completed contract with any of these buyer types.
 */

export interface Market {
  icon: string;
  label: string;
  description: string;
}

export const markets: Market[] = [
  {
    icon: 'Landmark',
    label: 'Federal',
    description:
      'Federal agencies and installations with construction and facility requirements.',
  },
  {
    icon: 'Building2',
    label: 'State',
    description:
      'State departments and agencies procuring construction services.',
  },
  {
    icon: 'MapPin',
    label: 'County & Municipal',
    description:
      'City, county, and special district construction and facility needs.',
  },
  {
    icon: 'Handshake',
    label: 'Prime Contractors',
    description:
      'Primes seeking a subcontractor or teaming partner on a government solicitation.',
  },
  {
    icon: 'Layers',
    label: 'Public Infrastructure',
    description:
      'Site, drainage, and infrastructure scopes supporting public assets.',
  },
  {
    icon: 'Siren',
    label: 'Emergency Response',
    description:
      'Agencies needing rapid mobilization after damage or service interruption.',
  },
];
