import { liveRows, type ResearchAnswer } from './research-data';
import { extensionForQuestion } from './extension-data';

export function slugifyCity(name: string) { return name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

export function getCourseNames() {
  const extension = extensionForQuestion('s3_course_breaks');
  return [...new Set([...liveRows('t1').map(row => String(row.city)), ...(extension?.answer.charts[0]?.rows.map(row => String(row.city)) || [])])].sort();
}

export function getIndividualCourseAnswer(city: string): ResearchAnswer | undefined {
  const pack = extensionForQuestion('s3_course_breaks');
  const spec = pack?.answer.charts[0];
  const rows = spec?.rows.filter(row => row.city === city);
  if (!pack || !spec || !rows?.length) return undefined;
  return {
    id: `course-${slugifyCity(city)}`, title: `How do runners pace ${city}?`, aliases: [],
    ...pack.answer,
    answer: `The ${city} profile shows where runners tend to change pace relative to their own marathon average. Each point is the median of the same complete-record cohort.`,
    detail: 'The profile pools available editions. It does not isolate the effect of hills, weather or route changes.',
    charts: [{ ...spec, title: `Pace through ${city}`, rows, filters: undefined }],
    dataset: { ...pack.answer.dataset!, n: Number(rows[0].n_value) },
  };
}
