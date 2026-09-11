import AnalysisIndex from '@/components/AnalysisIndex';

export const metadata = { title: 'The ten analyses | Marathon Pacing Study', description: 'Ten ranked questions to help you understand marathon pacing, courses, conditions and improvement.' };
export default function AnalysesPage() {
  return <section className="analyses-directory"><header className="directory-heading"><p className="eyebrow">One race. Ten ways to understand it.</p><h1>Find your<br /><span>next question.</span></h1><p>Our ten most useful analyses, in priority order. Each starts with a simple example. Change the comparison to make it relevant to your race.</p></header><AnalysisIndex /></section>;
}
