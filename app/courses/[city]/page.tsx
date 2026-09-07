import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResearchQuestion from '@/components/ResearchQuestion';
import { getLive, liveRows, table, type ResearchAnswer, type ChartSpec } from '@/lib/research-data';
import { formatNumber } from '@/lib/csv';

function slugify(name: string) { return name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
export function generateStaticParams() { return (getLive()?.filters?.cities || []).map((city: string) => ({ city: slugify(city) })); }
export function generateMetadata({ params }: { params: { city: string } }) {
  const row = liveRows('t1').find(row => slugify(String(row.city)) === params.city);
  return { title: `${row?.city || 'Course'} | HTW Live Study` };
}
export default function CityPage({ params }: { params: { city: string } }) {
  const row = liveRows('t1').find(row => slugify(String(row.city)) === params.city);
  if (!row) notFound();
  const city = String(row.city);
  const segments = table('s3_course_breaks', 'course_section_elev_vs_pace.csv').filter(segment => segment.city === city);
  const chart: ChartSpec = { title: 'Average pace through the course', unit: 'min/km', xLabel: 'Distance (km)', kind: 'line', xNumeric: true,
    rows: segments.map(segment => ({ label: segment.seg_to_km, value: segment.mean_pace, n_value: segment.n })),
    series: [{ key: 'value', label: 'Average pace' }], note: 'These are average segment paces, not the probability of first hitting the wall in a segment.' };
  const question: ResearchAnswer = { id: `course-${params.city}`, title: `Where do runners slow in ${city}?`, aliases: [], available: true,
    answer: `${formatNumber(Number(row.pct_htw), '%')} of recorded finishes in ${city} meet the wall definition.`,
    detail: `${formatNumber(Number(row.n_records), 'runners')} finishes in the reported ${row.years} coverage window. This window does not imply complete coverage of every intervening year.`,
    method: ['The wall percentage is the published city total. The line chart, where available, uses the mean pace of runners in each course segment.', 'Year-to-year routes, conditions, and fields can differ. This pooled view is not an elevation-adjusted course difficulty score or an individual wall-risk map.'],
    charts: segments.length ? [chart] : [], published: getLive()?.as_of || null,
    sources: [{ href: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/live.json`, label: 'City results' }] };
  return <><ResearchQuestion question={question} standalone /><p><Link href="/courses">All courses</Link></p></>;
}
