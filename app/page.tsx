import { UnitLink as Link, MarathonDistance } from '@/components/UnitsProvider';
import AnalysisIndex from '@/components/AnalysisIndex';
import PacingPreview from '@/components/PacingPreview';
import WeatherIndex from '@/components/WeatherIndex';
import { getAnalysisStart } from '@/lib/analysis-server';
import { count } from '@/lib/personalized';
import CreatorCredit from '@/components/CreatorCredit';
import { getStudyEvidence } from '@/lib/research-data';

export default function Page() {
  const { summary, answers } = getAnalysisStart();
  const study = getStudyEvidence();
  if (!study || study.n !== summary.n || !Number.isSafeInteger(study.cohort.raw) || study.cohort.raw < summary.n) {
    throw new Error('Homepage record totals must match the current analytical cohort.');
  }
  return <div className="home">
    <section className="home-hero">
      <div className="hero-copy"><p className="eyebrow">A study of how marathons unfold</p><h1>Understand<br />your next<br /><span><MarathonDistance />.</span></h1><p className="hero-description">Millions of race results. Ten useful questions. Explore the patterns behind pacing, conditions and better finishes.</p><CreatorCredit /><Link className="button-primary" href="/analyses/pacing-pattern">Start with your pacing <span aria-hidden="true">↗</span></Link><a className="hero-secondary" href="#the-ten">Explore all ten analyses <span aria-hidden="true">↓</span></a></div>
      <PacingPreview answer={answers.find(answer => answer.id === 'profile')!} />
    </section>
    <section className="evidence-strip" aria-label="The data behind the study"><div><strong title={count(study.cohort.raw)}>{(study.cohort.raw / 1e6).toFixed(2)} million</strong><span>race records in the database</span></div><div><strong title={count(summary.n)}>{(summary.n / 1e6).toFixed(2)} million</strong><span>analyzed finishes</span></div><p>Pacing analyses use results that pass timing and race-quality checks.<br /><Link href="/methodology#data-quality">Why the totals differ <span aria-hidden="true">↗</span></Link></p></section>
    <section id="the-ten" className="home-analyses"><div className="section-intro"><p className="eyebrow">The essential ten</p><h2>Start with a question<br />that matters to you.</h2><p>Ranked by usefulness to a runner and strength of the available evidence. Start at one, or go straight to what you need.</p></div><AnalysisIndex /></section>
    <WeatherIndex />
    <section className="home-purpose"><p className="eyebrow">Why this study exists</p><div><h2>A finish time is only<br />part of the story.</h2><p>Pace Notes looks at the distance between the start and the finish. It makes race patterns easier to explore, so runners can ask better questions about their own marathons.</p><p>Compare by course, time, age or recorded gender where the data supports it. Each result shows who is included and what it can tell you.</p><Link className="text-link" href="/about">How we turn {count(summary.n)} finishes into understanding <span aria-hidden="true">↗</span></Link></div></section>
  </div>;
}
