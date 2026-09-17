import Link from 'next/link';
import PersonalizedGuide from '@/components/PersonalizedGuide';
import { getPersonalSummary } from '@/lib/personalized-data';

export const metadata = { title: 'Personalized research archive | Pace Notes' };
export default function ResearchGuidePage() {
  const summary = getPersonalSummary();
  return <><p className="archive-intro">Research archive · For a focused introduction, <Link href="/analyses">explore the ten essential analyses</Link>.</p>{summary ? <PersonalizedGuide summary={summary} /> : <p>The comparison data is unavailable.</p>}</>;
}
