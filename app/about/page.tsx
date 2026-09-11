import Link from 'next/link';
import { getAnalysisStart } from '@/lib/analysis-server';
import { count } from '@/lib/personalized';

export const metadata = { title: 'About the study | Marathon Pacing Study' };
export default function AboutPage() {
  const { summary } = getAnalysisStart();
  return <article className="about-page"><header className="directory-heading"><p className="eyebrow">About the study</p><h1>More understanding.<br /><span>Every kilometre.</span></h1><p>A marathon result tells you the time. This study helps you see the race.</p></header>
    <div className="about-body"><section><h2>Why it exists</h2><p>Runners make decisions about pace, targets and courses with incomplete information. The Marathon Pacing Study, created by Andrew Kam, makes large collections of race results understandable and useful to explore.</p><p>Its ten main analyses follow the questions a runner might ask before or after a race: how people pace, what follows different starts, how conditions compare, and where improvement appears.</p></section>
    <section><h2>What the data contains</h2><p>The current interactive analyses use {count(summary.n)} finishes with a complete set of usable splits, across {summary.cities.length - 1} cities. Those records come from the September 7, 2026 export. A finish is a performance, so one runner may appear more than once.</p><p>Times at successive checkpoints show average pace for each section. Supplied records also include age, recorded gender and candidate links between runners’ races. Weather estimates and course profiles add context where available.</p></section>
    <section><h2>What an answer means</h2><p>These are observed patterns. A fast opening and a fast finish can go together because a runner is fitter; that does not mean a faster start caused the improvement.</p><p>Each analysis shows the actual comparison group. If a narrow selection has too few records, any broader comparison is labeled. Missing ages, splits and route history stay missing.</p><p>The study is a way to investigate your race, not an individual training plan or a promise of a result.</p></section>
    <section><h2>Open to everyone</h2><p>The complete exports, source code and methods are publicly available. No account or decryption key is needed. Newer exports can be downloadable before they have passed the checks required for website calculations.</p><div className="about-actions"><a className="button-primary" href="https://github.com/koolkam00/htw-live-study/releases">Download the data <span aria-hidden="true">↗</span></a><Link className="text-link" href="/methodology">Read the methods <span aria-hidden="true">↗</span></Link></div></section>
    <section><h2>Begin with one question</h2><p>Start with the pacing pattern, then follow the next question or choose another of the ten.</p><Link className="text-link" href="/analyses/pacing-pattern">Explore your pacing pattern <span aria-hidden="true">↗</span></Link></section></div>
  </article>;
}
