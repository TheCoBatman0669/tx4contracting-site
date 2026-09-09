import { getPublishedProjects } from '@/lib/projects-data';
import { getPublishedInsights } from '@/lib/insights-data';

export interface NavItem {
  label: string;
  href: string;
  visibilityCheck?: () => boolean;
}

const allNavItems: NavItem[] = [
  { label: 'Capabilities', href: '/capabilities' },
  {
    label: 'Projects',
    href: '/projects',
    visibilityCheck: () => getPublishedProjects().length > 0,
  },
  { label: 'Government Contracting', href: '/government-contracting' },
  { label: 'Teaming', href: '/teaming' },
  {
    label: 'Insights',
    href: '/insights',
    visibilityCheck: () => getPublishedInsights().length > 0,
  },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function getMainNavItems(): NavItem[] {
  return allNavItems.filter((item) => !item.visibilityCheck || item.visibilityCheck());
}
