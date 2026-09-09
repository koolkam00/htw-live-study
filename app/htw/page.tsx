import StudyFigure from '@/components/StudyFigure';
import { getStudyFigures } from '@/lib/study-figures';
import ResearchQuestion from '@/components/ResearchQuestion';
import { getLive, getStudyAnswer, getWallTimingAnswer } from '@/lib/research-data';

export const metadata = {
  title: 'Hitting the wall | Marathon Pacing Study',
  description: 'Explore the wall definition, age, ability, and patterns around personal bests.',
};

export default function Page() {
  const figures = getStudyFigures();
  const live = getLive();
  return <>
    <section className="study-intro">
      <h1>Understanding the wall.</h1>
      <p>A focused study of one form of late-race slowing, within the wider analysis of marathon pacing.</p>
      {live?.corpus && <p className="study-meta">Original wall-study snapshot: {new Intl.NumberFormat('en-US').format(live.corpus.n_records)} finishes · {live.corpus.n_cities} cities · {live.corpus.n_races} represented editions. Published {new Date(live.as_of).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}. The newer pacing guide uses a separate export.</p>}
    </section>
    <ResearchQuestion question={getStudyAnswer()} />
    <ResearchQuestion question={getWallTimingAnswer()} />
    {figures.length ? figures.map(figure => <StudyFigure key={figure.id} figure={figure} />) : <p>Study figures are not available in this snapshot.</p>}
  </>;
}
