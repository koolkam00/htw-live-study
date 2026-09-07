import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResearchQuestion from '@/components/ResearchQuestion';
import { getLive, liveRows, table, readJson, getCoursePacingChart, type ResearchAnswer } from '@/lib/research-data';
import { finite, formatNumber } from '@/lib/csv';

function slugify(name: string) { return name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
export function generateStaticParams() { return (getLive()?.filters?.cities || []).map((city: string) => ({ city: slugify(city) })); }
export function generateMetadata({ params }: { params: { city: string } }) {
  const row = liveRows('t1').find(row => slugify(String(row.city)) === params.city);
  return { title: `${row?.city || 'Course'} | Marathon Pacing Study` };
}
export default function CityPage({ params }: { params: { city: string } }) {
  const row = liveRows('t1').find(row => slugify(String(row.city)) === params.city);
  if (!row) notFound();
  const city = String(row.city);
  const segments = table('s3_course_breaks', 'course_section_elev_vs_pace.csv').filter(segment => segment.city === city);
  const chart = getCoursePacingChart(city);
  const ranked = segments.filter(segment => (finite(segment.mean_pace) ?? 0) > 0).sort((a, b) => Number(a.mean_pace) - Number(b.mean_pace));
  const fastest = ranked[0], slowest = ranked[ranked.length - 1];
  const question: ResearchAnswer = { id: `course-${params.city}`, title: `How do runners pace ${city}?`, aliases: [], available: chart.rows.length > 0,
    answer: fastest && slowest ? `Average section pace ranges from ${formatNumber(Number(fastest.mean_pace), 'min/km')} at ${fastest.seg_from_km}–${fastest.seg_to_km} km to ${formatNumber(Number(slowest.mean_pace), 'min/km')} at ${slowest.seg_from_km}–${slowest.seg_to_km} km.` : 'A complete section pacing profile is not yet available for this course.',
    detail: `${formatNumber(Number(row.n_records), 'runners')} finishes in the reported ${row.years} coverage window. This window does not imply complete coverage of every intervening year.`,
    method: ['The line compares each section’s mean pace with the distance-weighted course average. Below zero means faster; above zero means slower. The final 2.195 km is weighted at its actual length.', 'The coverage count reflects the main study snapshot. Section averages use the available course join, which can cover an earlier or smaller set of performances; chart sample sizes reflect that set.', 'Route versions, conditions, and fields can differ between years. A pooled course profile does not isolate terrain or show an individual runner’s pacing strategy.'],
    charts: chart.rows.length ? [chart] : [], published: chart.rows.length ? readJson('packs/s3_course_breaks/pack_meta.json')?.as_of || null : getLive()?.as_of || null,
    sources: [{ href: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/live.json`, label: 'City coverage' }, { href: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/packs/s3_course_breaks/tables/course_section_elev_vs_pace.csv`, label: 'Section pacing data (CSV)' }] };
  return <><ResearchQuestion question={question} standalone /><p><Link href="/courses">All courses</Link></p></>;
}
