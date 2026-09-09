/**
 * Past-performance content model.
 *
 * Nothing is published here yet. Do not add a project until TX4 has confirmed
 * the facts AND has permission to publish the customer, location, and scope.
 * Use `confidential: true` for work that can be referenced only in a
 * qualification conversation, and `published: false` for drafts.
 *
 * Both /projects and /projects/[slug] render from this file, so adding a case
 * study requires no layout work.
 */

export type ProjectMarket =
  | 'Federal'
  | 'State'
  | 'County & Municipal'
  | 'Prime Contractor'
  | 'Public Infrastructure'
  | 'Emergency Response';

export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface Project {
  slug: string;
  name: string;
  /** e.g. "Facility Renovation", "Site Improvements" */
  projectType: string;
  market: ProjectMarket;
  /** Category only, never a named customer without written permission */
  customerCategory: string;
  location: string;
  /** Role TX4 held, e.g. "Prime Contractor", "Subcontractor" */
  role: string;
  scope: string;
  outcome: string;
  summary: string;
  /** ISO date (YYYY-MM-DD) or empty when not confirmed */
  completionDate: string;
  /** Capability slugs this project demonstrates, for internal linking */
  relatedCapabilities: string[];
  highlights: string[];
  featuredImage: string;
  featuredImageAlt: string;
  gallery: ProjectImage[];
  confidential: boolean;
  published: boolean;
}

export const projects: Project[] = [];

export function getPublishedProjects(): Project[] {
  return projects.filter((p) => p.published && !p.confidential);
}

export function getProjectBySlug(slug: string): Project | null {
  return (
    projects.find((p) => p.slug === slug && p.published && !p.confidential) ??
    null
  );
}

export function getRelatedProjects(project: Project, limit = 3): Project[] {
  return getPublishedProjects()
    .filter((p) => p.slug !== project.slug)
    .filter(
      (p) =>
        p.market === project.market ||
        p.projectType === project.projectType ||
        p.relatedCapabilities.some((c) =>
          project.relatedCapabilities.includes(c)
        )
    )
    .slice(0, limit);
}

export function getProjectsForCapability(
  capabilitySlug: string,
  limit = 3
): Project[] {
  return getPublishedProjects()
    .filter((p) => p.relatedCapabilities.includes(capabilitySlug))
    .slice(0, limit);
}

/** Distinct, sorted filter values derived from the published projects. */
export function getProjectFilterOptions() {
  const published = getPublishedProjects();
  const unique = (values: string[]) =>
    Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );

  return {
    projectTypes: unique(published.map((p) => p.projectType)),
    markets: unique(published.map((p) => p.market)),
    locations: unique(published.map((p) => p.location)),
  };
}

export function formatCompletionDate(date: string): string {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}
