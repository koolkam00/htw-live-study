import StudyFigure from '@/components/StudyFigure';
import { getStudyFigures } from '@/lib/study-figures';
import ResearchQuestion from '@/components/ResearchQuestion';
import { getStudyAnswer, getWallTimingAnswer } from '@/lib/research-data';

export const metadata = {
  title: 'Sustained slowdown | Marathon Pacing Study',
  description: 'Explore sustained slowdown thresholds, age, recorded ability, and patterns around personal bests.',
  alternates: { canonical: 'https://htw-live-study.vercel.app/slowdown' },
};

export default function Page() {
  const figures = getStudyFigures();
  return <>
    <section className="study-intro">
      <h1>Understanding sustained slowdown.</h1>
      <p>A focused study of one form of late-race slowing, within the wider analysis of marathon pacing.</p>
    </section>
    <ResearchQuestion question={getStudyAnswer()} />
    <ResearchQuestion question={getWallTimingAnswer()} />
    {figures.length ? figures.map(figure => <StudyFigure key={figure.id} figure={figure} />) : <p>Study figures are not available in this snapshot.</p>}
  </>;
}
