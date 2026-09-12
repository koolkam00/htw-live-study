import Link from 'next/link';
import { formatNumber } from '@/lib/csv';
import { getCourseNames, getIndividualCourseAnswer, slugifyCity } from '@/lib/course-data';

export const metadata = { title: 'Courses | Marathon Pacing Study' };
export default function CoursesPage() {
  const names = getCourseNames();
  return <div className="prose">
    <h1>How does each course run?</h1>
    <p className="answer-detail">Pacing patterns and coverage for each city in the study.</p>
    {names.length ? <ul className="course-list">{names.map(city => {
      const individual = getIndividualCourseAnswer(city);
      return <li key={city}><Link href={`/courses/${slugifyCity(city)}`}><strong>{city}</strong><span className="study-meta" style={{ display: 'block' }}>{`${formatNumber(individual?.dataset?.n || 0, 'runners')} complete pacing profiles`}</span></Link></li>;
    })}</ul> : <p>Course results are not available in this snapshot.</p>}
  </div>;
}
