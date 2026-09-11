'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Briefcase, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/projects-data';

interface FilterOptions {
  projectTypes: string[];
  markets: string[];
  locations: string[];
}

interface ProjectsFilterProps {
  projects: Project[];
  options: FilterOptions;
}

const ALL = 'All';

function FilterGroup({
  label,
  values,
  active,
  onChange,
}: {
  label: string;
  values: string[];
  active: string;
  onChange: (value: string) => void;
}) {
  if (values.length === 0) return null;
  const groupId = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div role="group" aria-labelledby={groupId}>
      <p
        id={groupId}
        className="text-xs font-semibold uppercase tracking-wider text-steel-500 mb-2"
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {[ALL, ...values].map((value) => {
          const isActive = active === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              aria-pressed={isActive}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 focus-visible:ring-offset-2',
                isActive
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-white text-steel-700 border-steel-300 hover:border-navy-400 hover:text-navy-900'
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProjectsFilter({ projects, options }: ProjectsFilterProps) {
  const [projectType, setProjectType] = useState(ALL);
  const [market, setMarket] = useState(ALL);
  const [location, setLocation] = useState(ALL);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (projectType === ALL || p.projectType === projectType) &&
          (market === ALL || p.market === market) &&
          (location === ALL || p.location === location)
      ),
    [projects, projectType, market, location]
  );

  const hasActiveFilter =
    projectType !== ALL || market !== ALL || location !== ALL;

  const clearFilters = () => {
    setProjectType(ALL);
    setMarket(ALL);
    setLocation(ALL);
  };

  return (
    <div>
      <div className="bg-steel-50 border border-steel-200 rounded-xl p-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FilterGroup
            label="Project Type"
            values={options.projectTypes}
            active={projectType}
            onChange={setProjectType}
          />
          <FilterGroup
            label="Market"
            values={options.markets}
            active={market}
            onChange={setMarket}
          />
          <FilterGroup
            label="Location"
            values={options.locations}
            active={location}
            onChange={setLocation}
          />
        </div>

        {hasActiveFilter && (
          <div className="mt-5 pt-5 border-t border-steel-200 flex items-center justify-between gap-4">
            <p className="text-sm text-steel-600" aria-live="polite">
              Showing {filtered.length} of {projects.length} projects
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-navy-700 hover:text-navy-900 hover:bg-white"
            >
              <X className="mr-1.5 h-4 w-4" />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group flex flex-col bg-white border border-steel-200 rounded-xl overflow-hidden hover:border-navy-300 hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 focus-visible:ring-offset-2"
            >
              {project.featuredImage && (
                <div className="relative aspect-[16/10] bg-steel-100">
                  <Image
                    src={project.featuredImage}
                    alt={project.featuredImageAlt || project.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <span className="inline-flex self-start items-center rounded-full bg-navy-50 text-navy-800 px-2.5 py-1 text-xs font-semibold mb-3">
                  {project.market}
                </span>
                <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-navy-700 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-steel-600 leading-relaxed mb-4 flex-1">
                  {project.summary}
                </p>
                <dl className="space-y-1.5 text-sm text-steel-600 mb-4">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Project type</dt>
                    <Briefcase
                      className="h-4 w-4 shrink-0 text-steel-400"
                      aria-hidden="true"
                    />
                    <dd>{project.projectType}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Location</dt>
                    <MapPin
                      className="h-4 w-4 shrink-0 text-steel-400"
                      aria-hidden="true"
                    />
                    <dd>{project.location}</dd>
                  </div>
                </dl>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 group-hover:text-navy-500 transition-colors">
                  View project
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-14 border border-dashed border-steel-300 rounded-xl">
          <p className="text-steel-600 mb-4">
            No projects match the selected filters.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="border-navy-300 text-navy-900 hover:bg-navy-50"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
