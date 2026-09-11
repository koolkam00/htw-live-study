import AnalysisIndex from '@/components/AnalysisIndex';
import WeatherIndex from '@/components/WeatherIndex';

export const metadata = { title: 'Explore the analyses | Marathon Pacing Study', description: 'Ten essential runner questions, plus new weather comparisons grounded in race-edition evidence.' };
export default function AnalysesPage() {
  return <section className="analyses-directory"><header className="directory-heading"><p className="eyebrow">One race. A better understanding.</p><h1>Find your<br /><span>next question.</span></h1><p>Start with the essential ten, in priority order. Change the comparison to make it relevant to your race, or explore the new weather questions below.</p></header><AnalysisIndex /><WeatherIndex /></section>;
}
