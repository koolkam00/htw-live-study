import Link from 'next/link';
import { liveRows } from '@/lib/research-data';
import { formatNumber } from '@/lib/csv';
import { getCourseNames, getIndividualCourseAnswer, slugifyCity } from '@/lib/course-data';

export const metadata = { title: 'Courses | Marathon Pacing Study' };
export default function CoursesPage() {
  const rows = liveRows('t1');
  const names = getCourseNames();
  return <div className="prose">
    <h1>How does each course run?</h1>
    <p className="answer-detail">Pacing patterns and coverage for each city in the study.</p>
    {names.length ? <ul className="course-list">{names.map(city => {
      const individual = getIndividualCourseAnswer(city);
      const legacy = rows.find(row => row.city === city);
      return <li key={city}><Link href={`/courses/${slugifyCity(city)}`}><strong>{city}</strong><span className="study-meta" style={{ display: 'block' }}>{individual
        ? `${formatNumber(individual.dataset!.n, 'runners')} complete pacing profiles`
        : `${formatNumber(Number(legacy?.n_records), 'runners')} finishes in the original snapshot`}</span></Link></li>;
    })}</ul> : <p>Course results are not available in this snapshot.</p>}
  </div>;
}
