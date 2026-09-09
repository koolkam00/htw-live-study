import type { ChartSpec } from './research-data';

export function filterOptions(spec: ChartSpec, index: number, selected: Record<string, string>): string[] {
  const filters = spec.filters || [];
  const relevant = spec.rows.filter(row => filters.slice(0, index).every(filter => String(row[filter.key] ?? '') === selected[filter.key]));
  return [...new Set(relevant.map(row => String(row[filters[index].key] ?? '')))].filter(Boolean);
}

export function resolveSelection(spec: ChartSpec, desired: Record<string, string> = {}): Record<string, string> {
  const selected: Record<string, string> = {};
  (spec.filters || []).forEach((filter, index) => {
    const options = filterOptions(spec, index, selected);
    selected[filter.key] = options.includes(desired[filter.key]) ? desired[filter.key]
      : filter.preferred && options.includes(filter.preferred) ? filter.preferred : options[0] || '';
  });
  return selected;
}
