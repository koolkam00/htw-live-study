import PersonalizedGuide from '@/components/PersonalizedGuide';
import { getPersonalSummary } from '@/lib/personalized-data';

export const metadata = { title: 'Your race | Marathon Pacing Study', description: 'Twelve marathon pacing questions personalized by course, age group, selected time and optional earlier performance.' };
export default function YourRacePage() {
  const summary = getPersonalSummary();
  if (!summary) return <article className="prose"><h1>Your race</h1><p>The personalized analysis data is not available in this version.</p></article>;
  return <PersonalizedGuide summary={summary} />;
}
