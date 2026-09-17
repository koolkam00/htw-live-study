import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResearchQuestion from '@/components/ResearchQuestion';
import { getCourseNames, getIndividualCourseAnswer, slugifyCity } from '@/lib/course-data';

const slugify = slugifyCity;
export function generateStaticParams() { return getCourseNames().map(city => ({ city: slugify(city) })); }
export function generateMetadata({ params }: { params: { city: string } }) {
  const city = getCourseNames().find(city => slugify(city) === params.city);
  return { title: `${city || 'Course'} | Pace Notes` };
}
export default function CityPage({ params }: { params: { city: string } }) {
  const name = getCourseNames().find(city => slugify(city) === params.city);
  const individual = name && getIndividualCourseAnswer(name);
  if (individual) return <><ResearchQuestion question={individual} standalone /><p><Link href="/courses">All courses</Link></p></>;
  notFound();
}
