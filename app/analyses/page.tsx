import AnalysisIndex from '@/components/AnalysisIndex';
import WeatherIndex from '@/components/WeatherIndex';
import { UnitLink as Link } from '@/components/UnitsProvider';

export const metadata = { title: 'Explore the analyses | Pace Notes', description: 'Ten essential runner questions, plus new weather comparisons grounded in race-edition evidence.' };
export default function AnalysesPage() {
  return <section className="analyses-directory"><header className="directory-heading"><p className="eyebrow">One race. A better understanding.</p><h1>Find your<br /><span>next question.</span></h1><p>Start with the essential ten, in priority order. Change the comparison to make it relevant to your race, or explore the new weather questions below.</p></header><AnalysisIndex /><WeatherIndex /><section className="analysis-request-callout"><div><p className="eyebrow">Your next question</p><h2>What else should we explore?</h2><p>Tell Andrew what you would like to learn from the marathon data.</p></div><Link className="text-link" href="/request-analysis">Request an analysis <span aria-hidden="true">↗</span></Link></section></section>;
}
