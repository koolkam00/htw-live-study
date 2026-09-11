import AnalysisIndex from '@/components/AnalysisIndex';
import LegacyAnalysisLink from '@/components/LegacyAnalysisLink';

export const metadata = { title: 'Your race | Marathon Pacing Study', description: 'Ten useful marathon analyses, with comparisons for your course, age and finish time.' };
export default function YourRacePage() {
  return <article className="analysis-directory"><LegacyAnalysisLink /><h1>Your race, one question at a time.</h1><p>The personalized guide now starts with ten focused analyses.</p><AnalysisIndex /></article>;
}
