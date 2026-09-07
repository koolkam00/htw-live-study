import StudyFigure from '@/components/StudyFigure';
import { getStudyFigures } from '@/lib/study-figures';

export const metadata = {
  title: 'Study figures | HTW Live Study',
  description: 'Explore the wall definition, age, ability, and patterns around personal bests.',
};

export default function Page() {
  const figures = getStudyFigures();
  return <>
    <section className="study-intro">
      <h1>Understanding the wall.</h1>
      <p>Six views of sustained slowing, using the study’s published results. Choose a comparison within each figure.</p>
    </section>
    {figures.length ? figures.map(figure => <StudyFigure key={figure.id} figure={figure} />) : <p>Study figures are not available in this snapshot.</p>}
  </>;
}

