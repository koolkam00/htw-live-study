import Link from 'next/link';
import { liveRows } from '@/lib/research-data';
import { formatNumber } from '@/lib/csv';

export const metadata = { title: 'Courses | HTW Live Study' };
function slugifyCity(name: string) { return name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
export default function CoursesPage() {
  const rows = liveRows('t1');
  return <div className="prose">
    <h1>What changes by course?</h1>
    <p className="answer-detail">Pacing patterns and coverage for each city in the study.</p>
    {rows.length ? <ul className="course-list">{rows.map(row => <li key={String(row.city)}>
      <Link href={`/courses/${slugifyCity(String(row.city))}`}><strong>{row.city}</strong><span className="study-meta" style={{ display: 'block' }}>{row.years} · {formatNumber(Number(row.n_records), 'runners')} finishes</span></Link>
    </li>)}</ul> : <p>Course results are not available in this snapshot.</p>}
  </div>;
}
